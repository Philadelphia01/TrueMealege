"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { VehicleInfo, AudioAnalysis, ListingVerification, Audit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AudioRecorder } from "@/components/audio-recorder"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Mic,
  BarChart3,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react"

type Step = "vin" | "recording" | "analysis" | "listing" | "report"

const STEPS: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: "vin", title: "Vehicle", icon: Car },
  { id: "recording", title: "Record", icon: Mic },
  { id: "analysis", title: "Analysis", icon: BarChart3 },
  { id: "listing", title: "Listing", icon: Shield },
  { id: "report", title: "Report", icon: FileText },
]

export default function NewAuditPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("vin")
  const [isLoading, setIsLoading] = useState(false)
  
  // Audit data
  const [auditId, setAuditId] = useState<string | null>(null)
  const [vin, setVin] = useState("")
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [listing, setListing] = useState<ListingVerification>({
    claimedMileage: 0,
    askingPrice: 0,
    sellerType: "private",
    verificationResults: {
      mileageConsistency: "consistent",
      priceAssessment: "fair",
      flags: [],
      recommendations: [],
    },
  })
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // VIN Decode
  const handleVinDecode = async () => {
    if (!vin || vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/vin/decode?vin=${vin}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to decode VIN")
      }

      setVehicle(data)
      
      // Create audit document in Firestore
      if (user) {
        const auditRef = await addDoc(collection(db, "audits"), {
          userId: user.uid,
          status: "in_progress",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          vehicle: data,
        })
        setAuditId(auditRef.id)
      }

      toast.success("Vehicle decoded successfully!")
      setCurrentStep("recording")
    } catch (error) {
      console.error("VIN decode error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to decode VIN")
    } finally {
      setIsLoading(false)
    }
  }

  // Audio Recording Complete
  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setAudioBlob(blob)
    setAudioDuration(duration)

    // Upload to Firebase Storage
    if (user && auditId) {
      setIsLoading(true)
      try {
        const storageRef = ref(storage, `audits/${auditId}/engine-sound.webm`)
        await uploadBytes(storageRef, blob)
        const downloadUrl = await getDownloadURL(storageRef)
        setAudioUrl(downloadUrl)

        // Update audit document
        await updateDoc(doc(db, "audits", auditId), {
          audioUrl: downloadUrl,
          audioDuration: duration,
          recordedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast.success("Recording uploaded!")
        setCurrentStep("analysis")
        
        // Start analysis
        analyzeAudio(downloadUrl)
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload recording. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Analyze Audio
  const analyzeAudio = async (url: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", audioUrl: url }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setAnalysis(data)

      // Update audit document
      if (auditId) {
        await updateDoc(doc(db, "audits", auditId), {
          analysis: data,
          analyzedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Analysis failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Listing Verification
  const handleListingSubmit = async () => {
    if (listing.claimedMileage <= 0 || listing.askingPrice <= 0) {
      toast.error("Please enter valid mileage and price")
      return
    }

    setIsLoading(true)
    try {
      // Simple verification logic
      const verificationResults = {
        mileageConsistency: "consistent" as const,
        priceAssessment: "fair" as const,
        flags: [] as string[],
        recommendations: [] as string[],
      }

      // Check mileage vs age
      if (vehicle) {
        const vehicleAge = new Date().getFullYear() - vehicle.year
        const expectedMileage = vehicleAge * 12000 // Average 12k miles/year
        const mileageDiff = Math.abs(listing.claimedMileage - expectedMileage)

        if (listing.claimedMileage < expectedMileage * 0.5) {
          verificationResults.mileageConsistency = "suspicious"
          verificationResults.flags.push("Mileage significantly lower than expected for vehicle age")
        } else if (listing.claimedMileage > expectedMileage * 1.5) {
          verificationResults.mileageConsistency = "consistent"
          verificationResults.recommendations.push("Higher than average mileage - negotiate accordingly")
        }

        // Simple price assessment based on health score
        if (analysis) {
          if (analysis.healthScore < 70 && listing.askingPrice > 10000) {
            verificationResults.priceAssessment = "above_market"
            verificationResults.flags.push("Price may be high given engine health score")
          }
        }
      }

      const updatedListing = { ...listing, verificationResults }
      setListing(updatedListing)

      // Update audit document
      if (auditId) {
        await updateDoc(doc(db, "audits", auditId), {
          listing: updatedListing,
          verifiedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      // Generate AI summary
      await generateSummary(updatedListing)

      setCurrentStep("report")
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate AI Summary
  const generateSummary = async (listingData: ListingVerification) => {
    if (!vehicle || !analysis) return

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-summary",
          vehicle,
          analysis,
          listing: listingData,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setAiSummary(data.summary)

        // Update audit document
        if (auditId) {
          await updateDoc(doc(db, "audits", auditId), {
            aiSummary: data.summary,
            status: "completed",
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      }
    } catch (error) {
      console.error("Summary generation error:", error)
    }
  }

  // Complete audit
  const handleComplete = () => {
    toast.success("Audit completed!")
    router.push("/dashboard")
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "vin":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Enter Vehicle VIN</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Find the VIN on the dashboard or door jamb
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vin">Vehicle Identification Number</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="vin"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="Enter 17-character VIN"
                    className="pl-10 h-12 font-mono uppercase"
                    maxLength={17}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {vin.length}/17 characters
                </p>
              </div>

              <Button
                onClick={handleVinDecode}
                disabled={vin.length !== 17 || isLoading}
                className="h-12 bg-[#4CAF50] hover:bg-[#43A047] text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Decoding...
                  </span>
                ) : (
                  "Decode VIN"
                )}
              </Button>
            </div>

            {vehicle && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Vehicle Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-semibold text-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    {vehicle.trim && (
                      <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {vehicle.engineCylinders}cyl • {vehicle.fuelType} • {vehicle.transmissionStyle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "recording":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Record Engine Sound</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Position your phone near the engine bay
              </p>
            </div>

            {vehicle && (
              <Card className="bg-muted/50">
                <CardContent className="flex items-center gap-3 p-3">
                  <Car className="h-5 w-5 text-[#4CAF50]" />
                  <span className="text-sm font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </span>
                </CardContent>
              </Card>
            )}

            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              maxDuration={30}
              disabled={isLoading}
            />
          </div>
        )

      case "analysis":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Engine Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI is analyzing your engine recording
              </p>
            </div>

            {isLoading && !analysis ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse" />
                  <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-[#4CAF50] animate-spin" />
                </div>
                <p className="text-muted-foreground">Analyzing audio patterns...</p>
              </div>
            ) : analysis ? (
              <div className="flex flex-col gap-4">
                {/* Health Score */}
                <Card>
                  <CardContent className="flex flex-col items-center gap-4 p-6">
                    <div className="relative">
                      <svg className="h-32 w-32 -rotate-90 transform">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(analysis.healthScore / 100) * 352} 352`}
                          className={
                            analysis.healthScore >= 80
                              ? "text-[#4CAF50]"
                              : analysis.healthScore >= 60
                              ? "text-[#FFA726]"
                              : "text-[#E53E3E]"
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{analysis.healthScore}</span>
                        <span className="text-xs text-muted-foreground">out of 100</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold capitalize text-foreground">
                        {analysis.overallCondition} Condition
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Findings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {analysis.findings.map((finding, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        {finding.type === "positive" ? (
                          <CheckCircle2 className="h-5 w-5 text-[#4CAF50] mt-0.5" />
                        ) : finding.type === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-[#FFA726] mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-[#E53E3E] mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{finding.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {finding.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setCurrentStep("listing")}
                  className="h-12 bg-[#4CAF50] hover:bg-[#43A047] text-white"
                >
                  Continue to Listing Verification
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>
        )

      case "listing":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Verify Listing</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the seller&apos;s claimed details
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mileage">Claimed Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={listing.claimedMileage || ""}
                  onChange={(e) =>
                    setListing({ ...listing, claimedMileage: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g. 75000"
                  className="h-12"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Asking Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={listing.askingPrice || ""}
                  onChange={(e) =>
                    setListing({ ...listing, askingPrice: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g. 15000"
                  className="h-12"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Seller Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={listing.sellerType === "private" ? "default" : "outline"}
                    className={listing.sellerType === "private" ? "flex-1 bg-[#0D2A5D]" : "flex-1"}
                    onClick={() => setListing({ ...listing, sellerType: "private" })}
                  >
                    Private
                  </Button>
                  <Button
                    type="button"
                    variant={listing.sellerType === "dealer" ? "default" : "outline"}
                    className={listing.sellerType === "dealer" ? "flex-1 bg-[#0D2A5D]" : "flex-1"}
                    onClick={() => setListing({ ...listing, sellerType: "dealer" })}
                  >
                    Dealer
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleListingSubmit}
                disabled={isLoading}
                className="h-12 mt-2 bg-[#4CAF50] hover:bg-[#43A047] text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    Generate Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case "report":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Audit Report</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your comprehensive vehicle analysis
              </p>
            </div>

            {/* Vehicle Summary */}
            {vehicle && (
              <Card className="bg-gradient-to-br from-[#0D2A5D] to-[#1A3B6D]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-white/70">{vehicle.vin}</p>
                    </div>
                    {analysis && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                        <span className="text-xl font-bold text-white">
                          {analysis.healthScore}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Summary */}
            {aiSummary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#4CAF50]" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Listing Verification Results */}
            {listing.verificationResults && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Listing Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mileage Check</span>
                    <span
                      className={`text-sm font-medium capitalize ${
                        listing.verificationResults.mileageConsistency === "consistent"
                          ? "text-[#4CAF50]"
                          : listing.verificationResults.mileageConsistency === "suspicious"
                          ? "text-[#FFA726]"
                          : "text-[#E53E3E]"
                      }`}
                    >
                      {listing.verificationResults.mileageConsistency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price Assessment</span>
                    <span
                      className={`text-sm font-medium capitalize ${
                        listing.verificationResults.priceAssessment === "fair"
                          ? "text-[#4CAF50]"
                          : listing.verificationResults.priceAssessment === "above_market"
                          ? "text-[#FFA726]"
                          : "text-[#E53E3E]"
                      }`}
                    >
                      {listing.verificationResults.priceAssessment.replace("_", " ")}
                    </span>
                  </div>
                  
                  {listing.verificationResults.flags.length > 0 && (
                    <div className="mt-2 rounded-lg bg-[#FFA726]/10 p-3">
                      <p className="text-sm font-medium text-[#FFA726] mb-1">Flags</p>
                      {listing.verificationResults.flags.map((flag, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {flag}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleComplete}
              className="h-12 bg-[#4CAF50] hover:bg-[#43A047] text-white"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Complete Audit
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(STEPS[currentStepIndex - 1].id)
              } else {
                router.back()
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">New Audit</h1>
            <p className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </p>
          </div>
        </div>
        
        {/* Progress */}
        <Progress value={progress} className="h-1 rounded-none" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  isCompleted || isCurrent ? "text-[#4CAF50]" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-[#4CAF50] text-white"
                      : isCurrent
                      ? "border-2 border-[#4CAF50] text-[#4CAF50]"
                      : "border-2 border-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{step.title}</span>
              </div>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">{renderStepContent()}</main>
    </div>
  )
}
