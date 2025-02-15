"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: "Chyba při registraci",
        description: "Hesla se neshodují",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Zde by byla implementace skutečné registrace
      // Pro demo účely simulujeme registraci
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)

      toast({
        title: "Registrace úspěšná",
        description: "Vítejte v aplikaci TableGenAI",
      })

      router.push("/account")
    } catch {
      toast({
        title: "Chyba při registraci",
        description: "Zkuste to prosím znovu",
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
          <CardTitle className="text-2xl text-center">Registrace do TableGenAI</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrace..." : "Zaregistrovat se"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Již máte účet?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Přihlaste se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

