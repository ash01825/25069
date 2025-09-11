// src/components/StackedBar.tsx
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Type definition for the API result object
interface LcaResult {
    gwpBreakdown: {
        materialProduction: number;
        transport: number;
        gridEnergy: number;
    };
    // other fields are not needed by this component
}

// UPDATED Props to accept two pathways for comparison
interface StackedBarProps {
    primaryData: LcaResult;
    configuredData: LcaResult;
}

export function StackedBar({ primaryData, configuredData }: StackedBarProps) {
    // Format the data into the structure Recharts expects for side-by-side bars
    const data = [
        {
            pathway: "Primary Pathway",
            "Material Production": primaryData.gwpBreakdown.materialProduction,
            "Grid Energy": primaryData.gwpBreakdown.gridEnergy,
            "Transport": primaryData.gwpBreakdown.transport,
        },
        {
            pathway: "Configured Pathway",
            "Material Production": configuredData.gwpBreakdown.materialProduction,
            "Grid Energy": configuredData.gwpBreakdown.gridEnergy,
            "Transport": configuredData.gwpBreakdown.transport,
        },
    ]

    return (
        // Ensure the container has a defined height to prevent rendering issues
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pathway" />
                    <YAxis label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                        formatter={(value: number, name: string) => [`${value.toFixed(2)} kg CO₂e`, name]}
                        cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} // slate-100 with opacity
                    />
                    <Legend />
                    <Bar dataKey="Material Production" stackId="a" fill="#f59e0b" name="Material Production" />
                    <Bar dataKey="Grid Energy" stackId="a" fill="#3b82f6" name="Grid Energy" />
                    <Bar dataKey="Transport" stackId="a" fill="#10b981" name="Transport" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}