// src/app/compare/page.tsx
"use client"

import { useState, useEffect } from "react" // Import useEffect
import Link from "next/link"
import { ArrowLeft, Download, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton
import { StackedBar } from "@/components/StackedBar"
import { Sankey } from "@/components/Sankey"
import { ImputedBadge } from "@/components/ImputedBadge"

// --- TYPE DEFINITIONS ---
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

export default function ComparePage() {
    // Your existing state for sliders - no changes needed
    const [config, setConfig] = useState<ProjectConfig>({
        recycledContent: 60, // Default to match your screenshot
        gridEmissions: 75,
        transportDistance: 5000,
        recyclingRate: 40,
    })

    // --- NEW STATE MANAGEMENT FOR API DATA ---
    const [primaryResult, setPrimaryResult] = useState<LcaResult | null>(null);
    const [configuredResult, setConfiguredResult] = useState<LcaResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- NEW DATA FETCHING LOGIC ---
    useEffect(() => {
        const fetchLcaData = async () => {
            setIsLoading(true);
            try {
                const configuredPayload = { project: config };
                const primaryPayload = { project: { ...config, recycledContent: 0 } };

                const [primaryResponse, configuredResponse] = await Promise.all([
                    fetch('/api/impute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(primaryPayload) }),
                    fetch('/api/impute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configuredPayload) })
                ]);

                if (!primaryResponse.ok || !configuredResponse.ok) throw new Error(`API error`);

                const primaryData = await primaryResponse.json();
                const configuredData = await configuredResponse.json();

                setPrimaryResult(primaryData.project_imputed.results);
                setConfiguredResult(configuredData.project_imputed.results);

            } catch (error) {
                console.error("Failed to fetch LCA data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLcaData();
    }, [config]);

    // Your existing handler function - no changes needed
    const handleConfigChange = (field: keyof ProjectConfig, value: number) => {
        setConfig(prevConfig => ({ ...prevConfig, [field]: value }));
    }

    // Your existing PDF export function - no changes needed
    const handleExportPDF = () => { window.print(); }

    // Dynamic recommendation logic
    const getRecommendation = () => {
        if (!configuredResult) return "Calculating...";
        const { gwpBreakdown } = configuredResult;
        if (gwpBreakdown.materialProduction > gwpBreakdown.gridEnergy) return "Increasing recycled content has the largest impact on reducing GWP.";
        if (gwpBreakdown.gridEnergy > gwpBreakdown.transport) return "Switching to a lower-emission energy grid would significantly reduce the carbon footprint.";
        return "Consider optimizing transport distances.";
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header (No changes needed) */}
            <header className="border-b bg-white print:hidden">
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
                    {/* Left Panel - Interactive Controls (No changes needed) */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Process Parameters</CardTitle></CardHeader>
                            <CardContent className="space-y-8">
                                {/* All sliders will now correctly trigger the data fetching */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">% Recycled Content</label>
                                        <span className="text-sm text-slate-600">{config.recycledContent}%</span>
                                    </div>
                                    <Slider value={[config.recycledContent]} onValueChange={(value) => handleConfigChange("recycledContent", value[0])} max={100} step={5} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-slate-700">Grid Emissions</label>
                                            <ImputedBadge confidence={60} />
                                        </div>
                                        <span className="text-sm text-slate-600">{config.gridEmissions} gCO₂/kWh</span>
                                    </div>
                                    <Slider value={[config.gridEmissions]} onValueChange={(value) => handleConfigChange("gridEmissions", value[0])} max={1000} step={25} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">Transport Distance</label>
                                        <span className="text-sm text-slate-600">{config.transportDistance} km</span>
                                    </div>
                                    <Slider value={[config.transportDistance]} onValueChange={(value) => handleConfigChange("transportDistance", value[0])} max={5000} step={100} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">End-of-Life Recycling Rate</label>
                                        <span className="text-sm text-slate-600">{config.recyclingRate}%</span>
                                    </div>
                                    <Slider value={[config.recyclingRate]} onValueChange={(value) => handleConfigChange("recyclingRate", value[0])} max={100} step={5} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Visualizations (UPDATED to use live data and show loading states) */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Global Warming Potential (kg CO₂e)</CardTitle></CardHeader>
                            <CardContent>
                                {isLoading || !primaryResult || !configuredResult
                                    ? <Skeleton className="h-80 w-full" />
                                    : <StackedBar primaryData={primaryResult} configuredData={configuredResult} />
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Material Flow Analysis (Configured Pathway)</CardTitle></CardHeader>
                            <CardContent>
                                {isLoading || !configuredResult
                                    ? <Skeleton className="h-80 w-full" />
                                    : <Sankey config={config} data={configuredResult} />
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Impact Summary (Configured Pathway)</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    {isLoading || !configuredResult ? <Skeleton className="h-12 w-full" /> : (
                                        <>
                                            <div>
                                                <p className="text-sm text-slate-600">Circularity Score</p>
                                                <p className="text-3xl font-bold text-blue-600">{configuredResult.circularityScore}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">Total GWP</p>
                                                <p className="text-2xl font-bold text-slate-800">{configuredResult.totalGwp} kg CO₂e</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    {isLoading || !configuredResult ? <Skeleton className="h-12 w-full" /> : (
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Recommendation</p>
                                                <p className="text-sm text-green-700">{getRecommendation()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}