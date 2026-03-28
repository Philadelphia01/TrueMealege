"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User,
  Mail,
  Calendar,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  Car,
  CheckCircle2,
  Clock,
} from "lucide-react"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!user) return

      try {
        const auditsRef = collection(db, "audits")
        const q = query(auditsRef, where("userId", "==", user.uid))
        const snapshot = await getDocs(q)

        let completed = 0
        let inProgress = 0

        snapshot.docs.forEach((doc) => {
          const status = doc.data().status
          if (status === "completed") completed++
          else if (status === "in_progress") inProgress++
        })

        setStats({
          total: snapshot.size,
          completed,
          inProgress,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
    }
  }

  const menuItems = [
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your notification preferences",
      href: "#",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Manage your account security",
      href: "#",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help with TrueMileage",
      href: "#",
    },
    {
      icon: FileText,
      label: "Terms of Service",
      description: "Read our terms and conditions",
      href: "#",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-[#4CAF50]" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Member since {user?.createdAt?.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Audits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4CAF50]">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1976D2]">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toast.info("Coming soon!")}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="h-12 border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>

        {/* App Version */}
        <div className="text-center py-4">
          <Image
            src="/images/logo.png"
            alt="TrueMileage"
            width={100}
            height={32}
            className="mx-auto h-8 w-auto opacity-50 mb-2"
          />
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TrueMileage
          </p>
        </div>
      </main>
    </div>
  )
}
