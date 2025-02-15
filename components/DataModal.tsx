"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { intl } from "@/lib/i18n"
import type { TableData } from "@/types/table"

interface DataModalProps {
  isOpen: boolean
  onClose: () => void
  data: TableData
  columns: string[]
  onSave: (updatedData: TableData) => void
}

export function DataModal({ isOpen, onClose, data, columns, onSave }: DataModalProps) {
  const [editedData, setEditedData] = useState<TableData>({})

  useEffect(() => {
    setEditedData(data)
  }, [data])

  const handleInputChange = (column: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [column]: value }))
  }

  const handleSave = () => {
    onSave(editedData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{intl.formatMessage({ id: "app.editData" })}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {columns.map((column) => (
            <div key={column} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={column} className="text-right">
                {column}
              </Label>
              <Input
                id={column}
                value={editedData[column] || ""}
                onChange={(e) => handleInputChange(column, e.target.value)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{intl.formatMessage({ id: "app.save" })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

