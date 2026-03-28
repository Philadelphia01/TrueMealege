"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Audit } from "@/lib/types"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Search,
  Plus,
  Filter,
} from "lucide-react"

export default function HistoryPage() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<Audit[]>([])
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all")

  useEffect(() => {
    async function fetchAudits() {
      if (!user) return

      try {
        const auditsRef = collection(db, "audits")
        const q = query(
          auditsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )

        const snapshot = await getDocs(q)
        const auditsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          completedAt: doc.data().completedAt?.toDate(),
        })) as Audit[]

        setAudits(auditsList)
        setFilteredAudits(auditsList)
      } catch (error) {
        console.error("Error fetching audits:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAudits()
  }, [user])

  // Filter audits based on search and status
  useEffect(() => {
    let filtered = audits

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((audit) => audit.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((audit) => {
        const vehicle = audit.vehicle
        if (!vehicle) return false
        return (
          vehicle.make?.toLowerCase().includes(query) ||
          vehicle.model?.toLowerCase().includes(query) ||
          vehicle.vin?.toLowerCase().includes(query) ||
          vehicle.year?.toString().includes(query)
        )
      })
    }

    setFilteredAudits(filtered)
  }, [audits, searchQuery, statusFilter])

  const getStatusIcon = (status: Audit["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-[#1976D2]" />
      default:
        return <AlertTriangle className="h-5 w-5 text-[#FFA726]" />
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4CAF50]"
    if (score >= 60) return "text-[#FFA726]"
    return "text-[#E53E3E]"
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Audit History</h1>
            <p className="text-sm text-muted-foreground">
              {audits.length} total audit{audits.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/audit/new">
            <Button size="sm" className="gap-1 bg-[#4CAF50] hover:bg-[#43A047] text-white">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3">
          {(["all", "completed", "in_progress"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "bg-[#0D2A5D] text-white"
                  : ""
              }
            >
              {status === "all"
                ? "All"
                : status === "completed"
                ? "Completed"
                : "In Progress"}
            </Button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Car className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {searchQuery || statusFilter !== "all"
                ? "No matching audits"
                : "No audits yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start your first vehicle audit"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/audit/new">
                <Button className="gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white">
                  <Plus className="h-5 w-5" />
                  Start Audit
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredAudits.map((audit) => (
              <Link key={audit.id} href={`/audit/${audit.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(audit.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {audit.vehicle
                            ? `${audit.vehicle.year} ${audit.vehicle.make} ${audit.vehicle.model}`
                            : "New Audit"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {audit.createdAt?.toLocaleDateString()}
                          </span>
                          {audit.vehicle?.vin && (
                            <>
                              <span>•</span>
                              <span className="font-mono">
                                {audit.vehicle.vin.slice(0, 8)}...
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {audit.analysis && (
                          <span
                            className={`text-lg font-bold ${getHealthScoreColor(
                              audit.analysis.healthScore
                            )}`}
                          >
                            {audit.analysis.healthScore}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
