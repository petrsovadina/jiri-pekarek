"use client"

import { useState } from "react"
import { TableUploader } from "@/components/TableUploader"
import { DataTable } from "@/components/DataTable"
import { AIPromptPanel } from "@/components/AIPromptPanel"
import { ExportButton } from "@/components/ExportButton"
import { Notifications, type Notification } from "@/components/Notifications"
import type { TableData } from "@/types/table"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  const [data, setData] = useState<TableData[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [contextColumns, setContextColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification])
  }

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (parsedData: { data: TableData[] }) => {
    setIsLoading(true)
    setTimeout(() => {
      setData(parsedData.data)
      setColumns(parsedData.data.length > 0 ? Object.keys(parsedData.data[0]) : [])
      setIsLoading(false)
      addNotification({
        type: "success",
        message: "Data byla úspěšně nahrána.",
      })
    }, 500)
  }

  const handleAddColumn = () => {
    if (newColumnName && data.length > 0) {
      const newData = data.map((row) => ({
        ...row,
        [newColumnName]: "",
      }))
      setData(newData)
      setColumns([...columns, newColumnName])
      setIsAddColumnOpen(false)
      setNewColumnName("")
      addNotification({
        type: "success",
        message: `Sloupec "${newColumnName}" byl úspěšně přidán.`,
      })
    }
  }

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column)
  }

  const handleContextColumnsChange = (columns: string[]) => {
    setContextColumns(columns)
  }

  const handleDataUpdate = (updatedData: TableData[]) => {
    setData(updatedData)
    addNotification({
      type: "info",
      message: "Data byla aktualizována.",
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <Notifications notifications={notifications} onNotificationDismiss={removeNotification} />
      <main className="flex-grow container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">TableGenAI</h1>
          {data.length > 0 && <ExportButton data={data} filename="tablegenai-export" />}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <TableUploader onUpload={handleFileUpload} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button onClick={() => setIsAddColumnOpen(true)}>Přidat nový sloupec</Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataTable
                  data={data}
                  columns={columns}
                  selectedColumn={selectedColumn}
                  onColumnSelect={handleColumnSelect}
                  onDataUpdate={handleDataUpdate}
                />
              </div>
              <div>
                <AIPromptPanel
                  selectedColumn={selectedColumn}
                  contextColumns={contextColumns}
                  allColumns={columns}
                  data={data}
                  onDataGenerated={handleDataUpdate}
                  onContextColumnsChange={handleContextColumnsChange}
                />
              </div>
            </div>
          </div>
        )}

        <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Přidat nový sloupec</DialogTitle>
              <DialogDescription>Zadejte název nového sloupce, který chcete přidat do tabulky.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Název
                </Label>
                <Input
                  id="name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddColumn}>Přidat sloupec</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}

