"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Search, ChevronRight, Clock, Car, Settings, Bell, HelpCircle, LogOut } from "lucide-react"

interface PastAuditsScreenProps {
  onBack: () => void
  onStartNew: () => void
}

const pastAudits = [
  {
    vin: "1HGBH41JXMN109186",
    car: "2021 Honda Civic",
    date: "Feb 15, 2026",
    score: 87,
    scoreColor: "text-tm-green",
  },
  {
    vin: "5YJSA1E26MF123456",
    car: "2021 Tesla Model S",
    date: "Feb 10, 2026",
    score: 92,
    scoreColor: "text-tm-green",
  },
  {
    vin: "WBAPH5C55BA271234",
    car: "2011 BMW 328i",
    date: "Jan 28, 2026",
    score: 64,
    scoreColor: "text-tm-caution",
  },
]

export function PastAuditsScreen({ onBack, onStartNew }: PastAuditsScreenProps) {
  const [tab, setTab] = useState<"audits" | "settings">("audits")

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">
          {tab === "audits" ? "Past Audits" : "Settings"}
        </h2>
      </div>

      {/* Tab Toggle */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("audits")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === "audits"
              ? "border-b-2 border-tm-green text-tm-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Audit History
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === "settings"
              ? "border-b-2 border-tm-green text-tm-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "audits" ? (
          <div className="px-6 pt-4 pb-4">
            {/* Search */}
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Search audits...</span>
            </div>

            {/* Audit List */}
            <div className="flex flex-col gap-3">
              {pastAudits.map((audit) => (
                <div
                  key={audit.vin}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tm-navy/5">
                    <Car className="size-5 text-tm-navy" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{audit.car}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {audit.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-bold ${audit.scoreColor}`}>{audit.score}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 pt-4 pb-4">
            {/* Settings List */}
            <div className="flex flex-col gap-1">
              {[
                { icon: Bell, label: "Notifications", desc: "Manage alerts" },
                { icon: Settings, label: "Preferences", desc: "App settings" },
                { icon: HelpCircle, label: "Help & Support", desc: "Get assistance" },
                { icon: LogOut, label: "Sign Out", desc: "Log out of your account" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-secondary/50"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <item.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Audit Button */}
      {tab === "audits" && (
        <div className="px-6 pb-6">
          <Button
            onClick={onStartNew}
            className="h-12 w-full rounded-xl bg-tm-green text-white font-semibold text-base hover:bg-tm-green/90"
          >
            <Plus className="mr-2 size-5" />
            Start New Audit
          </Button>
        </div>
      )}
    </div>
  )
}
