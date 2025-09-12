import { NextResponse } from 'next/server';

// --- Data & Model Imports ---
import lciAluminiumData from '@/data/lca-aluminium.json';
import modelCoefficients from '@/models/lr_coefficients.json';
import treeModel from '@/models/tree_model.json';

// --- Type Definitions ---

// For Quick Compare functionality
interface QuickCompareInput {
    recycledContent: number;
    gridEmissions: number;
    transportDistance: number;
    recyclingRate: number;
}

// For Custom Project functionality
interface CustomProjectInput {
    name: string;
    material: string;
    product_type: string;
    region: string;
    recycledContent?: number | null;
    energy_kWh_per_kg?: number | null;
    end_of_life_recycling_rate?: number | null;
}

// For the Decision Tree Model
type TreeNode = {
    feature?: string;
    threshold?: number;
    left?: TreeNode;
    right?: TreeNode;
    value?: number;
};
type FeatureInput = { [key: string]: number };


// --- LOGIC FOR QUICK COMPARE PAGE ---

function calculateQuickCompareLCA(input: QuickCompareInput) {
    const primaryProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_PRIMARY_ELCD_V1");
    const recycledProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_RECYCLED_ELCD_V1");

    if (!primaryProcess || !recycledProcess) {
        throw new Error("Core LCI process data for Aluminium is missing.");
    }

    const recycledRatio = input.recycledContent / 100;
    const primaryRatio = 1 - recycledRatio;

    const materialGwp = ((primaryRatio * primaryProcess.gCO2_per_kg) + (recycledRatio * recycledProcess.gCO2_per_kg)) / 1000;

    const predictedEnergy = (modelCoefficients.coefficients.slope * input.recycledContent) + modelCoefficients.coefficients.intercept;

    const transportGwp = (((primaryRatio * primaryProcess.transport_gCO2_per_kg) + (recycledRatio * recycledProcess.transport_gCO2_per_kg)) / 1000) * (input.transportDistance / 500);

    const gridGwp = predictedEnergy * (input.gridEmissions / 1000);
    const totalGwp = materialGwp + transportGwp + gridGwp;

    const circularityScore = 100 * (
        0.4 * (input.recycledContent / 100) +
        0.3 * (input.recyclingRate / 100) +
        0.2 * 0.3 + // reuse_potential_normalized
        0.1 * (1 - 0.05) // material_loss_normalized_inverse
    );

    return {
        totalGwp: parseFloat(totalGwp.toFixed(3)),
        gwpBreakdown: {
            materialProduction: parseFloat(materialGwp.toFixed(3)),
            transport: parseFloat(transportGwp.toFixed(3)),
            gridEnergy: parseFloat(gridGwp.toFixed(3)),
        },
        totalEnergy: parseFloat(predictedEnergy.toFixed(3)),
        circularityScore: parseFloat(circularityScore.toFixed(1)),
    };
}


// --- LOGIC FOR CUSTOM PROJECT PAGE (DAY 8 TASK) ---

function predictRecyclingRate(input: FeatureInput): number | null {
    let node: TreeNode = treeModel;
    while (node.value === undefined) {
        if (!node.feature || input[node.feature] === undefined || node.threshold === undefined) return null;
        node = input[node.feature] <= node.threshold ? (node.left as TreeNode) : (node.right as TreeNode);
    }
    return node.value;
}

function createModelInput(material: string, productType: string, region: string): FeatureInput {
    const all_features = [
        'material_Aluminium', 'material_Copper',
        'product_type_Automotive Components', 'product_type_Beverage Can',
        'product_type_Building Construction', 'product_type_Cookware',
        'product_type_Electronics (PCB)', 'product_type_Industrial Cable',
        'product_type_Packaging Foil',
        'region_EU', 'region_IN', 'region_NA', 'region_SEA'
    ];
    const input: FeatureInput = {};
    all_features.forEach(f => input[f] = 0);

    const material_key = `material_${material}`;
    const product_type_key = `product_type_${productType}`;
    const region_key = `region_${region}`;

    if(input.hasOwnProperty(material_key)) input[material_key] = 1;
    if(input.hasOwnProperty(product_type_key)) input[product_type_key] = 1;
    if(input.hasOwnProperty(region_key)) input[region_key] = 1;

    return input;
}

// --- UNIVERSAL API ENDPOINT HANDLER ---

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const project = body.project;

        // --- INTELLIGENT ROUTING LOGIC ---
        // Check for a key unique to the Quick Compare page's request
        if (project && typeof project.gridEmissions !== 'undefined') {
            // This is a request from the QUICK COMPARE page
            const lcaResult = calculateQuickCompareLCA(project as QuickCompareInput);
            const project_imputed = { ...project, results: lcaResult };
            const imputation_meta = [{
                field: "energy_kWh_per_kg",
                method: "AI-assisted estimation",
                confidence: 0.85,
                source: modelCoefficients.model_name
            }];
            return NextResponse.json({ project_imputed, imputation_meta });

        } else if (project && typeof project.material !== 'undefined') {
            // This is a request from the CUSTOM PROJECT page
            const customProject = project as CustomProjectInput;
            const project_imputed = { ...customProject };
            const imputation_meta: any[] = [];

            // Model 1: Linear Regression for Energy
            if ((project_imputed.energy_kWh_per_kg === null || project_imputed.energy_kWh_per_kg === undefined) && project_imputed.recycledContent !== undefined && project_imputed.recycledContent !== null) {
                project_imputed.energy_kWh_per_kg = parseFloat(((modelCoefficients.coefficients.slope * project_imputed.recycledContent) + modelCoefficients.coefficients.intercept).toFixed(2));
                imputation_meta.push({
                    field: "energy_kWh_per_kg",
                    method: "AI-assisted (Linear Regression)",
                    confidence: 0.85,
                    source: modelCoefficients.model_name
                });
            }

            // Model 2: Decision Tree for Recycling Rate
            if ((project_imputed.end_of_life_recycling_rate === null || project_imputed.end_of_life_recycling_rate === undefined)) {
                const modelInput = createModelInput(customProject.material, customProject.product_type, customProject.region);
                const prediction = predictRecyclingRate(modelInput);
                if (prediction !== null) {
                    project_imputed.end_of_life_recycling_rate = prediction;
                    imputation_meta.push({
                        field: "end_of_life_recycling_rate",
                        method: "AI-assisted (Decision Tree)",
                        confidence: 0.75,
                        source: "Internal Model from ELCD/USLCI sample data"
                    });
                }
            }

            return NextResponse.json({ project_imputed, imputation_meta });
        }

        // If the request doesn't match either format
        return NextResponse.json({ message: 'Invalid project data format.' }, { status: 400 });

    } catch (error: any) {
        console.error('API Error in /api/impute:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

