import React, { useState, useEffect } from 'react';

interface InputParams {
    metal: 'aluminium' | 'copper';
    recycledContent: number;
    transportDistanceKm: number;
    endOfLifeRecoveryRate: number;
}

const PRESET_PRIMARY_ALUMINIUM: InputParams = {
    metal: 'aluminium',
    recycledContent: 0.05,
    transportDistanceKm: 500,
    endOfLifeRecoveryRate: 0.85,
};

const PRESET_CIRCULAR_ALUMINIUM: InputParams = {
    metal: 'aluminium',
    recycledContent: 0.6,
    transportDistanceKm: 150,
    endOfLifeRecoveryRate: 0.95,
};

const InputPanel: React.FC = () => {
    const [params, setParams] = useState<InputParams>(PRESET_PRIMARY_ALUMINIUM);

    useEffect(() => {
        console.log('Input Parameters Updated:', params);
    }, [params]);

    const handleSliderChange = (field: keyof InputParams, value: string) => {
        setParams((current) => ({
            ...current,
            [field]: Number(value),
        }));
    };

    const handleSelectChange = (
        field: keyof InputParams,
        value: 'aluminium' | 'copper'
    ) => {
        setParams((current) => ({
            ...current,
            [field]: value,
        }));
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Scenario Inputs</h2>

            <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-300">Presets</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => setParams(PRESET_PRIMARY_ALUMINIUM)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Primary Aluminium
                    </button>
                    <button
                        onClick={() => setParams(PRESET_CIRCULAR_ALUMINIUM)}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Circular Aluminium
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="metal"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Metal
                    </label>
                    <select
                        id="metal"
                        value={params.metal}
                        onChange={(e) =>
                            handleSelectChange('metal', e.target.value as 'aluminium' | 'copper')
                        }
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="aluminium">Aluminium</option>
                        <option value="copper">Copper</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="recycledContent"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Recycled Content:{' '}
                        <span className="font-bold text-cyan-400">
              {Math.round(params.recycledContent * 100)}%
            </span>
                    </label>
                    <input
                        type="range"
                        id="recycledContent"
                        min="0"
                        max="1"
                        step="0.01"
                        value={params.recycledContent}
                        onChange={(e) => handleSliderChange('recycledContent', e.target.value)}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                </div>

                <div>
                    <label
                        htmlFor="transportDistanceKm"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Transport Distance:{' '}
                        <span className="font-bold text-cyan-400">
              {params.transportDistanceKm} km
            </span>
                    </label>
                    <input
                        type="range"
                        id="transportDistanceKm"
                        min="0"
                        max="2000"
                        step="10"
                        value={params.transportDistanceKm}
                        onChange={(e) =>
                            handleSliderChange('transportDistanceKm', e.target.value)
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                </div>

                <div>
                    <label
                        htmlFor="endOfLifeRecoveryRate"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        End-of-Life Recovery:{' '}
                        <span className="font-bold text-cyan-400">
              {Math.round(params.endOfLifeRecoveryRate * 100)}%
            </span>
                    </label>
                    <input
                        type="range"
                        id="endOfLifeRecoveryRate"
                        min="0"
                        max="1"
                        step="0.01"
                        value={params.endOfLifeRecoveryRate}
                        onChange={(e) =>
                            handleSliderChange('endOfLifeRecoveryRate', e.target.value)
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                </div>
            </div>
        </div>
    );
};

export default InputPanel;