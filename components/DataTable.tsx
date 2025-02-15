"use client"

import { useState, useMemo, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, ArrowUpDown } from "lucide-react"
import type { TableData } from "@/types/table"
import { useVirtualizer } from "@tanstack/react-virtual"

interface DataTableProps {
  data: TableData[]
  columns: string[]
  selectedColumn: string | null
  onColumnSelect: (column: string) => void
  onDataUpdate: (updatedData: TableData[]) => void
}

export function DataTable({ data, columns, selectedColumn, onColumnSelect, onDataUpdate }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredAndSortedData = useMemo(() => {
    const result = data.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (sortColumn) {
      result.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, sortColumn, sortDirection])

  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  })

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...data]
    newData[rowIndex] = { ...newData[rowIndex], [column]: value }
    onDataUpdate(newData)
  }

  const handleDeleteColumn = (columnToDelete: string) => {
    const newData = data.map((row) => {
      const newRow = { ...row }
      delete newRow[columnToDelete]
      return newRow
    })
    onDataUpdate(newData)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Vyhledat..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="border rounded-lg">
        <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="relative">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => onColumnSelect(column)}
                        className={`text-left font-bold ${selectedColumn === column ? "text-primary" : ""}`}
                      >
                        {column}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleSort(column)}>
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                      {columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteColumn(column)}
                          className="p-0 h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <TableRow key={virtualRow.index}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${virtualRow.index}-${column}`}
                      onClick={() => setEditingCell({ row: virtualRow.index, column })}
                      className="cursor-pointer"
                    >
                      {editingCell?.row === virtualRow.index && editingCell?.column === column ? (
                        <Input
                          value={String(filteredAndSortedData[virtualRow.index][column] || "")}
                          onChange={(e) => handleCellEdit(virtualRow.index, column, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        String(filteredAndSortedData[virtualRow.index][column] || "")
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

