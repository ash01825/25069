import React from 'react';
import KpiCard from './KpiCard';

const ResultsPanel: React.FC = () => {
    const kpiData = [
        { title: 'CO₂e Footprint', value: '--', unit: 'kg/kg' },
        { title: 'Energy Consumption', value: '--', unit: 'MJ/kg' },
        { title: 'Circularity Index', value: '--', unit: '%' },
        { title: 'Material Retention', value: '--', unit: '%' },
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
                Impact & Circularity Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {kpiData.map((kpi) => (
                    <KpiCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.value}
                        unit={kpi.unit}
                    />
                ))}
            </div>
        </div>
    );
};

export default ResultsPanel;