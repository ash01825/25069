"use client"

interface SankeyProps {
  config: {
    recycledContent: number
    gridEmissions: number
    transportDistance: number
    recyclingRate: number
  }
}

export function Sankey({ config }: SankeyProps) {
  // Calculate flow values based on configuration
  const virginInput = 100 - config.recycledContent
  const recycledInput = config.recycledContent
  const product = 100
  const use = 100
  const recycled = (config.recyclingRate / 100) * 100
  const loss = 100 - recycled

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 600 300">
        {/* Virgin Input */}
        <rect x="20" y="50" width="80" height={virginInput * 1.5} fill="#ef4444" opacity="0.7" />
        <text x="60" y="40" textAnchor="middle" className="text-xs fill-slate-600">
          Virgin Input
        </text>
        <text x="60" y={50 + virginInput * 1.5 + 15} textAnchor="middle" className="text-xs fill-slate-600">
          {virginInput}%
        </text>

        {/* Recycled Input */}
        <rect
          x="20"
          y={200 - recycledInput * 1.5}
          width="80"
          height={recycledInput * 1.5}
          fill="#10b981"
          opacity="0.7"
        />
        <text x="60" y={200 - recycledInput * 1.5 - 10} textAnchor="middle" className="text-xs fill-slate-600">
          Recycled Input
        </text>
        <text x="60" y={200 + 15} textAnchor="middle" className="text-xs fill-slate-600">
          {recycledInput}%
        </text>

        {/* Product */}
        <rect x="200" y="75" width="80" height="150" fill="#3b82f6" opacity="0.7" />
        <text x="240" y="65" textAnchor="middle" className="text-xs fill-slate-600">
          Product
        </text>
        <text x="240" y="245" textAnchor="middle" className="text-xs fill-slate-600">
          {product}%
        </text>

        {/* Use Phase */}
        <rect x="380" y="75" width="80" height="150" fill="#6366f1" opacity="0.7" />
        <text x="420" y="65" textAnchor="middle" className="text-xs fill-slate-600">
          Use Phase
        </text>
        <text x="420" y="245" textAnchor="middle" className="text-xs fill-slate-600">
          {use}%
        </text>

        {/* End of Life - Recycled */}
        <rect x="500" y="50" width="80" height={recycled * 1.5} fill="#10b981" opacity="0.7" />
        <text x="540" y="40" textAnchor="middle" className="text-xs fill-slate-600">
          Recycled
        </text>
        <text x="540" y={50 + recycled * 1.5 + 15} textAnchor="middle" className="text-xs fill-slate-600">
          {recycled.toFixed(0)}%
        </text>

        {/* End of Life - Loss */}
        <rect x="500" y={200 - loss * 1.5} width="80" height={loss * 1.5} fill="#ef4444" opacity="0.7" />
        <text x="540" y={200 - loss * 1.5 - 10} textAnchor="middle" className="text-xs fill-slate-600">
          Loss
        </text>
        <text x="540" y={200 + 15} textAnchor="middle" className="text-xs fill-slate-600">
          {loss.toFixed(0)}%
        </text>

        {/* Flow Lines */}
        <path d="M100 125 Q150 125 200 150" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M100 175 Q150 175 200 150" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M280 150 Q330 150 380 150" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M460 125 Q480 125 500 125" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M460 175 Q480 175 500 175" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6" />

        {/* Recycling Loop */}
        <path
          d="M540 50 Q580 30 580 280 Q20 280 20 200"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}
