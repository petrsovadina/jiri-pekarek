"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { intl } from "@/lib/i18n"
import Papa from "papaparse"

export interface ExternalTable {
  id: string
  name: string
  url: string
  columns: string[]
  data: Record<string, string>[]
}

interface ExternalTableManagerProps {
  onTablesUpdate: (tables: ExternalTable[]) => void
}

export function ExternalTableManager({ onTablesUpdate }: ExternalTableManagerProps) {
  const [externalTables, setExternalTables] = useState<ExternalTable[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [newTableUrl, setNewTableUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    onTablesUpdate(externalTables)
  }, [externalTables, onTablesUpdate])

  const addExternalTable = async () => {
    if (!newTableName || !newTableUrl) {
      toast({
        title: intl.formatMessage({ id: "app.error" }),
        description: intl.formatMessage({ id: "app.externalTableAddError" }),
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(newTableUrl)
      const text = await response.text()
      const result = Papa.parse(text, { header: true })

      if (result.errors.length > 0) {
        throw new Error(intl.formatMessage({ id: "app.csvParseError" }))
      }

      const newTable: ExternalTable = {
        id: Date.now().toString(),
        name: newTableName,
        url: newTableUrl,
        columns: result.meta.fields || [],
        data: result.data as Record<string, string>[],
      }

      setExternalTables([...externalTables, newTable])
      setIsAddDialogOpen(false)
      setNewTableName("")
      setNewTableUrl("")

      toast({
        title: intl.formatMessage({ id: "app.externalTableAdded" }),
        description: intl.formatMessage({ id: "app.externalTableAddedDescription" }),
      })
    } catch (error) {
      toast({
        title: intl.formatMessage({ id: "app.error" }),
        description: intl.formatMessage({ id: "app.externalTableFetchError" }),
        variant: "destructive",
      })
    }
  }

  const removeExternalTable = (id: string) => {
    setExternalTables(externalTables.filter((table) => table.id !== id))
    toast({
      title: intl.formatMessage({ id: "app.externalTableRemoved" }),
      description: intl.formatMessage({ id: "app.externalTableRemovedDescription" }),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intl.formatMessage({ id: "app.externalTables" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setIsAddDialogOpen(true)} className="mb-4">
          {intl.formatMessage({ id: "app.addExternalTable" })}
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{intl.formatMessage({ id: "app.tableName" })}</TableHead>
              <TableHead>{intl.formatMessage({ id: "app.url" })}</TableHead>
              <TableHead>{intl.formatMessage({ id: "app.columns" })}</TableHead>
              <TableHead>{intl.formatMessage({ id: "app.actions" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {externalTables.map((table) => (
              <TableRow key={table.id}>
                <TableCell>{table.name}</TableCell>
                <TableCell>{table.url}</TableCell>
                <TableCell>{table.columns.join(", ")}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => removeExternalTable(table.id)}>
                    {intl.formatMessage({ id: "app.remove" })}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{intl.formatMessage({ id: "app.addExternalTable" })}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tableName" className="text-right">
                  {intl.formatMessage({ id: "app.tableName" })}
                </Label>
                <Input
                  id="tableName"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tableUrl" className="text-right">
                  {intl.formatMessage({ id: "app.url" })}
                </Label>
                <Input
                  id="tableUrl"
                  value={newTableUrl}
                  onChange={(e) => setNewTableUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addExternalTable}>{intl.formatMessage({ id: "app.add" })}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

