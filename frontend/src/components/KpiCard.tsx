import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    unit: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-105 hover:border-cyan-400">
            <p className="text-sm text-gray-400 mb-2">{title}</p>
            <div className="flex items-baseline">
        <span className="text-2xl sm:text-3xl font-bold text-white mr-2">
          {value}
        </span>
                <span className="text-sm text-gray-300">{unit}</span>
            </div>
        </div>
    );
};

export default KpiCard;