"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TableData } from "@/types/table"
import { intl } from "@/lib/i18n"

interface DataAnalysisProps {
  data: TableData[]
  columns: string[]
}

export function DataAnalysis({ data, columns }: DataAnalysisProps) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)

  const analysis = useMemo(() => {
    if (!selectedColumn) return null

    const columnData = data.map((row) => row[selectedColumn])
    const numericData = columnData.filter((value) => !isNaN(Number(value))).map(Number)

    const sum = numericData.reduce((acc, val) => acc + val, 0)
    const mean = sum / numericData.length
    const sortedData = [...numericData].sort((a, b) => a - b)
    const median = sortedData[Math.floor(sortedData.length / 2)]
    const min = Math.min(...numericData)
    const max = Math.max(...numericData)

    const uniqueValues = new Set(columnData).size
    const nonEmptyValues = columnData.filter((value) => value !== null && value !== "").length

    return {
      count: data.length,
      uniqueValues,
      nonEmptyValues,
      sum: numericData.length ? sum.toFixed(2) : "N/A",
      mean: numericData.length ? mean.toFixed(2) : "N/A",
      median: numericData.length ? median.toFixed(2) : "N/A",
      min: numericData.length ? min.toFixed(2) : "N/A",
      max: numericData.length ? max.toFixed(2) : "N/A",
    }
  }, [data, selectedColumn])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intl.formatMessage({ id: "app.dataAnalysis" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={(value) => setSelectedColumn(value)}>
          <SelectTrigger className="w-[180px] mb-4">
            <SelectValue placeholder={intl.formatMessage({ id: "app.selectColumn" })} />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {analysis && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{intl.formatMessage({ id: "app.metric" })}</TableHead>
                <TableHead>{intl.formatMessage({ id: "app.value" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.count" })}</TableCell>
                <TableCell>{analysis.count}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.uniqueValues" })}</TableCell>
                <TableCell>{analysis.uniqueValues}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.nonEmptyValues" })}</TableCell>
                <TableCell>{analysis.nonEmptyValues}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.sum" })}</TableCell>
                <TableCell>{analysis.sum}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.mean" })}</TableCell>
                <TableCell>{analysis.mean}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.median" })}</TableCell>
                <TableCell>{analysis.median}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.min" })}</TableCell>
                <TableCell>{analysis.min}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{intl.formatMessage({ id: "app.max" })}</TableCell>
                <TableCell>{analysis.max}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

