"use client"

import type { ReactNode } from "react"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="relative mx-auto w-full max-w-[390px]">
        {/* Phone shell */}
        <div className="overflow-hidden rounded-[2.5rem] border-[8px] border-black bg-background shadow-2xl">
          {/* Notch */}
          <div className="relative flex h-7 items-center justify-center bg-black">
            <div className="h-4 w-28 rounded-b-2xl bg-black" />
          </div>
          {/* Screen content */}
          <div className="relative h-[740px] overflow-y-auto">
            {children}
          </div>
          {/* Home indicator */}
          <div className="flex items-center justify-center pb-2 pt-1 bg-background">
            <div className="h-1 w-32 rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
