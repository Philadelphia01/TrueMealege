"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with logo */}
      <header className="flex items-center justify-center py-8">
        <Image
          src="/images/logo.png"
          alt="TrueMileage"
          width={180}
          height={60}
          className="h-14 w-auto"
        />
      </header>
      
      {/* Content */}
      <main className="flex flex-1 flex-col px-6 pb-8">
        {children}
      </main>
    </div>
  )
}
