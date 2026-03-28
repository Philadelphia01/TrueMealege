"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Link2, ChevronRight, AlertCircle } from "lucide-react"

interface VehicleInfo {
  year?: number
  make?: string
  model?: string
  engineCylinders?: number
  fuelType?: string
  transmissionStyle?: string
}

interface ListingVerificationScreenProps {
  onBack: () => void
  onProceed: () => void
  vehicleInfo?: VehicleInfo
}

const verificationResults = [
  { label: "Mileage Match", status: "pass" as const, detail: "Listed: 45,200 mi | Record: 45,180 mi" },
  { label: "Title Status", status: "pass" as const, detail: "Clean title verified" },
  { label: "Accident History", status: "pass" as const, detail: "No accidents reported" },
  { label: "Owner Count", status: "warning" as const, detail: "Listed: 1 owner | Record: 2 owners" },
  { label: "Service Records", status: "pass" as const, detail: "Regular maintenance confirmed" },
  { label: "Price Analysis", status: "pass" as const, detail: "Fair market price range" },
]

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-tm-green", bg: "bg-tm-green/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  fail: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
}

// Common cylinder options
const cylinderOptions = ["4", "6", "8", "Other"]
const fuelOptions = ["Gasoline", "Diesel", "Hybrid", "Electric"]

interface Discrepancy {
  field: string
  vinValue: string
  claimedValue: string
  message: string
}

export function ListingVerificationScreen({ onBack, onProceed, vehicleInfo }: ListingVerificationScreenProps) {
  const [url, setUrl] = useState("https://cars.example.com/listing/12345")
  const [verified, setVerified] = useState(false)
  const [claimedCylinders, setClaimedCylinders] = useState("")
  const [claimedFuel, setClaimedFuel] = useState("")
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([])

  const vinCylinders = vehicleInfo?.engineCylinders?.toString() ?? "6"
  const vinFuel = vehicleInfo?.fuelType ?? "Gasoline"

  const handleVerify = () => {
    const found: Discrepancy[] = []

    // Check cylinders
    if (claimedCylinders && claimedCylinders !== vinCylinders) {
      found.push({
        field: "cylinders",
        vinValue: `${vinCylinders} cylinders`,
        claimedValue: `${claimedCylinders} cylinders`,
        message: `Listing Discrepancy: Seller claims ${claimedCylinders}-cyl but VIN confirms ${vinCylinders}-cyl engine.`,
      })
    }

    // Check fuel type (normalize comparison)
    const normalizedVinFuel = vinFuel.toLowerCase()
    const normalizedClaimed = claimedFuel.toLowerCase()
    if (claimedFuel && !normalizedVinFuel.includes(normalizedClaimed) && !normalizedClaimed.includes(normalizedVinFuel)) {
      found.push({
        field: "fuel",
        vinValue: vinFuel,
        claimedValue: claimedFuel,
        message: `Listing Discrepancy: Seller claims ${claimedFuel} but VIN confirms ${vinFuel}.`,
      })
    }

    setDiscrepancies(found)
    setVerified(true)
  }

  const hasDiscrepancies = discrepancies.length > 0
  const passCount = verificationResults.filter((r) => r.status === "pass").length - (hasDiscrepancies ? 1 : 0)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Listing Verification</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        {!verified ? (
          <>
            <div className="mb-5 flex flex-col items-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-tm-blue/10">
                <Link2 className="size-8 text-tm-blue" />
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground leading-relaxed">
                Paste the listing URL and enter seller-claimed specs to cross-reference with VIN data.
              </p>
            </div>

            <label htmlFor="listing-url" className="mb-2 block text-sm font-medium text-foreground">
              Listing URL
            </label>
            <Input
              id="listing-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste listing URL here..."
              className="mb-4 h-12 rounded-xl border-border bg-secondary/50 text-sm"
            />

            {/* Seller-claimed specs — "Liar Detector" fields */}
            <div className="mb-1 text-sm font-medium text-foreground">Seller Claims (optional)</div>
            <p className="mb-3 text-xs text-muted-foreground">
              Enter what the seller lists — we'll compare against VIN data.
            </p>

            {/* Cylinders */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Cylinders (Seller Claims)
              </label>
              <div className="flex gap-2">
                {cylinderOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setClaimedCylinders(c === claimedCylinders ? "" : c)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors border ${
                      claimedCylinders === c
                        ? "border-tm-blue bg-tm-blue text-white"
                        : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Type */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Fuel Type (Seller Claims)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fuelOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setClaimedFuel(f === claimedFuel ? "" : f)}
                    className={`rounded-lg py-2 text-xs font-semibold transition-colors border ${
                      claimedFuel === f
                        ? "border-tm-blue bg-tm-blue text-white"
                        : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={!url.trim()}
              className="h-12 w-full rounded-xl bg-tm-blue text-white font-semibold hover:bg-tm-blue/90 disabled:opacity-40"
            >
              Verify Listing
            </Button>
          </>
        ) : (
          <>
            {/* Discrepancy Alerts */}
            {discrepancies.map((d) => (
              <div
                key={d.field}
                className="mb-3 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-semibold text-red-500">Listing Discrepancy Detected</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.message}</p>
                </div>
              </div>
            ))}

            {/* Summary Banner */}
            <div
              className={`mb-4 rounded-xl border p-4 text-center ${
                hasDiscrepancies
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-tm-green/30 bg-tm-green/5"
              }`}
            >
              {hasDiscrepancies ? (
                <XCircle className="mx-auto mb-2 size-8 text-red-500" />
              ) : (
                <CheckCircle2 className="mx-auto mb-2 size-8 text-tm-green" />
              )}
              <p className="text-sm font-semibold text-foreground">
                {hasDiscrepancies ? "Discrepancies Found" : "Listing Mostly Verified"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasDiscrepancies
                  ? `${discrepancies.length} spec mismatch${discrepancies.length > 1 ? "es" : ""} with VIN data`
                  : `5 of 6 items passed. 1 discrepancy found.`}
              </p>
            </div>

            {/* Standard Results */}
            <div className="flex flex-col gap-2">
              {verificationResults.map((item) => {
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
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      {verified && (
        <div className="px-6 pb-6">
          <Button
            onClick={onProceed}
            className="h-12 w-full rounded-xl bg-tm-green text-white font-semibold text-base hover:bg-tm-green/90"
          >
            View Full Report
            <ChevronRight className="ml-1 size-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
