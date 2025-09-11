"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StackedBar } from "@/components/StackedBar"
import { Sankey } from "@/components/Sankey"
import { ExplainBubble } from "@/components/ExplainBubble"

// --- TYPE DEFINITIONS (Unchanged) ---
interface ProjectConfig {
    recycledContent: number
    gridEmissions: number
    transportDistance: number
    recyclingRate: number
}

interface LcaResult {
    totalGwp: number;
    gwpBreakdown: {
        materialProduction: number;
        transport: number;
        gridEnergy: number;
    };
    totalEnergy: number;
    circularityScore: number;
}

interface FullProject {
    inputs: ProjectConfig;
    outputs: LcaResult;
}

interface DeltaMetrics {
    gwp_delta: number;
    gwp_delta_percent: number;
    circularity_score_delta: number;
}

// --- MOCK CALCULATION ENGINE ---
// This function simulates our API locally to avoid network errors for now.
const calculateMockMetrics = (config: ProjectConfig): LcaResult => {
    // GWP Calculation (based on simple, deterministic rules)
    const primaryEnergyBaseline = 15.5; // kWh/kg for 0% recycled
    const recycledEnergyBaseline = 0.78; // kWh/kg for 100% recycled
    const materialEnergy = primaryEnergyBaseline - (config.recycledContent / 100) * (primaryEnergyBaseline - recycledEnergyBaseline);

    const primaryGwpBaseline = 8.5; // kg CO2e/kg for 0% recycled (material only)
    const recycledGwpBaseline = 0.425; // kg CO2e/kg for 100% recycled (material only)
    const materialProductionGwp = primaryGwpBaseline - (config.recycledContent / 100) * (primaryGwpBaseline - recycledGwpBaseline);

    const transportGwp = (config.transportDistance / 500) * (0.0125 * 1); // Scaled from baseline
    const gridEnergyGwp = materialEnergy * (config.gridEmissions / 1000); // g to kg

    const totalGwp = materialProductionGwp + transportGwp + gridEnergyGwp;

    // Circularity Score Calculation
    const recycledContentNormalized = config.recycledContent / 100;
    const endOfLifeRecoveryNormalized = config.recyclingRate / 100;
    const circularityScore = 100 * (0.4 * recycledContentNormalized + 0.3 * endOfLifeRecoveryNormalized + 0.2 * 0.3 + 0.1 * 0.95);

    return {
        totalGwp,
        gwpBreakdown: {
            materialProduction: materialProductionGwp,
            transport: transportGwp,
            gridEnergy: gridEnergyGwp,
        },
        totalEnergy: materialEnergy,
        circularityScore: parseFloat(circularityScore.toFixed(1)),
    };
};


