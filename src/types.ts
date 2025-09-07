/// src/types.ts

/**
 * Generic wrapper for values that might be user-set or system-guessed.
 * `isEstimated` tells us if it’s an assumption, and `confidence` (0–1) is optional.
 */
export type EstimatedValue<T> = {
    value: T;
    isEstimated: boolean;
    confidence?: number; // e.g. 0.9 = ~90% sure
};

// ===================================================================
// 1. INPUTS: all knobs/sliders the user can control.
// This is basically the contract between the frontend UI and the LCA engine.
// ===================================================================
export interface InputParams {
    metal: 'aluminium' | 'copper';

    // share of recycled stuff that ends up in the product (0–1).
    recycledContentFraction: EstimatedValue<number>;

    // how far the metal travels in the supply chain (in km).
    transportDistanceKm: EstimatedValue<number>;

    // how the production energy is split.
    energyMix: {
        // gridFraction = share from grid (fossil heavy).
        // the rest (1 - gridFraction) we assume is clean/renewable.
        gridFraction: EstimatedValue<number>;
    };

    // how much of the product actually gets recovered/recycled at end of life (0–1).
    endOfLifeRecoveryRate: EstimatedValue<number>;
}

// ===================================================================
// 2. FACTORS: static science/industry numbers from JSON.
// Think of these as constants/rules for each metal type.
// ===================================================================
export interface LcaFactors {
    reusePotentialFraction: number; // 0–1, how much of it can be reused

    // values are per kg of metal
    primaryProduction: {
        mining_energy_MJ: number;
        mining_direct_emissions_CO2e: number;
        processing_energy_MJ: number;
        EF_energy_grid_CO2e_per_MJ: number; // emission factor for grid energy
    };
    recycling: {
        recycling_credit_CO2e: number; // negative = emissions saved
        recycling_energy_MJ: number;
    };
    transport: {
        EF_transport_CO2e_per_tkm: number; // per tonne-km
    };
    otherImpacts: {
        water_m3: number; // water use per kg final product
    };
}

// ===================================================================
// 3. RESULTS: what the engine spits out for the frontend.
// Designed to be plug-and-play with UI (cards, charts, Sankey).
// ===================================================================
export interface LcaResult {
    summary: {
        totalCO2e_kg: number;
        totalEnergy_MJ: number;
        totalWater_m3: number;
        circularityIndex: number; // 0–100 score
    };
    breakdown: {
        co2e: {
            mining: number;
            processing: number;
            transport: number;
            recyclingCredit: number; // negative
        };
        energy: {
            mining: number;
            processing: number;
            recycling: number;
        };
    };
    sankey: {
        nodes: { name: string }[];
        links: { source: number; target: number; value: number }[];
    };
}

// ===================================================================
// 4. RECOMMENDATIONS: quick wins/advice based on results.
// ===================================================================
export interface Recommendation {
    id: 'increase-recycling' | 'improve-energy-mix' | 'enhance-recovery';
    title: string;
    description: string;
    projectedSavings: {
        co2e_percent_reduction: number;
    };
}