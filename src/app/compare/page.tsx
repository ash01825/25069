"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Download, Info } from "lucide-react"
import Link from "next/link"
import { StackedBar } from "@/components/StackedBar"
import { Sankey } from "@/components/Sankey"
import { ImputedBadge } from "@/components/ImputedBadge"

interface ProjectConfig {
  recycledContent: number
  gridEmissions: number
  transportDistance: number
  recyclingRate: number
}

export default function ComparePage() {
  const [config, setConfig] = useState<ProjectConfig>({
    recycledContent: 10,
    gridEmissions: 450,
    transportDistance: 500,
    recyclingRate: 75,
  })

  const handleConfigChange = (field: keyof ProjectConfig, value: number) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)

    // TODO: Call /api/impute with new configuration
    console.log("Configuration updated:", newConfig)
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Calculate circularity score based on the specification formula
  const calculateCircularityScore = () => {
    const recycledNorm = config.recycledContent / 100
    const recyclingNorm = config.recyclingRate / 100
    const reuseNorm = 0.3 // Mock reuse potential
    const lossNorm = 1 - config.transportDistance / 5000 // Inverse of material loss

    return Math.round(100 * (0.4 * recycledNorm + 0.3 * recyclingNorm + 0.2 * reuseNorm + 0.1 * lossNorm))
  }

  const circularityScore = calculateCircularityScore()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-slate-900">Quick Compare: Primary vs Recycled Aluminium</h1>
            </div>
            <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export to PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Interactive Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Process Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Recycled Content Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">% Recycled Content</label>
                    <span className="text-sm text-slate-600">{config.recycledContent}%</span>
                  </div>
                  <Slider
                    value={[config.recycledContent]}
                    onValueChange={(value) => handleConfigChange("recycledContent", value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Grid Emissions Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700">Grid Emissions</label>
                      <ImputedBadge confidence={85} />
                    </div>
                    <span className="text-sm text-slate-600">{config.gridEmissions} gCO₂/kWh</span>
                  </div>
                  <Slider
                    value={[config.gridEmissions]}
                    onValueChange={(value) => handleConfigChange("gridEmissions", value[0])}
                    max={1000}
                    step={25}
                    className="w-full"
                  />
                </div>

                {/* Transport Distance Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Transport Distance</label>
                    <span className="text-sm text-slate-600">{config.transportDistance} km</span>
                  </div>
                  <Slider
                    value={[config.transportDistance]}
                    onValueChange={(value) => handleConfigChange("transportDistance", value[0])}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* End-of-Life Recycling Rate Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">End-of-Life Recycling Rate</label>
                    <span className="text-sm text-slate-600">{config.recyclingRate}%</span>
                  </div>
                  <Slider
                    value={[config.recyclingRate]}
                    onValueChange={(value) => handleConfigChange("recyclingRate", value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Visualizations */}
          <div className="space-y-6">
            {/* GWP Stacked Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Global Warming Potential (kg CO₂e)</CardTitle>
              </CardHeader>
              <CardContent>
                <StackedBar config={config} />
              </CardContent>
            </Card>

            {/* Sankey Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Material Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Sankey config={config} />
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Circularity Score</p>
                    <p className="text-3xl font-bold text-blue-600">{circularityScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">out of 100</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Recommendation</p>
                      <p className="text-sm text-green-700">
                        {config.recycledContent < 50
                          ? "Increasing recycled content has the largest impact on reducing GWP and improving circularity."
                          : config.gridEmissions > 500
                            ? "Switching to renewable energy grid would significantly reduce carbon footprint."
                            : "Consider optimizing transport distance to further improve environmental performance."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
