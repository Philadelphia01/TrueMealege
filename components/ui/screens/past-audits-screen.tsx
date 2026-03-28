"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Car,
  ChevronRight,
  Settings,
  HelpCircle,
  Bell,
  Moon,
  Shield,
  FileText,
} from "lucide-react"

interface PastAuditsScreenProps {
  onBack: () => void
  onStartNew: () => void
}

const pastAudits = [
  {
    id: "1",
    vehicle: "2020 Honda Accord EX-L",
    vin: "1HGBH41JXMN109186",
    date: "Feb 18, 2026",
    healthScore: 85,
    listingScore: 90,
    recommendation: "Safe to Buy",
  },
  {
    id: "2",
    vehicle: "2019 Toyota Camry SE",
    vin: "4T1B11HK5KU123456",
    date: "Feb 12, 2026",
    healthScore: 72,
    listingScore: 65,
    recommendation: "Proceed with Caution",
  },
  {
    id: "3",
    vehicle: "2021 BMW 3 Series",
    vin: "WBA5R1C57M7B12345",
    date: "Jan 28, 2026",
    healthScore: 92,
    listingScore: 95,
    recommendation: "Safe to Buy",
  },
]

const settingsItems = [
  { icon: Bell, label: "Notifications", chevron: true },
  { icon: Moon, label: "Dark Mode", chevron: true },
  { icon: Shield, label: "Privacy & Security", chevron: true },
  { icon: FileText, label: "Terms of Service", chevron: true },
  { icon: HelpCircle, label: "Help & Support", chevron: true },
]

function getRecColor(rec: string) {
  if (rec === "Safe to Buy") return "text-tm-green bg-tm-green/10"
  if (rec === "Proceed with Caution") return "text-tm-caution bg-tm-caution/10"
  return "text-tm-danger bg-tm-danger/10"
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-tm-green"
  if (score >= 60) return "text-tm-caution"
  return "text-tm-danger"
}

export function PastAuditsScreen({ onBack, onStartNew }: PastAuditsScreenProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Past Audits</h1>
        <button
          className="ml-auto flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary transition-colors"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Past audits list */}
        <div className="px-6 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Audits</h2>
            <span className="text-xs text-muted-foreground">{pastAudits.length} total</span>
          </div>

          <div className="flex flex-col gap-3">
            {pastAudits.map((audit) => (
              <button
                key={audit.id}
                className="flex items-start gap-3 rounded-xl bg-secondary p-3.5 text-left transition-colors hover:bg-secondary/80"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Car className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{audit.vehicle}</p>
                  <p className="text-xs text-muted-foreground font-mono">{audit.vin}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getRecColor(audit.recommendation)}`}>
                      {audit.recommendation}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{audit.date}</span>
                  </div>
                  <div className="mt-1.5 flex gap-3">
                    <span className="text-xs text-muted-foreground">
                      Health: <span className={`font-semibold ${getScoreColor(audit.healthScore)}`}>{audit.healthScore}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Listing: <span className={`font-semibold ${getScoreColor(audit.listingScore)}`}>{audit.listingScore}</span>
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Settings section */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Settings</h2>
          <div className="flex flex-col">
            {settingsItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={`flex items-center gap-3 py-3 text-left transition-colors hover:bg-secondary/50 ${
                    index < settingsItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <Icon className="size-5 text-muted-foreground" />
                  <span className="flex-1 text-sm text-foreground">{item.label}</span>
                  {item.chevron && <ChevronRight className="size-4 text-muted-foreground" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2">
        <Button
          size="lg"
          className="w-full bg-tm-green text-[#FFFFFF] hover:bg-tm-green/90 h-12 text-base font-semibold rounded-xl"
          onClick={onStartNew}
        >
          Start New Audit
        </Button>
      </div>
    </div>
  )
}
