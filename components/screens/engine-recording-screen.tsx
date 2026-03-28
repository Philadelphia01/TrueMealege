"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic, Square, Bug } from "lucide-react"

export type EngineState = "healthy" | "faulty"

interface EngineRecordingScreenProps {
  vin: string
  onBack: () => void
  onAnalysisComplete: (engineState: EngineState) => void
}

export function EngineRecordingScreen({ vin, onBack, onAnalysisComplete }: EngineRecordingScreenProps) {
  const [phase, setPhase] = useState<"idle" | "recording" | "analyzing">("idle")
  const [seconds, setSeconds] = useState(0)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [bars, setBars] = useState<number[]>(Array.from({ length: 40 }, () => 10))
  const [demoMode, setDemoMode] = useState(false)
  const [demoState, setDemoState] = useState<EngineState>("healthy")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const barsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopAllIntervals = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (barsIntervalRef.current) clearInterval(barsIntervalRef.current)
  }, [])

  useEffect(() => {
    return () => stopAllIntervals()
  }, [stopAllIntervals])

  const startRecording = () => {
    setPhase("recording")
    setSeconds(0)
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s >= 14) { stopRecording(); return 15 }
        return s + 1
      })
    }, 1000)
    barsIntervalRef.current = setInterval(() => {
      setBars(Array.from({ length: 40 }, () => Math.random() * 80 + 10))
    }, 100)
  }

  const stopRecording = () => {
    stopAllIntervals()
    setPhase("analyzing")
    setAnalyzeProgress(0)
    // In demo mode, use selected state; otherwise random
    const resolvedState: EngineState = demoMode ? demoState : (Math.random() > 0.5 ? "healthy" : "faulty")
    const analyzeInterval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          clearInterval(analyzeInterval)
          setTimeout(() => onAnalysisComplete(resolvedState), 400)
          return 100
        }
        return p + 2
      })
    }, 60)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Engine Recording</h2>
          <p className="text-xs text-muted-foreground font-mono">{vin || "No VIN"}</p>
        </div>
        {/* Hidden Debug/Demo Toggle */}
        <button
          onClick={() => setDemoMode((d) => !d)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            demoMode ? "bg-purple-500/20 text-purple-400" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Toggle demo mode"
        >
          <Bug className="size-3" />
          Demo
        </button>
      </div>

      {/* Demo Mode Controls */}
      {demoMode && (
        <div className="border-b border-purple-500/20 bg-purple-500/5 px-4 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
            Demo Mode — Select Result
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDemoState("healthy")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                demoState === "healthy" ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600"
              }`}
            >
              ✅ Healthy Engine
            </button>
            <button
              onClick={() => setDemoState("faulty")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                demoState === "faulty" ? "bg-red-500 text-white" : "bg-red-500/10 text-red-600"
              }`}
            >
              ⚠️ Faulty Engine
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Waveform */}
        <div className="mb-8 flex h-32 w-full items-center justify-center gap-[2px] rounded-2xl bg-tm-navy/5 px-4">
          {bars.map((height, i) => (
            <div key={i} className="w-1.5 rounded-full transition-all duration-100" style={{
              height: `${phase === "recording" ? height : 10}%`,
              backgroundColor: phase === "recording" ? (i % 3 === 0 ? "var(--tm-green)" : "var(--tm-blue)") : "var(--border)",
            }} />
          ))}
        </div>

        <p className="mb-2 text-4xl font-bold font-mono text-foreground">{formatTime(seconds)}</p>
        <p className="mb-8 text-sm text-muted-foreground">
          {phase === "idle" && "Tap to start recording engine sound"}
          {phase === "recording" && "Recording... Keep phone near engine"}
          {phase === "analyzing" && "Analyzing engine audio..."}
        </p>

        {phase === "idle" && (
          <button onClick={startRecording} className="flex size-20 items-center justify-center rounded-full bg-tm-green shadow-lg shadow-tm-green/30 hover:bg-tm-green/90 transition-transform active:scale-95" aria-label="Start recording">
            <Mic className="size-8 text-white" />
          </button>
        )}
        {phase === "recording" && (
          <button onClick={stopRecording} className="flex size-20 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30 hover:bg-red-500/90 transition-transform active:scale-95" aria-label="Stop recording">
            <Square className="size-8 text-white" />
          </button>
        )}
        {phase === "analyzing" && (
          <div className="w-full max-w-xs">
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-tm-blue transition-all duration-150" style={{ width: `${analyzeProgress}%` }} />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">{analyzeProgress}% complete</p>
          </div>
        )}

        {phase === "idle" && (
          <div className="mt-10 w-full rounded-xl border border-border bg-secondary/50 p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Tips for best results:</p>
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              <li>1. Start the vehicle engine</li>
              <li>2. Hold phone 1-2 feet from the engine</li>
              <li>3. Record for at least 10 seconds</li>
              <li>4. Minimize background noise</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
