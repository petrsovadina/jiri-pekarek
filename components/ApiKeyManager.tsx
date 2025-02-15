"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeyManager() {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")

  const handleSaveKey = () => {
    if (!apiKey) {
      toast({
        title: "Chyba",
        description: "Prosím zadejte API klíč",
        variant: "destructive",
      })
      return
    }

    // Zde by byla implementace ukládání API klíče
    localStorage.setItem("anthropic_api_key", apiKey)
    
    toast({
      title: "Úspěch",
      description: "API klíč byl úspěšně uložen",
      variant: "default",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Správa API klíče</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Anthropic API Klíč
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
          />
          <p className="text-sm text-muted-foreground">
            Zadejte váš Anthropic API klíč pro použití Claude AI
          </p>
        </div>
        <Button onClick={handleSaveKey} className="w-full">
          Uložit API klíč
        </Button>
      </CardContent>
    </Card>
  )
}