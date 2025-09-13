"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, BrainCircuit, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImputedBadge } from "@/components/ImputedBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Types & Defaults ---
type Material = 'Aluminium' | 'Copper';
interface ProjectInput {
    name: string;
    material: Material;
    product_type: string;
    region: 'EU' | 'US' | 'CN' | 'Global';
    mass_kg: number;
    recycledContent: number | null;
    gridEmissions_gCO2_per_kWh: number | null;
    transportDistance_km: number | null;
    end_of_life_recycling_rate: number | null;
}
interface ImputationMeta {
    field: keyof ProjectInput;
    method: string;
    confidence: number;
}
const aluminiumDefaults = {
    name: "Aluminium Beverage Cans",
    material: "Aluminium" as Material,
    product_type: "Beverage Can",
    mass_kg: 1000,
    recycledContent: 65,
    gridEmissions_gCO2_per_kWh: 450,
    transportDistance_km: 500,
    end_of_life_recycling_rate: null,
};
const copperDefaults = {
    name: "Copper Industrial Cable",
    material: "Copper" as Material,
    product_type: "Industrial Cable",
    mass_kg: 2500,
    recycledContent: 40,
    gridEmissions_gCO2_per_kWh: 450,
    transportDistance_km: 800,
    end_of_life_recycling_rate: null,
};

export default function CustomProjectPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectInput>({ ...aluminiumDefaults, region: 'EU' });
    const [imputationMeta, setImputationMeta] = useState<ImputationMeta[]>([]);
    const [lcaResults, setLcaResults] = useState<any | null>(null);

    const handleSanitizedInputChange = (field: keyof ProjectInput, value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        setProject(prev => ({ ...prev, [field]: sanitizedValue === '' ? null : Number(sanitizedValue) }));
    };

    const handleSelectChange = (field: keyof ProjectInput, value: string) => {
        if (field === 'material') {
            const newDefaults = value === 'Aluminium' ? aluminiumDefaults : copperDefaults;
            setProject(prev => ({ ...prev, ...newDefaults, region: prev.region }));
            setLcaResults(null);
            setImputationMeta([]);
        } else {
            setProject(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);
        setLcaResults(null);
        setImputationMeta([]);
        try {
            const response = await fetch('/api/impute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to calculate results.");
            }
            const data = await response.json();
            setProject(data.project_imputed);
            setImputationMeta(data.imputation_meta);
            setLcaResults(data.project_imputed.results);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateComparison = () => {
        if (!lcaResults) {
            setError("Please calculate the project impact before creating a comparison.");
            return;
        }
        const fullProjectState = { ...project, results: lcaResults };
        localStorage.setItem("originalProject", JSON.stringify(fullProjectState));
        router.push(`/project/${params.id}/compare`);
    };

    const getImputationForField = (field: keyof ProjectInput) => imputationMeta.find(m => m.field === field);
    const productTypes = [ "Automotive Components", "Beverage Can", "Building Construction", "Cookware", "Electronics (PCB)", "Industrial Cable", "Packaging Foil" ];

    return (
        <div className="min-h-screen bg-[#f8f3e6]">
            <header className="border-b bg-white print:hidden sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
                    <h1 className="text-lg font-semibold text-slate-800">Custom Project: {project.name}</h1>
                    <Button onClick={handleCreateComparison} className="bg-blue-600 hover:bg-blue-700" disabled={!lcaResults || isLoading}>
                        <Plus className="w-4 h-4 mr-2" /> Create Comparison
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>1. Define Your Project</CardTitle>
                                <CardDescription>Enter the core details of your product or component.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 col-span-2"><Label htmlFor="name">Project Name</Label><Input id="name" value={project.name} onChange={(e) => setProject(p=>({...p, name: e.target.value}))}/></div>
                                <div className="space-y-1"><Label htmlFor="material">Material</Label><Select value={project.material} onValueChange={(v) => handleSelectChange('material', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Aluminium">Aluminium</SelectItem><SelectItem value="Copper">Copper</SelectItem></SelectContent></Select></div>
                                <div className="space-y-1"><Label htmlFor="product_type">Product Type</Label><Select value={project.product_type} onValueChange={(v) => handleSelectChange('product_type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{productTypes.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-1"><Label htmlFor="region">Region</Label><Select value={project.region} onValueChange={(v) => handleSelectChange('region', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="EU">Europe (EU)</SelectItem><SelectItem value="US">United States</SelectItem><SelectItem value="CN">China</SelectItem></SelectContent></Select></div>
                                <div className="space-y-1"><Label htmlFor="mass_kg">Mass (kg)</Label><Input id="mass_kg" type="text" inputMode="decimal" value={project.mass_kg} onChange={(e) => handleSanitizedInputChange('mass_kg', e.target.value)}/></div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader><CardTitle>2. Provide LCI Parameters</CardTitle><CardDescription>Fill in what you know. We'll use AI to estimate any missing values.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries({
                                    recycledContent: { label: "Recycled Content", unit: "%" },
                                    gridEmissions_gCO2_per_kWh: { label: "Grid Emissions", unit: "gCO2/kWh" },
                                    transportDistance_km: { label: "Transport Distance", unit: "km" },
                                    end_of_life_recycling_rate: { label: "End-of-Life Recycling Rate", unit: "%" },
                                }).map(([key, { label, unit }]) => {
                                    const fieldKey = key as keyof ProjectInput;
                                    const imputation = getImputationForField(fieldKey);
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <div><Label htmlFor={key} className="font-medium">{label}</Label>{imputation && <ImputedBadge confidence={imputation.confidence} />}</div>
                                            <div className="flex items-center gap-2"><Input id={key} type="text" inputMode="decimal" placeholder="Auto" value={project[fieldKey] ?? ''} onChange={(e) => handleSanitizedInputChange(fieldKey, e.target.value)} className="w-32 text-right"/><span className="text-sm text-slate-500 w-16">{unit}</span></div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        <div className="flex flex-col items-center"><Button size="lg" onClick={handleCalculate} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">{isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BrainCircuit className="w-5 h-5 mr-2" />}Calculate Impact</Button>{error && <p className="text-red-600 text-sm mt-2">{error}</p>}</div>
                    </div>

                    {/* RESULTS */}
                    <div className="space-y-6">
                        <Card className="shadow-sm sticky top-24">
                            <CardHeader><CardTitle>Results</CardTitle><CardDescription>The calculated environmental and circularity impact.</CardDescription></CardHeader>
                            <CardContent>{!lcaResults && !isLoading && (<div className="text-center py-12"><p className="text-slate-500">Your results will appear here after calculation.</p></div>)}{isLoading && <div className="text-center py-12"><Loader2 className="w-8 h-8 mx-auto animate-spin text-slate-400" /></div>}{lcaResults && (<div className="space-y-4"><div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><Label>Total GWP (Carbon Footprint)</Label><p className="text-3xl font-bold text-blue-800">{lcaResults.totalGwp} <span className="text-xl font-normal">kg CO₂e</span></p></div><div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"><Label>Circularity Score</Label><p className="text-3xl font-bold text-emerald-800">{lcaResults.circularityScore} <span className="text-xl font-normal">/ 100</span></p></div><Alert><AlertTitle>Imputation Summary</AlertTitle><AlertDescription>{imputationMeta.length > 0 ? `We used AI to impute ${imputationMeta.length} value(s) to complete the analysis.` : `All values were provided. No imputation was needed.`}</AlertDescription></Alert></div>)}</CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

