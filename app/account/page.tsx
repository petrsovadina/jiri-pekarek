"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { ApiKeyManager } from "@/components/ApiKeyManager"

export default function AccountPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    if (userEmail) {
      setEmail(userEmail)
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Nastavení účtu</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informace o účtu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={email} disabled />
              </div>
              <Button onClick={handleLogout} variant="outline">
                Odhlásit se
              </Button>
            </CardContent>
          </Card>
          <ApiKeyManager />
        </div>
      </main>
      <Footer />
    </div>
  )
}

