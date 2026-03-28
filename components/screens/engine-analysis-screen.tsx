"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react"
import type { EngineState } from "./engine-recording-screen"

interface EngineAnalysisScreenProps {
  onBack: () => void
  onProceed: () => void
  engineState?: EngineState
}

const healthyItems = [
  { label: "Engine Knock", status: "pass" as const, detail: "No abnormal knocking detected" },
  { label: "Exhaust Sound", status: "pass" as const, detail: "Normal exhaust pattern" },
  { label: "Belt Squeal", status: "warning" as const, detail: "Minor belt noise detected" },
  { label: "Idle Stability", status: "pass" as const, detail: "Stable idle RPM" },
  { label: "Turbo Whine", status: "pass" as const, detail: "No turbo issues found" },
  { label: "Valve Train", status: "pass" as const, detail: "Normal valve operation" },
]

const faultyItems = [
  { label: "Engine Knock", status: "fail" as const, detail: "Rod knock detected — bearing wear likely" },
  { label: "Exhaust Sound", status: "warning" as const, detail: "Irregular exhaust pulsing" },
  { label: "Belt Squeal", status: "fail" as const, detail: "Severe belt wear or misalignment" },
  { label: "Idle Stability", status: "fail" as const, detail: "Unstable idle — possible misfire" },
  { label: "Turbo Whine", status: "warning" as const, detail: "Abnormal whine at high RPM" },
  { label: "Valve Train", status: "fail" as const, detail: "Excessive valve clatter detected" },
]

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-tm-green", bg: "bg-tm-green/10", label: "Pass" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Warning" },
  fail: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Fail" },
}

function SpectrogramHeatmap({ isFaulty }: { isFaulty: boolean }) {
  // Generate a grid of "frequency cells" for visual effect
  const rows = 12
  const cols = 32

  const getCellColor = (row: number, col: number): string => {
    if (isFaulty) {
      // Faulty: spikes at certain frequency bands (rows 3-5, 8-10) at certain time ranges
      const isSpikeFreq = (row >= 3 && row <= 5) || (row >= 8 && row <= 10)
      const isSpikeTime = (col >= 8 && col <= 12) || (col >= 20 && col <= 25)
      if (isSpikeFreq && isSpikeTime) return `rgba(239, 68, 68, ${0.7 + Math.random() * 0.3})`
      if (isSpikeFreq) return `rgba(251, 146, 60, ${0.3 + Math.random() * 0.3})`
      if (isSpikeTime) return `rgba(251, 146, 60, ${0.2 + Math.random() * 0.2})`
      // Background noise
      const noise = Math.random()
      if (noise > 0.85) return `rgba(239, 68, 68, ${0.1 + Math.random() * 0.15})`
      return `rgba(30, 58, 138, ${0.1 + Math.random() * 0.15})`
    } else {
      // Healthy: smooth gradient, concentrated in low frequencies (high row index = low freq)
      const freqWeight = (rows - row) / rows
      const timeVariance = Math.sin((col / cols) * Math.PI) * 0.3
      const intensity = freqWeight * 0.5 + timeVariance + Math.random() * 0.1
      if (intensity > 0.6) return `rgba(34, 197, 94, ${intensity * 0.9})`
      if (intensity > 0.35) return `rgba(6, 182, 212, ${intensity * 0.8})`
      return `rgba(30, 58, 138, ${0.1 + intensity * 0.3})`
    }
  }

  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3 overflow-hidden">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Acoustic Frequency Map
      </p>
      {/* Y-axis labels */}
      <div className="flex gap-1">
        <div className="flex flex-col justify-between py-0.5 pr-1">
          <span className="text-[8px] text-slate-500">8kHz</span>
          <span className="text-[8px] text-slate-500">4kHz</span>
          <span className="text-[8px] text-slate-500">1kHz</span>
          <span className="text-[8px] text-slate-500">80Hz</span>
        </div>
        <div className="flex-1">
          <div className="grid gap-[2px]" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
            {Array.from({ length: rows }).map((_, row) => (
              <div key={row} className="flex gap-[2px]">
                {Array.from({ length: cols }).map((_, col) => (
                  <div
                    key={col}
                    className="flex-1 rounded-[1px]"
                    style={{
                      height: "8px",
                      backgroundColor: getCellColor(row, col),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* X-axis */}
          <div className="mt-1 flex justify-between">
            <span className="text-[8px] text-slate-500">0s</span>
            <span className="text-[8px] text-slate-500">Time →</span>
            <span className="text-[8px] text-slate-500">15s</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[9px] text-slate-400 leading-relaxed">
        {isFaulty
          ? "⚠️ AI spectral analysis complete: Mechanical friction signatures detected at 2.4kHz–3.1kHz band."
          : "✅ AI spectral analysis complete: No mechanical friction signatures found. Smooth frequency profile."}
      </p>
    </div>
  )
}

export function EngineAnalysisScreen({ onBack, onProceed, engineState = "healthy" }: EngineAnalysisScreenProps) {
  const isFaulty = engineState === "faulty"
  const score = isFaulty ? 42 : 87
  const items = isFaulty ? faultyItems : healthyItems
  const scoreColor = isFaulty ? "var(--color-red-500, #ef4444)" : "var(--tm-green)"
  const scoreLabel = isFaulty ? "Engine Health: Poor" : "Engine Health: Good"
  const scoreLabelColor = isFaulty ? "text-red-500" : "text-tm-green"
  const scoreDesc = isFaulty
    ? "Multiple critical issues detected. Engine requires immediate inspection."
    : "Your engine sounds healthy with one minor concern detected."

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Engine Analysis</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">
        {/* Spectrogram Heatmap */}
        <SpectrogramHeatmap isFaulty={isFaulty} />

        {/* Score Circle */}
        <div className="flex flex-col items-center">
          <div className="relative flex size-28 items-center justify-center">
            <svg className="size-28" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={scoreColor}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 327} 327`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
          <p className={`mt-2 text-sm font-semibold ${scoreLabelColor}`}>{scoreLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground text-center leading-relaxed px-4">{scoreDesc}</p>
        </div>

        {/* Analysis Items */}
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const config = statusConfig[item.status]
            const Icon = config.icon
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className={`size-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2">
        <Button
          onClick={onProceed}
          className={`h-12 w-full rounded-xl text-white font-semibold text-base ${
            isFaulty ? "bg-red-500 hover:bg-red-500/90" : "bg-tm-green hover:bg-tm-green/90"
          }`}
        >
          Continue to Listing Check
          <ChevronRight className="ml-1 size-5" />
        </Button>
      </div>
    </div>
  )
}
