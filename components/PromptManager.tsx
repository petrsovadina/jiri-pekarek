"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { ExternalTable } from "@/components/ExternalTableManager"

interface Prompt {
  id: string
  name: string
  text: string
}

interface PromptManagerProps {
  onSelectPrompt: (prompt: Prompt) => void
  selectedColumn: string | null
  externalTables: ExternalTable[]
}

export function PromptManager({ onSelectPrompt, selectedColumn, externalTables }: PromptManagerProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPromptName, setNewPromptName] = useState("")
  const [newPromptText, setNewPromptText] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedPrompts = localStorage.getItem("prompts")
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("prompts", JSON.stringify(prompts))
  }, [prompts])

  const handleSavePrompt = () => {
    if (!newPromptName || !newPromptText) {
      toast({
        title: "Chyba",
        description: "Název a text promptu jsou povinné.",
        variant: "destructive",
      })
      return
    }

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      name: newPromptName,
      text: newPromptText,
    }
    setPrompts([...prompts, newPrompt])
    setIsDialogOpen(false)
    setNewPromptName("")
    setNewPromptText("")
    toast({
      title: "Prompt uložen",
      description: `Prompt "${newPromptName}" byl úspěšně uložen.`,
    })
  }

  const handleSelectPrompt = (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId)
    if (prompt) {
      setSelectedPrompt(prompt)
      onSelectPrompt(prompt)
    }
  }

  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter((p) => p.id !== promptId))
    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(null)
    }
    toast({
      title: "Prompt smazán",
      description: "Vybraný prompt byl úspěšně smazán.",
    })
  }

  const insertExternalTableVariable = (tableName: string, columnName: string) => {
    setNewPromptText((prevText) => `${prevText}{${tableName}.${columnName}}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Správa promptů</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={handleSelectPrompt} value={selectedPrompt?.id || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Vyberte prompt" />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPrompt && (
          <div className="space-y-2">
            <h3 className="font-medium">Vybraný prompt:</h3>
            <p className="text-sm">{selectedPrompt.text}</p>
            <Button variant="outline" onClick={() => handleDeletePrompt(selectedPrompt.id)}>
              Smazat prompt
            </Button>
          </div>
        )}

        <Button onClick={() => setIsDialogOpen(true)}>Vytvořit nový prompt</Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vytvořit nový prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Název promptu"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
              />
              <Textarea
                placeholder="Text promptu"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                rows={5}
              />
              <div>
                <p className="text-sm font-medium mb-2">Vložit proměnnou z externí tabulky:</p>
                {externalTables.map((table) => (
                  <div key={table.id} className="mb-2">
                    <p className="text-sm font-medium mb-1">{table.name}:</p>
                    <div className="flex flex-wrap gap-2">
                      {table.columns.map((column) => (
                        <Button
                          key={column}
                          variant="outline"
                          size="sm"
                          onClick={() => insertExternalTableVariable(table.name, column)}
                        >
                          {column}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Tip: Použijte {"{název_sloupce}"} pro vložení hodnoty z vybraného sloupce.
                {selectedColumn && ` Např.: {${selectedColumn}}`}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePrompt}>Uložit prompt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

