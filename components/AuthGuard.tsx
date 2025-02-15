"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const publicPaths = ["/login", "/register"]

    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      router.push("/login")
    } else if (isLoggedIn && publicPaths.includes(pathname)) {
      router.push("/")
    } else {
      setIsAuthorized(true)
    }
  }, [router, pathname])

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

