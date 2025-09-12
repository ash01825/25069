"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StackedBar } from "@/components/StackedBar"
import { Sankey } from "@/components/Sankey"

// --- Types & Mock Engine (unchanged) ---
interface ProjectConfig {
  recycledContent: number
  gridEmissions: number
  transportDistance: number
  recyclingRate: number
}
interface LcaResult {
  totalGwp: number
  gwpBreakdown: { materialProduction: number; transport: number; gridEnergy: number }
  totalEnergy: number
  circularityScore: number
}
interface FullProject {
  inputs: ProjectConfig
  outputs: LcaResult
}
interface DeltaMetrics {
  gwp_delta: number
  gwp_delta_percent: number
  circularity_score_delta: number
}
const calculateMockMetrics = (config: ProjectConfig): LcaResult => {
  const primaryEnergyBaseline = 15.5
  const recycledEnergyBaseline = 0.78
  const materialEnergy =
    primaryEnergyBaseline - (config.recycledContent / 100) * (primaryEnergyBaseline - recycledEnergyBaseline)

  const primaryGwpBaseline = 8.5
  const recycledGwpBaseline = 0.425
  const materialProductionGwp =
    primaryGwpBaseline - (config.recycledContent / 100) * (primaryGwpBaseline - recycledGwpBaseline)

  const transportGwp = (config.transportDistance / 500) * 0.0125
  const gridEnergyGwp = materialEnergy * (config.gridEmissions / 1000)

  const totalGwp = materialProductionGwp + transportGwp + gridEnergyGwp
  const recycledContentNormalized = config.recycledContent / 100
  const endOfLifeRecoveryNormalized = config.recyclingRate / 100
  const circularityScore =
    100 * (0.4 * recycledContentNormalized + 0.3 * endOfLifeRecoveryNormalized + 0.2 * 0.3 + 0.1 * 0.95)

  return {
    totalGwp,
    gwpBreakdown: { materialProduction: materialProductionGwp, transport: transportGwp, gridEnergy: gridEnergyGwp },
    totalEnergy: materialEnergy,
    circularityScore: parseFloat(circularityScore.toFixed(1)),
  }
}

export default function ComparePathwaysPage({ params }: { params: { id: string } }) {
  const [originalProject, setOriginalProject] = useState<FullProject | null>(null)
  const [comparisonProject, setComparisonProject] = useState<FullProject | null>(null)
  const [deltaMetrics, setDeltaMetrics] = useState<DeltaMetrics | null>(null)

  useEffect(() => {
    const originalConfig: ProjectConfig = {
      recycledContent: 75,
      gridEmissions: 450,
      transportDistance: 450,
      recyclingRate: 75,
    }
    const comparisonConfig: ProjectConfig = {
      ...originalConfig,
      recycledContent: Math.min(originalConfig.recycledContent + 20, 100),
      gridEmissions: Math.max(originalConfig.gridEmissions - 200, 100),
      recyclingRate: Math.min(originalConfig.recyclingRate + 10, 100),
    }

    const originalOutputs = calculateMockMetrics(originalConfig)
    const comparisonOutputs = calculateMockMetrics(comparisonConfig)

    setOriginalProject({ inputs: originalConfig, outputs: originalOutputs })
    setComparisonProject({ inputs: comparisonConfig, outputs: comparisonOutputs })

    const gwp_delta = comparisonOutputs.totalGwp - originalOutputs.totalGwp
    const gwp_delta_percent = (gwp_delta / originalOutputs.totalGwp) * 100
    const circularity_score_delta = comparisonOutputs.circularityScore - originalOutputs.circularityScore
    setDeltaMetrics({ gwp_delta, gwp_delta_percent, circularity_score_delta })
  }, [params.id])

  const handleExportPDF = () => window.print()

  if (!originalProject || !comparisonProject || !deltaMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F0A] via-[#122315] to-[#1C2B1C] flex items-center justify-center">
        <Skeleton className="w-64 h-8" />
      </div>
    )
  }

  // Reusable scroll animation wrapper
  const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F0A] via-[#122315] to-[#1C2B1C] text-white">
      {/* Header */}
      <motion.header
        className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 print:hidden"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/project/${params.id}`}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Compare Pathways</h1>
          </div>
          <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* Stacked Bar */}
        <ScrollReveal>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#F8F4ED]">
            <StackedBar primaryData={originalProject.outputs} configuredData={comparisonProject.outputs} />
          </div>
        </ScrollReveal>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Original */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              <h2 className="text-center text-lg font-semibold">Original Pathway</h2>
              <Card className="bg-[#122315] border-white/10 hover:scale-[1.02] transition">
                <CardContent><Sankey config={originalProject.inputs} data={originalProject.outputs} /></CardContent>
              </Card>
            </div>
          </ScrollReveal>

          {/* Delta Metrics */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-6 flex flex-col justify-center">
              <h2 className="text-center text-lg font-semibold">Impact Comparison</h2>
              <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-600 hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  {deltaMetrics.gwp_delta_percent < 0 ? (
                    <TrendingDown className="w-6 h-6 mx-auto text-green-400" />
                  ) : (
                    <TrendingUp className="w-6 h-6 mx-auto text-red-400" />
                  )}
                  <p className="mt-2 text-sm">GWP Change</p>
                  <p className={`text-2xl font-bold ${deltaMetrics.gwp_delta_percent < 0 ? "text-green-400" : "text-red-400"}`}>
                    {deltaMetrics.gwp_delta_percent > 0 ? "+" : ""}
                    {deltaMetrics.gwp_delta_percent.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-900 to-green-800 border-green-600 hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  {deltaMetrics.circularity_score_delta > 0 ? (
                    <TrendingUp className="w-6 h-6 mx-auto text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 mx-auto text-red-400" />
                  )}
                  <p className="mt-2 text-sm">Circularity Change</p>
                  <p className={`text-2xl font-bold ${deltaMetrics.circularity_score_delta > 0 ? "text-green-400" : "text-red-400"}`}>
                    {deltaMetrics.circularity_score_delta > 0 ? "+" : ""}
                    {deltaMetrics.circularity_score_delta.toFixed(1)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>

          {/* Optimized */}
          <ScrollReveal delay={0.3}>
            <div className="space-y-6">
              <h2 className="text-center text-lg font-semibold">Optimized Pathway</h2>
              <Card className="bg-[#122315] border-white/10 hover:scale-[1.02] transition">
                <CardContent><Sankey config={comparisonProject.inputs} data={comparisonProject.outputs} /></CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
