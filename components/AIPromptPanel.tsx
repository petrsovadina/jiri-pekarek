"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Progress } from "./ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useToast } from "./ui/use-toast"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import type { TableData } from "../types/table"
import { generateAIContent } from "@/lib/ai"

interface AIPromptPanelProps {
  selectedColumn: string | null
  contextColumns: string[]
  allColumns: string[]
  data: TableData[]
  onDataGenerated: (newData: TableData[]) => void
  onContextColumnsChange: (columns: string[]) => void
}

export const AIPromptPanel = ({
  selectedColumn,
  contextColumns,
  allColumns,
  data,
  onDataGenerated,
  onContextColumnsChange,
}: AIPromptPanelProps) => {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleContextColumnToggle = (column: string) => {
    const updatedColumns = contextColumns.includes(column)
      ? contextColumns.filter((c) => c !== column)
      : [...contextColumns, column]
    onContextColumnsChange(updatedColumns)
  }

  const handleGenerate = async () => {
    if (!selectedColumn) {
      toast({
        title: "Chyba",
        description: "Prosím vyberte cílový sloupec pro generování",
        variant: "destructive",
      })
      return
    }

    if (!prompt) {
      toast({
        title: "Chyba",
        description: "Prosím zadejte prompt pro generování",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      const newData = [...data]
      const totalRows = data.length
      let errorCount = 0

      for (let i = 0; i < totalRows; i++) {
        const row = data[i]
        const context = contextColumns.reduce(
          (acc, column) => {
            acc[column] = row[column]
            return acc
          },
          {} as Record<string, string>,
        )

        try {
          console.log(`Generuji obsah pro řádek ${i + 1}`)
          const generatedText = await generateAIContent(prompt, context)
          console.log(`Vygenerovaný obsah pro řádek ${i + 1}:`, generatedText)
          newData[i] = {
            ...row,
            [selectedColumn]: generatedText,
          }
        } catch (error) {
          console.error(`Chyba při generování pro řádek ${i + 1}:`, error)
          const errorMessage = error instanceof Error ? error.message : "Neznámá chyba"
          newData[i] = {
            ...row,
            [selectedColumn]: `Chyba: ${errorMessage}`,
          }
          errorCount++

          toast({
            title: `Chyba při generování řádku ${i + 1}`,
            description: `${errorMessage}. Zkontrolujte síťové připojení a zkuste to znovu.`,
            variant: "destructive",
          })
        }

        setProgress(Math.round(((i + 1) / totalRows) * 100))
      }

      onDataGenerated(newData)

      if (errorCount > 0) {
        toast({
          title: "Generování dokončeno s chybami",
          description: `Generování bylo dokončeno, ale ${errorCount} řádků obsahuje chyby. Zkontrolujte prosím výsledky.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Generování dokončeno",
          description: "Všechny řádky byly úspěšně vygenerovány.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Došlo k chybě při generování dat:", error)
      const errorMessage = error instanceof Error ? error.message : "Neznámá chyba při generování dat"
      toast({
        title: "Chyba",
        description: `${errorMessage}. Zkontrolujte síťové připojení a zkuste to znovu.`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generování pomocí AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedColumn ? (
          <>
            <div>
              <p className="text-sm font-medium mb-2">Vybraný sloupec pro generování:</p>
              <p className="text-lg font-bold">{selectedColumn}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Kontextové sloupce:</p>
              <div className="grid grid-cols-2 gap-2">
                {allColumns
                  .filter((column) => column !== selectedColumn)
                  .map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={contextColumns.includes(column)}
                        onCheckedChange={() => handleContextColumnToggle(column)}
                      />
                      <Label htmlFor={column}>{column}</Label>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt pro generování:</Label>
              <Textarea
                id="prompt"
                placeholder="Zadejte prompt pro generování..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
              <p className="text-sm text-muted-foreground">
                Použijte {"{nazev_sloupce}"} pro vložení hodnoty z kontextového sloupce
              </p>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generuji..." : "Generovat"}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center">{progress}% dokončeno</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Vyberte sloupec v tabulce, pro který chcete generovat hodnoty</p>
        )}
      </CardContent>
    </Card>
  )
}

