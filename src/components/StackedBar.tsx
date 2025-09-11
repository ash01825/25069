"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface StackedBarProps {
  config: {
    recycledContent: number
    gridEmissions: number
    transportDistance: number
    recyclingRate: number
  }
}

export function StackedBar({ config }: StackedBarProps) {
  // Calculate mock GWP values based on configuration
  const calculateGWP = () => {
    const baseEnergy = 15 - (config.recycledContent / 100) * 10 // Recycled content reduces energy
    const energyGWP = baseEnergy * (config.gridEmissions / 1000)
    const transportGWP = (config.transportDistance / 1000) * 0.5
    const smeltingGWP = 8 - (config.recycledContent / 100) * 6 // Less smelting for recycled
    const recyclingGWP = (config.recyclingRate / 100) * 2

    return [
      {
        pathway: "Primary Al",
        energy: energyGWP + 5,
        transport: transportGWP + 1,
        smelting: smeltingGWP + 3,
        recycling: 0.5,
      },
      {
        pathway: "Recycled Al",
        energy: energyGWP,
        transport: transportGWP,
        smelting: smeltingGWP,
        recycling: recyclingGWP,
      },
    ]
  }

  const data = calculateGWP()

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="pathway" />
          <YAxis label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} kg CO₂e`, ""]}
            labelFormatter={(label) => `Pathway: ${label}`}
          />
          <Legend />
          <Bar dataKey="energy" stackId="a" fill="#3b82f6" name="Energy" />
          <Bar dataKey="transport" stackId="a" fill="#10b981" name="Transport" />
          <Bar dataKey="smelting" stackId="a" fill="#f59e0b" name="Smelting" />
          <Bar dataKey="recycling" stackId="a" fill="#8b5cf6" name="Recycling" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
