"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, ArrowLeft, ArrowRight, Info } from "lucide-react"

interface VinEntryScreenProps {
  onBack: () => void
  onProceed: (vin: string) => void
}

export function VinEntryScreen({ onBack, onProceed }: VinEntryScreenProps) {
  const [vin, setVin] = useState("")
  const [scanning, setScanning] = useState(false)

  const isValidVin = vin.length === 17

  const handleScanVin = () => {
    setScanning(true)
    // Simulate a VIN scan
    setTimeout(() => {
      setVin("1HGBH41JXMN109186")
      setScanning(false)
    }, 1500)
  }

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
        <div>
          <h1 className="text-lg font-semibold text-foreground">Enter VIN</h1>
          <p className="text-xs text-muted-foreground">Vehicle Identification Number</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6 pt-6">
        {/* Info card */}
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-tm-blue/5 border border-tm-blue/15 p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-tm-blue" />
          <div>
            <p className="text-sm font-medium text-foreground">What is a VIN?</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              A 17-character code unique to every vehicle. Find it on the dashboard (driver side), 
              door jamb, or vehicle registration.
            </p>
          </div>
        </div>

        {/* VIN Input */}
        <label className="mb-2 text-sm font-medium text-foreground">
          Enter Vehicle VIN
        </label>
        <Input
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase().slice(0, 17))}
          placeholder="e.g. 1HGBH41JXMN109186"
          className="mb-2 h-12 rounded-xl font-mono text-base tracking-wider"
          maxLength={17}
        />
        <p className="mb-6 text-xs text-muted-foreground">
          {vin.length}/17 characters
          {vin.length > 0 && vin.length < 17 && (
            <span className="text-tm-caution"> — incomplete</span>
          )}
          {isValidVin && (
            <span className="text-tm-green"> — valid length</span>
          )}
        </p>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Scan Button */}
        <Button
          variant="outline"
          className="mb-6 h-20 w-full flex-col gap-2 rounded-xl border-dashed border-2"
          onClick={handleScanVin}
          disabled={scanning}
        >
          <Camera className="size-6 text-tm-blue" />
          <span className="text-sm font-medium">
            {scanning ? "Scanning..." : "Scan VIN with Camera"}
          </span>
        </Button>

        {/* Sample VINs for demo */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick demo VINs:</p>
          <div className="flex flex-wrap gap-2">
            {["1HGBH41JXMN109186", "5YJSA1DN5DFP14705"].map((sampleVin) => (
              <button
                key={sampleVin}
                onClick={() => setVin(sampleVin)}
                className="rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs text-foreground hover:bg-secondary/80 transition-colors"
              >
                {sampleVin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2">
        <Button
          size="lg"
          className="w-full bg-tm-green text-[#FFFFFF] hover:bg-tm-green/90 h-12 text-base font-semibold rounded-xl disabled:opacity-40"
          onClick={() => onProceed(vin)}
          disabled={!isValidVin}
        >
          Proceed
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </div>
  )
}
