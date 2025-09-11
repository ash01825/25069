import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">CircularMetal LCA</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Data sources: ELCD, USLCI, openLCA
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6 text-balance">
            AI-Assisted LCA & Circularity Decisions for Metals
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto text-pretty">
            Fast, defensible environmental impact and circularity analysis for metal production choices. Get instant
            insights on primary vs recycled routes, energy choices, and end-of-life scenarios.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Quick Compare Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer">
            <Link href="/compare">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Quick Compare</CardTitle>
                <CardDescription className="text-slate-600">
                  Compare primary vs recycled metal pathways with live impact visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Interactive parameter sliders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time GWP & circularity metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Sankey flow visualization</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Start Comparison</Button>
              </CardContent>
            </Link>
          </Card>

          {/* Custom Project Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Custom Project</CardTitle>
              <CardDescription className="text-slate-600">
                Upload your BOM and get AI-assisted LCI data imputation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>CSV BOM upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>AI-powered data imputation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Editable confidence scores</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Generate Report Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Generate Report</CardTitle>
              <CardDescription className="text-slate-600">
                Export executive summaries and detailed LCI data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>One-page executive PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Detailed CSV LCI export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ranked action recommendations</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Standards & Compliance */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-4">Built following ISO 14040/14044 LCA standards</p>
          <div className="flex justify-center items-center gap-6 text-xs text-slate-400">
            <span>ELCD Database</span>
            <span>•</span>
            <span>USLCI (NREL)</span>
            <span>•</span>
            <span>openLCA Nexus</span>
          </div>
        </div>
      </main>
    </div>
  )
}
