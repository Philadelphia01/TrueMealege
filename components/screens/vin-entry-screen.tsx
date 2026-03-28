"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Camera, Search, Car } from "lucide-react"

interface VinEntryScreenProps {
  onBack: () => void
  onProceed: (vin: string) => void
}

export function VinEntryScreen({ onBack, onProceed }: VinEntryScreenProps) {
  const [vin, setVin] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const cleaned = vin.trim().toUpperCase()
    if (cleaned.length !== 17) {
      setError("VIN must be exactly 17 characters")
      return
    }
    setError("")
    onProceed(cleaned)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Enter VIN</h2>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6">
        {/* Car Illustration */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-tm-green/10">
            <Car className="size-10 text-tm-green" />
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground leading-relaxed">
            Enter the 17-character Vehicle Identification Number to begin the audit.
          </p>
        </div>

        {/* VIN Input */}
        <label htmlFor="vin-input" className="mb-2 text-sm font-medium text-foreground">
          Vehicle Identification Number
        </label>
        <Input
          id="vin-input"
          value={vin}
          onChange={(e) => {
            setVin(e.target.value.toUpperCase())
            setError("")
          }}
          placeholder="e.g. 1HGBH41JXMN109186"
          maxLength={17}
          className="h-12 rounded-xl border-border bg-secondary/50 font-mono text-base tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:font-sans"
        />
        {error && <p className="mt-1 text-xs text-tm-danger">{error}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          {vin.length}/17 characters
        </p>

        {/* Scan Option */}
        <button className="mt-4 flex items-center gap-2 self-start rounded-lg bg-tm-blue/10 px-3 py-2 text-sm font-medium text-tm-blue hover:bg-tm-blue/20">
          <Camera className="size-4" />
          Scan VIN with Camera
        </button>

        {/* Recent VINs */}
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</p>
          {[
            { vin: "1HGBH41JXMN109186", car: "2021 Honda Civic" },
            { vin: "5YJSA1E26MF123456", car: "2021 Tesla Model S" },
          ].map((item) => (
            <button
              key={item.vin}
              onClick={() => {
                setVin(item.vin)
                setError("")
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-secondary/50"
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground font-mono tracking-wide">{item.vin}</p>
                <p className="text-xs text-muted-foreground">{item.car}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={vin.trim().length === 0}
          className="h-12 w-full rounded-xl bg-tm-green text-white font-semibold text-base hover:bg-tm-green/90 disabled:opacity-40"
        >
          Proceed to Audit
        </Button>
      </div>
    </div>
  )
}
