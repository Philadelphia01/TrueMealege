"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Audit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Car,
  Calendar,
  BarChart3,
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Share2,
} from "lucide-react"
import { toast } from "sonner"

export default function AuditDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAudit() {
      if (!params.id) return

      try {
        const auditDoc = await getDoc(doc(db, "audits", params.id as string))
        if (auditDoc.exists()) {
          const data = auditDoc.data()
          setAudit({
            id: auditDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            recordedAt: data.recordedAt?.toDate(),
            analyzedAt: data.analyzedAt?.toDate(),
            verifiedAt: data.verifiedAt?.toDate(),
          } as Audit)
        }
      } catch (error) {
        console.error("Error fetching audit:", error)
        toast.error("Failed to load audit")
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [params.id])

  const handleShare = async () => {
    if (!audit) return

    const shareData = {
      title: `TrueMileage Audit - ${audit.vehicle?.year} ${audit.vehicle?.make} ${audit.vehicle?.model}`,
      text: `Vehicle Health Score: ${audit.analysis?.healthScore}/100`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Share error:", error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Audit not found</p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Audit Details</h1>
              <p className="text-xs text-muted-foreground">
                {audit.createdAt?.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Vehicle Card */}
        {audit.vehicle && (
          <Card className="bg-gradient-to-br from-[#0D2A5D] to-[#1A3B6D]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white/10 p-2">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {audit.vehicle.year} {audit.vehicle.make} {audit.vehicle.model}
                    </p>
                    <p className="text-sm text-white/70 font-mono">{audit.vehicle.vin}</p>
                    {audit.vehicle.trim && (
                      <p className="text-sm text-white/60">{audit.vehicle.trim}</p>
                    )}
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    audit.status === "completed" ? "bg-[#4CAF50]/20" : "bg-white/10"
                  }`}
                >
                  {audit.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-[#4CAF50]" />
                  ) : (
                    <Clock className="h-6 w-6 text-white/70" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Score */}
        {audit.analysis && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#4CAF50]" />
                Engine Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="h-24 w-24 -rotate-90 transform">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(audit.analysis.healthScore / 100) * 251} 251`}
                      className={
                        audit.analysis.healthScore >= 80
                          ? "text-[#4CAF50]"
                          : audit.analysis.healthScore >= 60
                          ? "text-[#FFA726]"
                          : "text-[#E53E3E]"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{audit.analysis.healthScore}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold capitalize">
                    {audit.analysis.overallCondition} Condition
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on AI audio analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        {audit.aiSummary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{audit.aiSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Findings */}
        {audit.analysis?.findings && audit.analysis.findings.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detailed Findings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {audit.analysis.findings.map((finding, index) => (
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
                    <p className="text-xs text-muted-foreground">{finding.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {Math.round(finding.confidence * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Listing Verification */}
        {audit.listing && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#1976D2]" />
                Listing Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Claimed Mileage</p>
                  <p className="text-lg font-semibold">
                    {audit.listing.claimedMileage.toLocaleString()} mi
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Asking Price</p>
                  <p className="text-lg font-semibold">
                    ${audit.listing.askingPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-muted-foreground">Mileage Assessment</span>
                <span
                  className={`text-sm font-medium capitalize ${
                    audit.listing.verificationResults.mileageConsistency === "consistent"
                      ? "text-[#4CAF50]"
                      : audit.listing.verificationResults.mileageConsistency === "suspicious"
                      ? "text-[#FFA726]"
                      : "text-[#E53E3E]"
                  }`}
                >
                  {audit.listing.verificationResults.mileageConsistency}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-muted-foreground">Price Assessment</span>
                <span
                  className={`text-sm font-medium capitalize ${
                    audit.listing.verificationResults.priceAssessment === "fair"
                      ? "text-[#4CAF50]"
                      : "text-[#FFA726]"
                  }`}
                >
                  {audit.listing.verificationResults.priceAssessment.replace("_", " ")}
                </span>
              </div>

              {audit.listing.verificationResults.flags.length > 0 && (
                <div className="rounded-lg bg-[#FFA726]/10 p-3 mt-2">
                  <p className="text-sm font-medium text-[#FFA726] mb-1">Flags</p>
                  {audit.listing.verificationResults.flags.map((flag, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      • {flag}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{audit.createdAt?.toLocaleString()}</span>
            </div>
            {audit.recordedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recorded</span>
                <span>{audit.recordedAt.toLocaleString()}</span>
              </div>
            )}
            {audit.analyzedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzed</span>
                <span>{audit.analyzedAt.toLocaleString()}</span>
              </div>
            )}
            {audit.completedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span>{audit.completedAt.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
