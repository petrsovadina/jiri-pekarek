"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // V produkční verzi by zde byl skutečný login endpoint
      // Pro demo účely simulujeme přihlášení
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)

      toast({
        title: "Přihlášení úspěšné",
        description: "Vítejte v aplikaci TableGenAI",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Chyba při přihlášení",
        description: "Zkontrolujte své přihlašovací údaje a zkuste to znovu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Přihlášení do TableGenAI</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Přihlašování..." : "Přihlásit se"}
            </Button>
          </form>
        </CardContent>
        <p className="mt-4 text-center text-sm">
          Nemáte účet?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Zaregistrujte se
          </Link>
        </p>
      </Card>
    </div>
  )
}

