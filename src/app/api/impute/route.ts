import { NextResponse } from 'next/server';
import lciAluminiumData from '@/data/lca-aluminium.json';
// --- NEW: Import the machine learning model coefficients ---
import modelCoefficients from '@/models/lr_coefficients.json';

// --- TYPE DEFINITIONS (Unchanged) ---
interface QuickCompareInput {
    recycledContent: number;
    gridEmissions: number;
    transportDistance: number;
    recyclingRate: number;
}

interface LcaResult {
    totalGwp: number;
    gwpBreakdown: {
        materialProduction: number;
        transport: number;
        gridEnergy: number;
    };
    totalEnergy: number;
    circularityScore: number;
}

// --- CORE CALCULATION LOGIC (UPDATED) ---
function calculateQuickCompareLCA(input: QuickCompareInput): LcaResult {
    const primaryProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_PRIMARY_ELCD_V1");
    const recycledProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_RECYCLED_ELCD_V1");

    if (!primaryProcess || !recycledProcess) {
        throw new Error("Core LCI process data for Aluminium is missing.");
    }

    const recycledRatio = input.recycledContent / 100;
    const primaryRatio = 1 - recycledRatio;

    // --- 1. GWP from Material Production (Unchanged) ---
    const materialGwpInGrams = (primaryRatio * primaryProcess.gCO2_per_kg) + (recycledRatio * recycledProcess.gCO2_per_kg);
    const materialGwp = materialGwpInGrams / 1000;

    // --- 2. Energy Calculation via ML Model Inference (THE CORE CHANGE for Day 4) ---
    const predictedEnergy = (modelCoefficients.coefficients.slope * input.recycledContent) + modelCoefficients.coefficients.intercept;
    // We use the predicted value instead of blending from the JSON file.
    const materialEnergy = predictedEnergy;

    // --- 3. GWP from Transport (Unchanged) ---
    const BASELINE_TRANSPORT_DISTANCE_KM = 500;
    const baselineTransportGwpInGrams = (primaryRatio * primaryProcess.transport_gCO2_per_kg) + (recycledRatio * recycledProcess.transport_gCO2_per_kg);
    const transportGwp = (baselineTransportGwpInGrams / 1000) * (input.transportDistance / BASELINE_TRANSPORT_DISTANCE_KM);

    // --- 4. GWP from Grid Energy (Now uses the predicted energy value) ---
    const gridGwp = materialEnergy * (input.gridEmissions / 1000);
    const totalGwp = materialGwp + transportGwp + gridGwp;

    // --- 5. Circularity Score Calculation (Unchanged from previous fix) ---
    const recycledContentNormalized = input.recycledContent / 100;
    const endOfLifeRecoveryNormalized = input.recyclingRate / 100;
    const reusePotentialNormalized = 0.3;
    const materialLossNormalized = 0.05;
    const circularityScore = 100 * (
        0.4 * recycledContentNormalized +
        0.3 * endOfLifeRecoveryNormalized +
        0.2 * reusePotentialNormalized +
        0.1 * (1 - materialLossNormalized)
    );

    return {
        totalGwp: parseFloat(totalGwp.toFixed(3)),
        gwpBreakdown: {
            materialProduction: parseFloat(materialGwp.toFixed(3)),
            transport: parseFloat(transportGwp.toFixed(3)),
            gridEnergy: parseFloat(gridGwp.toFixed(3)),
        },
        totalEnergy: parseFloat(materialEnergy.toFixed(3)),
        circularityScore: parseFloat(circularityScore.toFixed(1)),
    };
}

// --- API ENDPOINT HANDLER (UPDATED to reflect AI imputation) ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const projectInput: QuickCompareInput = body.project;

        if (
            projectInput?.recycledContent === undefined ||
            projectInput?.gridEmissions === undefined ||
            projectInput?.transportDistance === undefined ||
            projectInput?.recyclingRate === undefined
        ) {
            return NextResponse.json({ message: 'Missing required project parameters.' }, { status: 400 });
        }

        const lcaResult = calculateQuickCompareLCA(projectInput);

        const project_imputed = {
            ...projectInput,
            results: lcaResult,
        };

        // --- UPDATED: The metadata now explicitly states an AI model was used ---
        const imputation_meta = [{
            field: "energy_kWh_per_kg",
            method: "AI-assisted estimation",
            confidence: 0.85, // Confidence is higher as it's a model, not a simple rule
            source: modelCoefficients.model_name
        }];

        return NextResponse.json({
            project_imputed,
            imputation_meta
        });

    } catch (error: any) {
        console.error('API Error in /api/impute:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

