"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Info, Save } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { StackedBar } from "@/components/StackedBar"
import { Sankey } from "@/components/Sankey"
import { ImputedBadge } from "@/components/ImputedBadge"

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
    const [config, setConfig] = useState<ProjectConfig>({
        recycledContent: 60,
        gridEmissions: 75,
        transportDistance: 5000,
        recyclingRate: 40,
    })

    const [primaryResult, setPrimaryResult] = useState<LcaResult | null>(null);
    const [configuredResult, setConfiguredResult] = useState<LcaResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const { toast } = useToast();

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

    const handleConfigChange = (field: keyof ProjectConfig, value: number) => {
        setConfig(prevConfig => ({ ...prevConfig, [field]: value }));
    }

    const handleExportPDF = () => { window.print(); }

    const handleSaveProject = async () => {
        if (!projectName.trim()) {
            toast({ title: "Project name cannot be empty.", variant: "destructive" });
            return;
        }

        // Ensure we have results to save before proceeding.
        if (!configuredResult) {
            toast({ title: "Cannot save", description: "Please wait for results to be calculated.", variant: "destructive"});
            return;
        }

        const { error } = await supabase
            .from('projects')
            .insert([{
                name: projectName,
                // We now save an object containing both inputs and outputs
                project_data: {
                    inputs: config,
                    outputs: configuredResult
                },
                user_id: null
            }]);

        if (error) {
            console.error("Error saving project:", error);
            toast({ title: "Error saving project", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Project Saved!", description: `"${projectName}" has been saved successfully.` });
            setIsSaveDialogOpen(false);
            setProjectName("");
        }
    };

    const getRecommendation = () => {
        if (!configuredResult) return "Calculating...";
        const { gwpBreakdown } = configuredResult;
        if (gwpBreakdown.materialProduction > gwpBreakdown.gridEnergy) return "Increasing recycled content has the largest impact on reducing GWP.";
        if (gwpBreakdown.gridEnergy > gwpBreakdown.transport) return "Switching to a lower-emission energy grid would significantly reduce the carbon footprint.";
        return "Consider optimizing transport distances.";
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header and other JSX remains the same */}
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
                        <div className="flex items-center gap-2">
                            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Project
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Save Project</DialogTitle>
                                        <DialogDescription>
                                            Give your project a name. This will save the current slider configuration and results.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">Name</Label>
                                            <Input
                                                id="name"
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                className="col-span-3"
                                                placeholder="e.g., High-Recycled Aluminium Study"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSaveProject}>Save Project</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4 mr-2" />
                                Export to PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Process Parameters</CardTitle></CardHeader>
                            <CardContent className="space-y-8">
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

                    {/* Right Panel */}
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

