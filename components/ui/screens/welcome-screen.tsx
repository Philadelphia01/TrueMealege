"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, BarChart3, Search } from "lucide-react"

interface WelcomeScreenProps {
  onStartAudit: () => void
  onLearnMore: () => void
}

export function WelcomeScreen({ onStartAudit, onLearnMore }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Hero section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-8 pb-4">
        <div className="mb-6">
          <Image
            src="/images/logo.png"
            alt="TrueMileage logo"
            width={200}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-foreground text-balance">
          AI-Powered Vehicle Auditor
        </h1>
        <p className="mb-8 text-center text-base text-muted-foreground text-pretty">
          Know a car before you buy it
        </p>

        {/* Feature highlights */}
        <div className="mb-8 flex w-full flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tm-green/10">
              <Shield className="size-5 text-tm-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Engine Health Analysis</p>
              <p className="text-xs text-muted-foreground">AI-powered sound diagnostics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tm-blue/10">
              <Search className="size-5 text-tm-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Listing Verification</p>
              <p className="text-xs text-muted-foreground">Detect inconsistencies instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tm-navy/10">
              <BarChart3 className="size-5 text-tm-navy" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Comprehensive Reports</p>
              <p className="text-xs text-muted-foreground">Download and share results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 px-6 pb-6">
        <Button
          size="lg"
          className="w-full bg-tm-green text-[#FFFFFF] hover:bg-tm-green/90 h-12 text-base font-semibold rounded-xl"
          onClick={onStartAudit}
        >
          Start Audit
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12 text-base font-semibold rounded-xl"
          onClick={onLearnMore}
        >
          Learn More
        </Button>
      </div>
    </div>
  )
}
