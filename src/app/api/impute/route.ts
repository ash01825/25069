import { NextResponse } from 'next/server';
import modelCoefficients from '@/models/lr_coefficients.json';
import { createModelInput, predictRecyclingRate } from '@/lib/interface';

// --- TYPE DEFINITIONS ---
// This defines the structure of the incoming project data from the frontend.
// It's more generic now to handle both Quick Compare and Custom Projects.
interface Project {
    name: string;
    // --- Fields for the Linear Regression Energy Model ---
    recycledContent?: number; // e.g., 60 for 60%
    energy_kWh_per_kg?: number | null; // Can be null, which we need to impute

    // --- Fields for the Decision Tree Recycling Rate Model ---
    material?: string; // e.g., "Aluminium"
    product_type?: string; // e.g., "Beverage Can"
    region?: string; // e.g., "EU"
    end_of_life_recycling_rate?: number | null; // Can be null, which we need to impute

    // Other project fields can go here
    [key: string]: any;
}

interface ImputationMetadata {
    field: string;
    method: string;
    confidence: number;
    source: string;
}

// --- API ENDPOINT HANDLER (The Core Update) ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const project: Project = body.project;

        if (!project) {
            return NextResponse.json({ message: 'Missing project data in request body.' }, { status: 400 });
        }

        // Initialize our outputs
        const project_imputed = { ...project };
        const imputation_meta: ImputationMetadata[] = [];

        // --- MODEL 1: ENERGY IMPUTATION (Linear Regression from Sprint 1) ---
        // If energy is missing but we have recycledContent, we impute it.
        if ((project.energy_kWh_per_kg === null || project.energy_kWh_per_kg === undefined) && project.recycledContent !== undefined) {
            const predictedEnergy = (modelCoefficients.coefficients.slope * project.recycledContent) + modelCoefficients.coefficients.intercept;
            project_imputed.energy_kWh_per_kg = parseFloat(predictedEnergy.toFixed(3));

            imputation_meta.push({
                field: "energy_kWh_per_kg",
                method: "AI-assisted (Linear Regression)",
                confidence: 0.85,
                source: modelCoefficients.model_name
            });
        }

        // --- MODEL 2: RECYCLING RATE IMPUTATION (Decision Tree for Day 8) ---
        // If recycling rate is missing but we have the required inputs, we impute it.
        if ((project.end_of_life_recycling_rate === null || project.end_of_life_recycling_rate === undefined) && project.material && project.product_type && project.region) {

            // Step 1: Convert user-friendly input into the one-hot encoded format our model needs.
            const modelInput = createModelInput(project.material, project.product_type, project.region);

            // Step 2: Get the prediction from our decision tree.
            const predictedRate = predictRecyclingRate(modelInput);

            if (predictedRate !== null) {
                project_imputed.end_of_life_recycling_rate = predictedRate;

                imputation_meta.push({
                    field: "end_of_life_recycling_rate",
                    method: "AI-assisted (Decision Tree)",
                    confidence: 0.75, // Confidence can be adjusted based on model performance
                    source: "Internal Model from ELCD/USLCI sample data"
                });
            }
        }

        // --- FINAL RESPONSE ---
        // Return the project object (now with imputed values) and the metadata
        // explaining what we imputed and how.
        return NextResponse.json({
            project_imputed,
            imputation_meta
        });

    } catch (error: any) {
        console.error('API Error in /api/impute:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
