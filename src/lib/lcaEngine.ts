import type { InputParams, LcaFactors, LcaResult } from '../types';
import allFactors from '../data/lcaFactors.json';

// ===================================================================
// Core impact calculations (CO2, energy, water).
// Basically crunches numbers using user inputs + constants.
// ===================================================================
function computeImpacts(inputs: InputParams, factors: LcaFactors) {
    const { recycledContentFraction, transportDistanceKm, energyMix } = inputs;

    // how much is virgin vs recycled
    const primaryMaterialShare = 1 - recycledContentFraction.value;

    // --- CO2e (kg per kg metal) ---
    const co2e_mining =
        primaryMaterialShare *
        (factors.primaryProduction.mining_direct_emissions_CO2e +
            factors.primaryProduction.mining_energy_MJ *
            factors.primaryProduction.EF_energy_grid_CO2e_per_MJ *
            energyMix.gridFraction.value);

    const co2e_processing =
        primaryMaterialShare *
        (factors.primaryProduction.processing_energy_MJ *
            factors.primaryProduction.EF_energy_grid_CO2e_per_MJ *
            energyMix.gridFraction.value);

    // 1kg = 0.001 tonne for transport calc
    const co2e_transport =
        transportDistanceKm.value * 0.001 * factors.transport.EF_transport_CO2e_per_tkm;

    const co2e_recyclingCredit =
        recycledContentFraction.value * factors.recycling.recycling_credit_CO2e;

    const totalCO2e = co2e_mining + co2e_processing + co2e_transport + co2e_recyclingCredit;

    // --- Energy (MJ per kg) ---
    const energy_primary =
        primaryMaterialShare *
        (factors.primaryProduction.mining_energy_MJ +
            factors.primaryProduction.processing_energy_MJ);

    const energy_recycling =
        recycledContentFraction.value * factors.recycling.recycling_energy_MJ;

    const totalEnergy = energy_primary + energy_recycling;

    // --- Water (m³ per kg) ---
    const totalWater = factors.otherImpacts.water_m3;

    return {
        totalCO2e,
        totalEnergy,
        totalWater,
        breakdown: {
            co2e: {
                mining: co2e_mining,
                processing: co2e_processing,
                transport: co2e_transport,
                recyclingCredit: co2e_recyclingCredit,
            },
            energy: {
                mining: primaryMaterialShare * factors.primaryProduction.mining_energy_MJ,
                processing: primaryMaterialShare * factors.primaryProduction.processing_energy_MJ,
                recycling: energy_recycling,
            },
        },
    };
}

// ===================================================================
// Circularity Index (0–100).
// quick weighted sum: 40% recycled, 30% reuse potential, 30% recovery.
// ===================================================================
function computeCircularityIndex(inputs: InputParams, factors: LcaFactors): number {
    const { recycledContentFraction, endOfLifeRecoveryRate } = inputs;

    const recycledContentComponent = 0.4 * recycledContentFraction.value;
    const reusePotentialComponent = 0.3 * factors.reusePotentialFraction;
    const materialRetentionComponent = 0.3 * endOfLifeRecoveryRate.value;

    const index = (recycledContentComponent + reusePotentialComponent + materialRetentionComponent) * 100;

    return Math.round(index);
}

// ===================================================================
// Sankey diagram prep.
// just building nodes + links from flows (primary/recycled -> product -> EoL).
// ===================================================================
function generateSankeyData(inputs: InputParams) {
    const { recycledContentFraction, endOfLifeRecoveryRate } = inputs;

    const primaryShare = 1 - recycledContentFraction.value;
    const landfillShare = 1 - endOfLifeRecoveryRate.value;

    const nodes = [
        { name: 'Virgin Material' },    // 0
        { name: 'Recycled Scrap' },     // 1
        { name: 'Processing' },         // 2
        { name: 'Final Product' },      // 3
        { name: 'End of Life' },        // 4
        { name: 'Recovered' },          // 5
        { name: 'Landfilled' },         // 6
    ];

    const links = [
        { source: 0, target: 2, value: primaryShare },
        { source: 1, target: 2, value: recycledContentFraction.value },
        { source: 2, target: 3, value: 1.0 },
        { source: 3, target: 4, value: 1.0 },
        { source: 4, target: 5, value: endOfLifeRecoveryRate.value },
        { source: 4, target: 6, value: landfillShare },
    ];

    // strip out ~0 flows (avoids chart glitches)
    const validLinks = links.filter(link => link.value > 0.001);

    return {
        nodes,
        links: validLinks,
    };
}

// ===================================================================
// main orchestrator fn: runs everything and spits out a full LCA result.
// ===================================================================
export function calculateLCA(inputs: InputParams): LcaResult {
    const factors: LcaFactors = allFactors[inputs.metal];
    const impacts = computeImpacts(inputs, factors);
    const circularityIndex = computeCircularityIndex(inputs, factors);
    const sankeyData = generateSankeyData(inputs);

    return {
        summary: {
            totalCO2e_kg: impacts.totalCO2e,
            totalEnergy_MJ: impacts.totalEnergy,
            totalWater_m3: impacts.totalWater,
            circularityIndex: circularityIndex,
        },
        breakdown: impacts.breakdown,
        sankey: sankeyData,
    };
}