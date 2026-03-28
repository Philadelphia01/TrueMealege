"use client"

/**
 * /demo — Full pitch-mode audit flow
 *
 * This page wires all screen components together with a global `auditData`
 * object that flows through every step. No Firebase required — pure demo.
 *
 * Flow:  welcome → vin → recording → analysis → listing → report
 */

import { useState } from "react"
import { PhoneFrame } from "@/components/phone-frame"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { VinEntryScreen } from "@/components/screens/vin-entry-screen"
import { EngineRecordingScreen, type EngineState } from "@/components/screens/engine-recording-screen"
import { EngineAnalysisScreen } from "@/components/screens/engine-analysis-screen"
import { ListingVerificationScreen } from "@/components/screens/listing-verification-screen"
import { DashboardReportScreen } from "@/components/screens/dashboard-report-screen"

// ── VIN → vehicle info lookup (demo data) ──────────────────────────────────
const VIN_DATABASE: Record<string, AuditVehicleInfo> = {
  "1HGBH41JXMN109186": { year: 2021, make: "Honda",      model: "Civic",     engine: "2.0L 4-Cyl", transmission: "CVT Auto",    mileage: "45,200 mi", engineCylinders: 4, fuelType: "Gasoline" },
  "5YJSA1E26MF123456": { year: 2021, make: "Tesla",      model: "Model S",   engine: "Dual Motor", transmission: "Single-Speed", mileage: "28,100 mi", engineCylinders: 0, fuelType: "Electric" },
  "1G1ZD5ST4JF123456": { year: 2018, make: "Chevrolet",  model: "Malibu",    engine: "1.5L 4-Cyl", transmission: "6-Speed Auto", mileage: "67,400 mi", engineCylinders: 4, fuelType: "Gasoline" },
  "WBA3A5G5XDNS12345": { year: 2019, make: "BMW",        model: "3 Series",  engine: "2.0L 4-Cyl", transmission: "8-Speed Auto", mileage: "52,800 mi", engineCylinders: 4, fuelType: "Gasoline" },
  "1FTEW1EP7JFA12345": { year: 2020, make: "Ford",       model: "F-150",     engine: "3.5L V6",    transmission: "10-Speed Auto", mileage: "38,900 mi", engineCylinders: 6, fuelType: "Gasoline" },
  "KNDJP3A50H7012345": { year: 2017, make: "Kia",        model: "Sportage",  engine: "2.4L 4-Cyl", transmission: "6-Speed Auto", mileage: "81,200 mi", engineCylinders: 4, fuelType: "Gasoline" },
  "2T1BURHE0JC012345": { year: 2018, make: "Toyota",     model: "Corolla",   engine: "1.8L 4-Cyl", transmission: "CVT Auto",    mileage: "59,300 mi", engineCylinders: 4, fuelType: "Gasoline" },
  "1C4RJFAG8JC012345": { year: 2018, make: "Jeep",       model: "Grand Cherokee", engine: "3.6L V6", transmission: "8-Speed Auto", mileage: "72,000 mi", engineCylinders: 6, fuelType: "Gasoline" },
}

const FALLBACK_VEHICLE: AuditVehicleInfo = {
  year: 2020, make: "Honda", model: "Civic", engine: "2.0L 4-Cyl",
  transmission: "CVT Auto", mileage: "45,200 mi", engineCylinders: 4, fuelType: "Gasoline",
}

// ── Types ──────────────────────────────────────────────────────────────────
interface AuditVehicleInfo {
  year: number
  make: string
  model: string
  engine: string
  transmission: string
  mileage: string
  engineCylinders: number
  fuelType: string
}

interface AuditData {
  vin: string
  vinInfo: AuditVehicleInfo | null
  audioAnalysisResult: EngineState | null
  listingData: {
    url: string
    claimedCylinders?: string
    claimedFuel?: string
  } | null
}

type Screen = "welcome" | "vin" | "recording" | "analysis" | "listing" | "report"

// ── Component ──────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [screen, setScreen] = useState<Screen>("welcome")

  // 🌐 Global auditData — single source of truth for the whole flow
  const [auditData, setAuditData] = useState<AuditData>({
    vin: "",
    vinInfo: null,
    audioAnalysisResult: null,
    listingData: null,
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleVinProceed = (vin: string) => {
    const vinInfo = VIN_DATABASE[vin] ?? { ...FALLBACK_VEHICLE }
    setAuditData((prev) => ({ ...prev, vin, vinInfo }))
    setScreen("recording")
  }

  const handleAnalysisComplete = (engineState: EngineState) => {
    setAuditData((prev) => ({ ...prev, audioAnalysisResult: engineState }))
    setScreen("analysis")
  }

  const handleListingProceed = () => {
    setScreen("report")
  }

  const handleGoHome = () => {
    // Reset everything for a fresh demo run
    setAuditData({ vin: "", vinInfo: null, audioAnalysisResult: null, listingData: null })
    setScreen("welcome")
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return (
          <WelcomeScreen
            onStartAudit={() => setScreen("vin")}
            onLearnMore={() => setScreen("vin")}
          />
        )

      case "vin":
        return (
          <VinEntryScreen
            onBack={() => setScreen("welcome")}
            onProceed={handleVinProceed}
          />
        )

      case "recording":
        return (
          <EngineRecordingScreen
            vin={auditData.vin}
            onBack={() => setScreen("vin")}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )

      case "analysis":
        return (
          <EngineAnalysisScreen
            onBack={() => setScreen("recording")}
            onProceed={() => setScreen("listing")}
            engineState={auditData.audioAnalysisResult ?? "healthy"}
          />
        )

      case "listing":
        return (
          <ListingVerificationScreen
            onBack={() => setScreen("analysis")}
            onProceed={handleListingProceed}
            vehicleInfo={auditData.vinInfo ?? undefined}
          />
        )

      case "report":
        return (
          <DashboardReportScreen
            vin={auditData.vin}
            onBack={() => setScreen("listing")}
            onGoHome={handleGoHome}
            engineState={auditData.audioAnalysisResult ?? "healthy"}
            vehicleInfo={auditData.vinInfo ?? undefined}
          />
        )
    }
  }

  return (
    <>
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-purple-600 px-4 py-1.5 text-xs font-medium text-white">
        <span>🎯 Demo Mode — {auditData.vin || "No VIN yet"}</span>
        <span className="font-mono opacity-70 capitalize">{screen}</span>
      </div>
      <div className="pt-7">
        <PhoneFrame>{renderScreen()}</PhoneFrame>
      </div>
    </>
  )
}
