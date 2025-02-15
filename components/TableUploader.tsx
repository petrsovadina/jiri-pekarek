"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, FileSpreadsheet, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import type { TableData } from "@/types/table"
import { intl } from "@/lib/i18n"

interface TableUploaderProps {
  onUpload: (data: { data: TableData[] }) => void
}

export function TableUploader({ onUpload }: TableUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const processFile = useCallback(
    (file: File) => {
      setError(null)
      setIsUploading(true)
      setUploadProgress(0)
      setSuccess(false)

      const updateProgress = (progress: number) => {
        setUploadProgress(progress)
      }

      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError(intl.formatMessage({ id: "app.fileParseError" }))
              setIsUploading(false)
              return
            }
            onUpload({ data: results.data as TableData[] })
            setIsUploading(false)
            setSuccess(true)
          },
          error: (error) => {
            setError(error.message)
            setIsUploading(false)
          },
          step: (results, parser) => {
            updateProgress((parser.handled / parser.total) * 100)
          },
        })
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as TableData[]
            onUpload({ data: jsonData })
            setIsUploading(false)
            setSuccess(true)
          } catch (error) {
            setError(intl.formatMessage({ id: "app.fileReadError" }))
            setIsUploading(false)
          }
        }
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            updateProgress((event.loaded / event.total) * 100)
          }
        }
        reader.onerror = () => {
          setError(intl.formatMessage({ id: "app.fileReadError" }))
          setIsUploading(false)
        }
        reader.readAsArrayBuffer(file)
      } else {
        setError(intl.formatMessage({ id: "app.unsupportedFileType" }))
        setIsUploading(false)
      }
    },
    [onUpload],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intl.formatMessage({ id: "app.uploadFile" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary hover:bg-primary/5"}
            ${error ? "border-red-500" : ""}
            ${success ? "border-green-500" : ""}`}
        >
          <input {...getInputProps()} />
          {isUploading && (
            <Progress value={uploadProgress} className="mt-4" />
          )}
          {!isUploading && !error && !success && (
            <p className="mt-4">{intl.formatMessage({ id: "app.dropFileHere" })}</p>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mt-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{intl.formatMessage({ id: "app.fileUploadedSuccessfully" })}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

