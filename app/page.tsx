"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Shield, BarChart3, CheckCircle } from "lucide-react"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <Image
          src="/images/logo.png"
          alt="TrueMileage"
          width={220}
          height={80}
          className="mb-8 h-20 w-auto"
          priority
        />
        
        {/* Tagline */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
          Know a Car Before<br />You Buy It
        </h1>
        <p className="mb-8 max-w-sm text-muted-foreground">
          AI-powered engine analysis, listing verification, and comprehensive vehicle reports.
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link href="/register" className="w-full">
            <Button className="h-14 w-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-semibold shadow-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="h-14 w-full text-lg font-semibold border-2">
              Sign In
            </Button>
          </Link>
          <Link href="/demo" className="w-full">
            <Button variant="ghost" className="h-10 w-full text-sm font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700">
              🎯 Try Interactive Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-bold text-foreground">
          How It Works
        </h2>
        
        <div className="mx-auto flex max-w-sm flex-col gap-6">
          <FeatureItem
            icon={<Car className="h-6 w-6" />}
            title="Enter VIN"
            description="Decode vehicle information instantly using the VIN"
          />
          <FeatureItem
            icon={<BarChart3 className="h-6 w-6" />}
            title="Record Engine"
            description="Our AI analyzes engine sounds for potential issues"
          />
          <FeatureItem
            icon={<Shield className="h-6 w-6" />}
            title="Verify Listing"
            description="Compare seller claims against our analysis"
          />
          <FeatureItem
            icon={<CheckCircle className="h-6 w-6" />}
            title="Get Report"
            description="Receive a comprehensive vehicle health report"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-6 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TrueMileage. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]/10 text-[#4CAF50]">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
