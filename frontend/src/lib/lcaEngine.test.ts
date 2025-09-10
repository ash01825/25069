import { describe, it, expect } from 'vitest';
import { calculateLCA } from './lcaEngine';
import type { InputParams } from '../types';

describe('LCA Engine', () => {

    // Case 1: aluminium, no recycling (100% virgin), full grid power, some transport.
    // good sanity check for primary production numbers.
    it('handles pure primary aluminium scenario', () => {
        const testInputs: InputParams = {
            metal: 'aluminium',
            recycledContentFraction: { value: 0, isEstimated: false },
            transportDistanceKm: { value: 100, isEstimated: false },
            energyMix: {
                gridFraction: { value: 1.0, isEstimated: false },
            },
            endOfLifeRecoveryRate: { value: 0.8, isEstimated: false },
        };

        const result = calculateLCA(testInputs);

        // summary KPIs
        expect(result.summary.totalCO2e_kg).toBeCloseTo(21.31); // float precision → toBeCloseTo
        expect(result.summary.totalEnergy_MJ).toBeCloseTo(180);
        expect(result.summary.circularityIndex).toBe(51);

        // sankey sanity: should NOT have recycled scrap flow (since value=0)
        const recycledLink = result.sankey.links.find(link => link.source === 1);
        expect(recycledLink).toBeUndefined();
    });

    // Case 2: copper with heavy recycling, partial clean energy, less transport.
    // checks recycling credit, energy mix, and copper-specific factors.
    it('handles high-recycling copper scenario', () => {
        const testInputs: InputParams = {
            metal: 'copper',
            recycledContentFraction: { value: 0.75, isEstimated: false },
            transportDistanceKm: { value: 50, isEstimated: false },
            energyMix: {
                gridFraction: { value: 0.5, isEstimated: false },
            },
            endOfLifeRecoveryRate: { value: 0.9, isEstimated: false },
        };

        const result = calculateLCA(testInputs);

        // summary KPIs
        expect(result.summary.totalCO2e_kg).toBeCloseTo(-2.1575); // negative → recycling beats emissions
        expect(result.summary.totalEnergy_MJ).toBeCloseTo(33.75);
        expect(result.summary.circularityIndex).toBe(83);

        // breakdown sanity: recycling credit should be a decent negative
        expect(result.breakdown.co2e.recyclingCredit).toBeCloseTo(-3.6);

        // sankey sanity: virgin material link should be ~0.25 (since 25% virgin)
        const primaryLink = result.sankey.links.find(link => link.source === 0);
        expect(primaryLink?.value).toBeCloseTo(0.25);
    });
});