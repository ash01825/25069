// src/app/api/impute/route.ts
// Final code for Day 2: Adapted to the original lca-aluminium.json structure

import { NextResponse } from 'next/server';
import lciAluminiumData from '@/data/lca-aluminium.json';

// --- TYPE DEFINITIONS ---
interface QuickCompareInput {
    recycledContent: number; // Percentage (0-100)
    gridEmissions: number;   // gCO2e/kWh
    transportDistance: number; // km
}

interface LcaResult {
    totalGwp: number; // in kg CO2e
    gwpBreakdown: {
        materialProduction: number;
        transport: number;
        gridEnergy: number;
    };
    totalEnergy: number; // in kWh
    circularityScore: number;
}

// --- CORE CALCULATION LOGIC ---
function calculateQuickCompareLCA(input: QuickCompareInput): LcaResult {
    // ADAPTATION: Using the exact process_id from your original file.
    const primaryProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_PRIMARY_ELCD_V1");
    const recycledProcess = lciAluminiumData.processes.find(p => p.process_id === "AL_INGOT_RECYCLED_ELCD_V1");

    if (!primaryProcess || !recycledProcess) {
        throw new Error("Core LCI process data is missing or has incorrect process_id in lca-aluminium.json.");
    }

    const recycledRatio = input.recycledContent / 100;
    const primaryRatio = 1 - recycledRatio;

    // 1. Calculate GWP from Material Production
    // ADAPTATION: Accessing gCO2_per_kg directly and converting from grams to kg.
    const materialGwpInGrams = (primaryRatio * primaryProcess.gCO2_per_kg) + (recycledRatio * recycledProcess.gCO2_per_kg);
    const materialGwp = materialGwpInGrams / 1000;

    // ADAPTATION: Accessing energy_kWh_per_kg directly.
    const materialEnergy = (primaryRatio * primaryProcess.energy_kWh_per_kg) + (recycledRatio * recycledProcess.energy_kWh_per_kg);

    // 2. Calculate GWP from Transport
    // ADAPTATION: Using the transport_gCO2_per_kg value from the JSON.
    // The note in your JSON implies the value is a baseline for 500km. We will use that.
    const BASELINE_TRANSPORT_DISTANCE_KM = 500;
    const baselineTransportGwpInGrams = (primaryRatio * primaryProcess.transport_gCO2_per_kg) + (recycledRatio * recycledProcess.transport_gCO2_per_kg);
    const transportGwp = (baselineTransportGwpInGrams / 1000) * (input.transportDistance / BASELINE_TRANSPORT_DISTANCE_KM);

    // 3. Calculate GWP from Grid Energy
    const gridGwp = materialEnergy * (input.gridEmissions / 1000); // Convert g to kg

    // 4. Sum up the total GWP
    const totalGwp = materialGwp + transportGwp + gridGwp;

    // 5. Calculate Circularity Score (logic is unchanged)
    const recycledContentNormalized = input.recycledContent / 100;
    const endOfLifeRecoveryNormalized = 0.85; // Placeholder for Sprint 2
    const reusePotentialNormalized = 0.5; // Placeholder
    const materialLossNormalized = 0.05; // Placeholder

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

// --- API ENDPOINT HANDLER (No changes needed here) ---
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const projectInput: QuickCompareInput = body.project;

        if (projectInput?.recycledContent === undefined || projectInput?.gridEmissions === undefined || projectInput?.transportDistance === undefined) {
            return NextResponse.json({ message: 'Missing required project parameters.' }, { status: 400 });
        }

        const lcaResult = calculateQuickCompareLCA(projectInput);

        const project_imputed = {
            ...projectInput,
            results: lcaResult,
        };

        const imputation_meta = [{
            field: "results",
            method: "Rule-based deterministic calculation from LCI data",
            confidence: 0.6,
            source: "CircularMetal LCA v1 Calculator"
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