"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, Mic, FileSearch, ChevronRight } from "lucide-react"

interface WelcomeScreenProps {
  onStartAudit: () => void
  onLearnMore: () => void
}

export function WelcomeScreen({ onStartAudit, onLearnMore }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-8 pb-4">
        <Image
          src="/images/logo.png"
          alt="TrueMileage Logo"
          width={200}
          height={120}
          className="mb-4"
          priority
        />
        <h1 className="text-center text-2xl font-bold text-foreground">
          AI-Powered Vehicle Auditor
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
          Know a car before you buy it. Get instant engine health analysis, listing verification, and comprehensive reports.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col gap-3 px-6 pb-4">
        {[
          { icon: Mic, title: "Engine Analysis", desc: "AI listens to your engine to detect issues" },
          { icon: FileSearch, title: "Listing Check", desc: "Cross-reference listings for accuracy" },
          { icon: Shield, title: "Trust Score", desc: "Get an overall vehicle trust rating" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tm-green/10">
              <item.icon className="size-5 text-tm-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 px-6 pb-8">
        <Button
          onClick={onStartAudit}
          className="h-12 w-full rounded-xl bg-tm-green text-white font-semibold text-base hover:bg-tm-green/90"
        >
          Start Audit
          <ChevronRight className="ml-1 size-5" />
        </Button>
        <Button
          onClick={onLearnMore}
          variant="outline"
          className="h-10 w-full rounded-xl text-sm font-medium"
        >
          Learn More
        </Button>
      </div>
    </div>
  )
}
