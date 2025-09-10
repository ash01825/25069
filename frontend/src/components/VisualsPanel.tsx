import React from 'react';
import sankeyPlaceholder from '../assets/placeholder-sankey.png';

const VisualsPanel: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
                Material Flow Visualization
            </h2>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <img
                    src={sankeyPlaceholder}
                    alt="Sankey diagram placeholder"
                    className="w-full h-auto rounded opacity-60"
                />
            </div>
        </div>
    );
};

export default VisualsPanel;