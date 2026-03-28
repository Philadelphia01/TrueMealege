"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, Shield, Mic, FileSearch, AlertTriangle, Home, Info, CheckCircle2, X, Copy, ExternalLink, Loader2, Lock, Clock, Fingerprint, BadgeCheck } from "lucide-react"
import type { EngineState } from "./engine-recording-screen"

// Known manufacturer issues database (demo data)
const KNOWN_ISSUES: Record<string, { issue: string; bulletin: string }> = {
  "honda civic": { issue: "timing chain wear and excessive oil consumption", bulletin: "TSB #19-087" },
  "toyota camry": { issue: "excessive oil consumption in 2.5L engines", bulletin: "TSB #0057-18" },
  "ford f-150": { issue: "cam phaser noise and engine hesitation", bulletin: "TSB #20-2227" },
  "chevrolet silverado": { issue: "AFM lifter failure causing rod knock", bulletin: "TSB #18-NA-355" },
  "bmw 3 series": { issue: "timing chain stretch and N20 engine failure", bulletin: "TSB #11-05-1-440-291" },
  "jeep cherokee": { issue: "3.2L Pentastar valve train noise", bulletin: "TSB #09-001-16" },
  "hyundai sonata": { issue: "connecting rod bearing failure (Theta II engine)", bulletin: "Recall #19V784" },
  "kia optima": { issue: "engine seizure due to connecting rod bearing wear", bulletin: "Recall #19V785" },
}

function getTechnicalInsight(make: string, model: string, engineScore: number) {
  const key = `${make} ${model}`.toLowerCase()
  const found = KNOWN_ISSUES[key]
  if (!found && engineScore >= 70) return null
  if (engineScore >= 70 && !found) return null
  if (engineScore < 70) {
    return found
      ? `The ${make} ${model} has a known manufacturer bulletin for ${found.issue} (${found.bulletin}). The detected acoustic pattern is consistent with this common issue.`
      : `The detected low health score may indicate early mechanical wear. We recommend a full inspection by a certified mechanic before purchase.`
  }
  return null
}

// Generate a mock hash for the "tamper-proof" seal
function generateReportHash(vin: string, score: number): string {
  const base = `TM-${vin.slice(-6)}-${score}-${Date.now().toString(36).toUpperCase()}`
  return base
}

function generateTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  })
}

// ── Share Sheet Modal ────────────────────────────────────────────────────────
interface ShareSheetProps {
  vin: string
  make: string
  model: string
  year: number
  overallScore: number
  onClose: () => void
}

