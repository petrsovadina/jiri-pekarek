"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { intl } from "@/lib/i18n"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { TableUploader } from "@/components/TableUploader"
import { DataTable } from "@/components/DataTable"
import type { TableData } from "@/types/table"

export default function DataPage() {
  const [data, setData] = useState<TableData[]>([])
  const [columns, setColumns] = useState<string[]>([])

  const handleFileUpload = (parsedData: { data: TableData[] }) => {
    setData(parsedData.data)
    setColumns(Object.keys(parsedData.data[0]))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{intl.formatMessage({ id: "app.data" })}</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: "app.uploadData" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <TableUploader onUpload={handleFileUpload} />
          </CardContent>
        </Card>
        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{intl.formatMessage({ id: "app.dataPreview" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={data}
                columns={columns}
                selectedColumn={null}
                onColumnSelect={() => {}}
                onDataUpdate={() => {}}
              />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