export default function ComparePathwaysPage({ params }: { params: { id: string } }) {
    // We will use state to hold our mock-generated data
    const [originalProject, setOriginalProject] = useState<FullProject | null>(null)
    const [comparisonProject, setComparisonProject] = useState<FullProject | null>(null)
    const [deltaMetrics, setDeltaMetrics] = useState<DeltaMetrics | null>(null)

    // Using useEffect to simulate loading data once on component mount
    useEffect(() => {
        // Step 1: Define the original project's inputs from a mock source
        const originalConfig: ProjectConfig = {
            recycledContent: 75,
            gridEmissions: 450,
            transportDistance: 450,
            recyclingRate: 75,
        };

        // Step 2: Define the optimized project's inputs
        const comparisonConfig: ProjectConfig = {
            ...originalConfig,
            recycledContent: Math.min(originalConfig.recycledContent + 20, 100),
            gridEmissions: Math.max(originalConfig.gridEmissions - 200, 100),
            recyclingRate: Math.min(originalConfig.recyclingRate + 10, 100),
        };

        // Step 3: Calculate the outputs for both using our mock engine
        const originalOutputs = calculateMockMetrics(originalConfig);
        const comparisonOutputs = calculateMockMetrics(comparisonConfig);

        const fullOriginalProject: FullProject = { inputs: originalConfig, outputs: originalOutputs };
        const fullComparisonProject: FullProject = { inputs: comparisonConfig, outputs: comparisonOutputs };

        setOriginalProject(fullOriginalProject);
        setComparisonProject(fullComparisonProject);

        // Step 4: Calculate the delta metrics
        const gwp_delta = comparisonOutputs.totalGwp - originalOutputs.totalGwp;
        const gwp_delta_percent = (gwp_delta / originalOutputs.totalGwp) * 100;
        const circularity_score_delta = comparisonOutputs.circularityScore - originalOutputs.circularityScore;

        setDeltaMetrics({ gwp_delta, gwp_delta_percent, circularity_score_delta });

    }, [params.id]);


    const handleExportPDF = () => { window.print(); }

    // This check is still useful for the initial render before useEffect runs
    if (!originalProject || !comparisonProject || !deltaMetrics) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Skeleton className="w-64 h-8" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b bg-white print:hidden">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/project/${params.id}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Project</Button></Link>
                            <h1 className="text-xl font-semibold text-slate-900">Compare Pathways</h1>
                        </div>
                        <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700"><Download className="w-4 h-4 mr-2" />Export Comparison</Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Global Warming Potential (GWP) Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* This will now work perfectly with our mock data */}
                        <StackedBar primaryData={originalProject.outputs} configuredData={comparisonProject.outputs} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Original Project */}
                    <div className="space-y-6">
                        <div className="text-center"><h2 className="text-lg font-semibold text-slate-900 mb-2">Original Pathway</h2></div>
                        <Card>
                            <CardHeader><CardTitle className="text-base">Material Flows</CardTitle></CardHeader>
                            <CardContent><Sankey config={originalProject.inputs} data={originalProject.outputs} /></CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex justify-between"><span className="text-sm text-slate-600">Total GWP:</span><span className="font-medium">{originalProject.outputs.totalGwp.toFixed(1)} kg CO₂e</span></div>
                                <div className="flex justify-between"><span className="text-sm text-slate-600">Circularity Score:</span><span className="font-medium">{originalProject.outputs.circularityScore}/100</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Panel - Delta Metrics */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="text-center"><h2 className="text-lg font-semibold text-slate-900 mb-6">Impact Comparison</h2></div>
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {deltaMetrics.gwp_delta_percent < 0 ? <TrendingDown className="w-5 h-5 text-green-600" /> : <TrendingUp className="w-5 h-5 text-red-600" />}
                                        <span className="text-sm font-medium text-slate-700">GWP Change</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${deltaMetrics.gwp_delta_percent < 0 ? "text-green-600" : "text-red-600"}`}>
                                        {deltaMetrics.gwp_delta_percent > 0 ? "+" : ""}{deltaMetrics.gwp_delta_percent.toFixed(1)}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {deltaMetrics.circularity_score_delta > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
                                        <span className="text-sm font-medium text-slate-700">Circularity Change</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${deltaMetrics.circularity_score_delta > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {deltaMetrics.circularity_score_delta > 0 ? "+" : ""}{deltaMetrics.circularity_score_delta.toFixed(1)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Key Improvements</CardTitle><ExplainBubble /></div></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>+{comparisonProject.inputs.recycledContent - originalProject.inputs.recycledContent}% recycled content</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span>-{originalProject.inputs.gridEmissions - comparisonProject.inputs.gridEmissions} gCO₂/kWh grid</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div><span>+{comparisonProject.inputs.recyclingRate - originalProject.inputs.recyclingRate}% recycling rate</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Optimized Project */}
                    <div className="space-y-6">
                        <div className="text-center"><h2 className="text-lg font-semibold text-slate-900 mb-2">Optimized Pathway</h2></div>
                        <Card>
                            <CardHeader><CardTitle className="text-base">Material Flows</CardTitle></CardHeader>
                            <CardContent><Sankey config={comparisonProject.inputs} data={comparisonProject.outputs} /></CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex justify-between"><span className="text-sm text-slate-600">Total GWP:</span><span className="font-medium">{comparisonProject.outputs.totalGwp.toFixed(1)} kg CO₂e</span></div>
                                <div className="flex justify-between"><span className="text-sm text-slate-600">Circularity Score:</span><span className="font-medium">{comparisonProject.outputs.circularityScore}/100</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

