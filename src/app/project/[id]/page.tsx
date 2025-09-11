"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImputedBadge } from "@/components/ImputedBadge"
import { ExplainBubble } from "@/components/ExplainBubble"

interface LCIParameter {
    name: string
    value: number
    unit: string
    isImputed: boolean
    confidence: number
}

interface ProjectData {
    id: string
    name: string
    material: string
    region: string
    lciParameters: LCIParameter[]
}

export default function CustomProjectPage({ params }: { params: { id: string } }) {
    const router = useRouter()

    // Mock project data - in real app this would come from API/database
    const [project, setProject] = useState<ProjectData>({
        id: params.id,
        name: "Aluminium Extrusion Project",
        material: "Aluminium",
        region: "EU",
        lciParameters: [
            { name: "Energy Consumption", value: 15.2, unit: "kWh/kg", isImputed: false, confidence: 95 },
            { name: "Transport Distance", value: 450, unit: "km", isImputed: true, confidence: 78 },
            { name: "Smelting Energy", value: 8.7, unit: "kWh/kg", isImputed: true, confidence: 82 },
            { name: "Recycling Rate", value: 75, unit: "%", isImputed: false, confidence: 90 },
            { name: "Water Usage", value: 2.3, unit: "L/kg", isImputed: true, confidence: 65 },
            { name: "Waste Generation", value: 0.15, unit: "kg/kg", isImputed: true, confidence: 70 },
        ],
    })

    const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // TODO: Implement CSV upload and parse
            console.log("TODO: Implement CSV upload and parse", file.name)
        }
    }

    const handleParameterChange = (index: number, newValue: number) => {
        const updatedParameters = [...project.lciParameters]
        updatedParameters[index] = { ...updatedParameters[index], value: newValue }
        setProject({ ...project, lciParameters: updatedParameters })
    }

    const handleCreateComparison = () => {
        // Store current project state and navigate to compare page
        const currentState = JSON.parse(JSON.stringify(project)) // Deep copy
        localStorage.setItem("comparisonProject", JSON.stringify(currentState))
        router.push(`/project/${params.id}/compare`)
    }

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
                            <h1 className="text-xl font-semibold text-slate-900">Custom Project: {project.name}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleCreateComparison} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Comparison
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel - Project Input Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Project Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectName">Project Name</Label>
                                    <Input
                                        id="projectName"
                                        value={project.name}
                                        onChange={(e) => setProject({ ...project, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="material">Material</Label>
                                    <Select
                                        value={project.material}
                                        onValueChange={(value) => setProject({ ...project, material: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Aluminium">Aluminium</SelectItem>
                                            <SelectItem value="Copper">Copper</SelectItem>
                                            <SelectItem value="Steel">Steel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Select value={project.region} onValueChange={(value) => setProject({ ...project, region: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EU">Europe (EU)</SelectItem>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="CN">China</SelectItem>
                                            <SelectItem value="Global">Global Average</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Upload BOM CSV</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-sm text-slate-600 mb-4">Upload your Bill of Materials (BOM) CSV file</p>
                                    <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                                    <Button asChild variant="outline">
                                        <label htmlFor="csv-upload" className="cursor-pointer">
                                            Choose CSV File
                                        </label>
                                    </Button>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Supported format: CSV with columns: Material, Quantity, Unit
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Editable LCI Parameters Table */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">LCI Parameters</CardTitle>
                                    <ExplainBubble />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {project.lciParameters.map((param, index) => (
                                        <div key={param.name} className="flex items-center gap-4 p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{param.name}</span>
                                                    {param.isImputed && <ImputedBadge confidence={param.confidence} />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={param.value}
                                                        onChange={(e) => handleParameterChange(index, Number.parseFloat(e.target.value) || 0)}
                                                        className="w-24"
                                                        step="0.1"
                                                    />
                                                    <span className="text-sm text-slate-500">{param.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Sources */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Data Sources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <a
                                        href="https://eplca.jrc.ec.europa.eu/ELCD3/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        ELCD Database
                                    </a>
                                    <a
                                        href="https://www.nrel.gov/lci/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        USLCI (NREL)
                                    </a>
                                    <a
                                        href="https://nexus.openlca.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        openLCA Nexus
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