function ShareSheet({ vin, make, model, year, overallScore, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const reportHash = generateReportHash(vin, overallScore)
  const timestamp = generateTimestamp()
  const mockUrl = `https://reports.truemileage.ai/v/${reportHash}`

  const handleCopy = () => {
    navigator.clipboard.writeText(mockUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="relative z-10 rounded-t-3xl bg-background px-5 pb-8 pt-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>

        {/* Verification Seal */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-tm-green/30 bg-gradient-to-br from-tm-green/10 to-tm-blue/5">
          {/* Seal header */}
          <div className="flex items-center gap-3 border-b border-tm-green/20 bg-tm-green/10 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-tm-green">
              <BadgeCheck className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Certified TrueMileage Report</p>
              <p className="text-[10px] text-tm-green font-medium">Verification Seal Active</p>
            </div>
            <div className="ml-auto flex size-8 items-center justify-center rounded-full border-2 border-tm-green/40">
              <span className="text-[10px] font-black text-tm-green">{overallScore}</span>
            </div>
          </div>

          {/* Seal body */}
          <div className="px-4 py-3">
            <p className="mb-2.5 text-xs font-semibold text-foreground">
              {year} {make} {model}
            </p>
            <div className="flex flex-col gap-1.5">
              {/* VIN row */}
              <div className="flex items-center gap-2">
                <Fingerprint className="size-3 shrink-0 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">VIN</span>
                <span className="ml-auto font-mono text-[10px] font-semibold text-foreground">{vin || "N/A"}</span>
              </div>
              {/* Timestamp row */}
              <div className="flex items-center gap-2">
                <Clock className="size-3 shrink-0 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Audited</span>
                <span className="ml-auto text-[10px] text-foreground">{timestamp}</span>
              </div>
              {/* Hash row */}
              <div className="flex items-center gap-2">
                <Lock className="size-3 shrink-0 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Report ID</span>
                <span className="ml-auto font-mono text-[10px] font-semibold text-foreground">{reportHash}</span>
              </div>
            </div>

            {/* Tamper-proof badge */}
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-tm-green/10 px-2.5 py-1.5">
              <CheckCircle2 className="size-3 text-tm-green" />
              <p className="text-[9px] font-medium text-tm-green">
                Data timestamped &amp; cryptographically signed — tamper-proof
              </p>
            </div>
          </div>
        </div>

        {/* Report link */}
        <p className="mb-1.5 text-xs font-semibold text-foreground">Certified Report Link</p>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
          <span className="flex-1 truncate font-mono text-[11px] text-muted-foreground">{mockUrl}</span>
          <button
            onClick={handleCopy}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              copied ? "bg-tm-green text-white" : "bg-tm-blue text-white hover:bg-tm-blue/90"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Share actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-3 text-sm font-semibold text-foreground hover:bg-secondary">
            <Copy className="size-4" />
            Copy Link
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-3 text-sm font-semibold text-foreground hover:bg-secondary">
            <ExternalLink className="size-4" />
            Open Report
          </button>
          <button className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-tm-navy py-3 text-sm font-semibold text-white hover:bg-tm-navy/90">
            <Download className="size-4" />
            Download PDF Copy
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
interface DashboardReportScreenProps {
  vin: string
  onBack: () => void
  onGoHome: () => void
  engineState?: EngineState
  vehicleInfo?: {
    year?: number
    make?: string
    model?: string
    engine?: string
    transmission?: string
    mileage?: string
  }
}

type CertifyState = "idle" | "generating" | "ready"

export function DashboardReportScreen({
  vin,
  onBack,
  onGoHome,
  engineState = "healthy",
  vehicleInfo,
}: DashboardReportScreenProps) {
  const isFaulty = engineState === "faulty"
  const engineScore = isFaulty ? 42 : 87
  const listingScore = 83
  const historyScore = 85
  const overallScore = isFaulty ? 58 : 85

  const make = vehicleInfo?.make ?? "Honda"
  const model = vehicleInfo?.model ?? "Civic"
  const year = vehicleInfo?.year ?? 2021

  const technicalInsight = getTechnicalInsight(make, model, engineScore)

  const scoreColor = overallScore >= 75 ? "var(--tm-green)" : overallScore >= 50 ? "#f97316" : "#ef4444"
  const scoreLabel = overallScore >= 75 ? "Good Condition" : overallScore >= 50 ? "Fair Condition" : "Poor Condition"
  const scoreLabelColor = overallScore >= 75 ? "text-tm-green" : overallScore >= 50 ? "text-orange-500" : "text-red-500"

  const [certifyState, setCertifyState] = useState<CertifyState>("idle")
  const [showShareSheet, setShowShareSheet] = useState(false)

  // Progress steps for the generating animation
  const [genStep, setGenStep] = useState(0)
  const GEN_STEPS = [
    "Compiling audit data…",
    "Applying verification seal…",
    "Signing with cryptographic hash…",
    "Generating PDF…",
    "Report certified ✓",
  ]

  const handleGenerateCertified = () => {
    setCertifyState("generating")
    setGenStep(0)
    let step = 0
    const iv = setInterval(() => {
      step++
      setGenStep(step)
      if (step >= GEN_STEPS.length - 1) {
        clearInterval(iv)
        setTimeout(() => {
          setCertifyState("ready")
          setShowShareSheet(true)
        }, 600)
      }
    }, 550)
  }

  return (
    <>
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Audit Report</h2>
              <p className="text-xs text-muted-foreground font-mono">{vin || "N/A"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (certifyState === "ready") setShowShareSheet(true) }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Share report"
            >
              <Share2 className="size-4" />
            </button>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Download report">
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 flex flex-col gap-4">
          {/* Overall Score */}
          <div className="rounded-2xl bg-tm-navy p-5 text-center text-white">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/70">Overall Trust Score</p>
            <div className="relative mx-auto flex size-24 items-center justify-center">
              <svg className="size-24" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 264} 264`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span className="absolute text-2xl font-bold text-white">{overallScore}</span>
            </div>
            <p className={`mt-2 text-sm font-semibold ${scoreLabelColor}`}>{scoreLabel}</p>
          </div>

          {/* Section Scores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Mic, label: "Engine", score: engineScore, color: engineScore >= 70 ? "text-tm-green" : "text-red-500" },
              { icon: FileSearch, label: "Listing", score: listingScore, color: "text-tm-blue" },
              { icon: Shield, label: "History", score: historyScore, color: "text-tm-green" },
            ].map((section) => (
              <div key={section.label} className="flex flex-col items-center rounded-xl border border-border p-3">
                <section.icon className={`size-5 ${section.color}`} />
                <span className="mt-1 text-lg font-bold text-foreground">{section.score}</span>
                <span className="text-[10px] text-muted-foreground">{section.label}</span>
              </div>
            ))}
          </div>

          {/* Vehicle Info */}
          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Vehicle Details</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                ["Year", String(year)],
                ["Make", make],
                ["Model", model],
                ["Mileage", vehicleInfo?.mileage ?? "45,200 mi"],
                ["Engine", vehicleInfo?.engine ?? "2.0L 4-Cyl"],
                ["Trans.", vehicleInfo?.transmission ?? "CVT Auto"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attention Flags */}
          {isFaulty ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-red-500" />
                <p className="text-sm font-semibold text-foreground">Critical Attention Required</p>
              </div>
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                <li>— Rod knock detected: likely main bearing failure</li>
                <li>— Unstable idle pattern suggests misfiring cylinder</li>
                <li>— Belt wear severity: replace before purchase</li>
                <li>— Owner count discrepancy (Listed: 1, Found: 2)</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <p className="text-sm font-semibold text-foreground">Attention Items</p>
              </div>
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                <li>— Minor belt noise detected during engine analysis</li>
                <li>— Owner count discrepancy (Listed: 1, Found: 2)</li>
              </ul>
            </div>
          )}

          {/* Technical Insight */}
          {(isFaulty || technicalInsight) && (
            <div className="rounded-xl border border-tm-blue/30 bg-tm-blue/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-tm-blue" />
                <p className="text-sm font-semibold text-foreground">Technical Insight</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {technicalInsight ??
                  `Note: The ${make} ${model} has a known manufacturer bulletin for ${
                    KNOWN_ISSUES[`${make} ${model}`.toLowerCase()]?.issue ?? "timing chain wear"
                  }. The detected acoustic pattern is consistent with this common issue. ${
                    KNOWN_ISSUES[`${make} ${model}`.toLowerCase()]?.bulletin
                      ? `See ${KNOWN_ISSUES[`${make} ${model}`.toLowerCase()]?.bulletin}.`
                      : ""
                  }`}
              </p>
            </div>
          )}

          {/* Spacer so content isn't hidden behind fixed footer */}
          <div className="h-4" />
        </div>

        {/* ── Fixed bottom action bar ── */}
        <div className="border-t border-border bg-background px-4 pb-6 pt-3 flex flex-col gap-2">
          {/* Generate Certified Report button */}
          {certifyState === "idle" && (
            <button
              onClick={handleGenerateCertified}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-tm-navy to-tm-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-tm-blue/20 transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <BadgeCheck className="size-5" />
              Generate Certified Report
            </button>
          )}

          {certifyState === "generating" && (
            <div className="flex h-13 w-full flex-col items-center justify-center gap-1 rounded-xl border border-tm-blue/30 bg-tm-blue/5 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-tm-blue" />
                <span className="text-xs font-semibold text-tm-blue">{GEN_STEPS[genStep]}</span>
              </div>
              {/* Mini progress dots */}
              <div className="flex gap-1 mt-0.5">
                {GEN_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= genStep ? "w-4 bg-tm-blue" : "w-1 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {certifyState === "ready" && (
            <button
              onClick={() => setShowShareSheet(true)}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-tm-green py-3.5 text-sm font-bold text-white shadow-lg shadow-tm-green/20 transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <CheckCircle2 className="size-5" />
              Share Certified Report
            </button>
          )}

          {/* Back home */}
          <button
            onClick={onGoHome}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <Home className="size-4" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Share Sheet */}
      {showShareSheet && (
        <ShareSheet
          vin={vin}
          make={make}
          model={model}
          year={year}
          overallScore={overallScore}
          onClose={() => setShowShareSheet(false)}
        />
      )}
    </>
  )
}
