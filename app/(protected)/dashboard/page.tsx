"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Audit } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Car, Clock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentAudits, setRecentAudits] = useState<Audit[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      
      try {
        const auditsRef = collection(db, "audits")
        const q = query(
          auditsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        )
        
        const snapshot = await getDocs(q)
        const audits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          completedAt: doc.data().completedAt?.toDate(),
        })) as Audit[]
        
        setRecentAudits(audits)
        
        // Get stats
        const allAuditsQ = query(auditsRef, where("userId", "==", user.uid))
        const allSnapshot = await getDocs(allAuditsQ)
        
        let completed = 0
        let inProgress = 0
        
        allSnapshot.docs.forEach((doc) => {
          const status = doc.data().status
          if (status === "completed") completed++
          else if (status === "in_progress") inProgress++
        })
        
        setStats({
          total: allSnapshot.size,
          completed,
          inProgress,
        })
      } catch (error) {
        console.error("Error fetching audits:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

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

  const getStatusText = (status: Audit["status"]) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      default:
        return "Cancelled"
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="TrueMileage"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
        </div>
      </header>
      
      <div className="flex flex-col gap-6 p-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Ready to audit a vehicle?
          </p>
        </div>

        {/* Quick Action */}
        <Link href="/audit/new">
          <Button className="h-14 w-full gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-semibold shadow-lg">
            <Plus className="h-6 w-6" />
            Start New Audit
          </Button>
        </Link>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <span className="text-2xl font-bold text-foreground">{stats.total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <span className="text-2xl font-bold text-[#4CAF50]">{stats.completed}</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <span className="text-2xl font-bold text-[#1976D2]">{stats.inProgress}</span>
              <span className="text-xs text-muted-foreground">In Progress</span>
            </CardContent>
          </Card>
        </div>

        {/* Recent Audits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Audits</CardTitle>
              <Link href="/history" className="text-sm text-[#1976D2] hover:underline">
                View all
              </Link>
            </div>
            <CardDescription>Your latest vehicle audits</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentAudits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Car className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No audits yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Start your first audit to see it here
                </p>
              </div>
            ) : (
              recentAudits.map((audit) => (
                <Link key={audit.id} href={`/audit/${audit.id}`}>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                    {getStatusIcon(audit.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {audit.vehicle 
                          ? `${audit.vehicle.year} ${audit.vehicle.make} ${audit.vehicle.model}`
                          : "New Audit"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(audit.status)} • {audit.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-3">
          <Card className="bg-gradient-to-br from-[#0D2A5D] to-[#1A3B6D]">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="rounded-full bg-white/10 p-2">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Engine Analysis</h3>
                <p className="text-sm text-white/80">
                  Our AI listens to engine sounds to detect potential issues before you buy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
