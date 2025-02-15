"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { TableData } from "@/types/table"
import { intl } from "@/lib/i18n"

type ValidationRule = {
  column: string
  type: "required" | "number" | "date" | "email" | "custom" | "length" | "regex" | "enum"
  customRegex?: string
  min?: number
  max?: number
  format?: string
  options?: string[]
}

interface DataValidatorProps {
  data: TableData[]
  columns: string[]
  onInvalidData: (invalidData: { [key: string]: boolean }) => void
}

export function DataValidator({ data, columns, onInvalidData }: DataValidatorProps) {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([])
  const [newRule, setNewRule] = useState<ValidationRule>({ column: "", type: "required" })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [invalidData, setInvalidData] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  const validateData = useCallback(() => {
    const newInvalidData: { [key: string]: boolean } = {}

    data.forEach((row, rowIndex) => {
      validationRules.forEach((rule) => {
        const value = row[rule.column]
        let isValid = true

        switch (rule.type) {
          case "required":
            isValid = value !== undefined && value !== null && value !== ""
            break
          case "number":
            isValid = !isNaN(Number(value))
            if (isValid && rule.min !== undefined) {
              isValid = Number(value) >= rule.min
            }
            if (isValid && rule.max !== undefined) {
              isValid = Number(value) <= rule.max
            }
            break
          case "date":
            isValid = !isNaN(Date.parse(value as string))
            break
          case "email":
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
            break
          case "custom":
            if (rule.customRegex) {
              const regex = new RegExp(rule.customRegex)
              isValid = regex.test(value as string)
            }
            break
          case "length":
            isValid = value.length >= (rule.min || 0) && value.length <= (rule.max || Number.POSITIVE_INFINITY)
            break
          case "regex":
            isValid = rule.customRegex ? new RegExp(rule.customRegex).test(value) : true
            break
          case "enum":
            isValid = rule.options ? rule.options.includes(value) : true
            break
        }

        if (!isValid) {
          newInvalidData[`${rowIndex}-${rule.column}`] = true
        }
      })
    })

    setInvalidData(newInvalidData)
    onInvalidData(newInvalidData)
  }, [data, validationRules, onInvalidData])

  useEffect(() => {
    validateData()
  }, [validateData])

  const addValidationRule = () => {
    if (newRule.column && newRule.type) {
      setValidationRules([...validationRules, newRule])
      setNewRule({ column: "", type: "required" })
      toast({
        title: intl.formatMessage({ id: "app.validationRuleAdded" }),
        description: intl.formatMessage({ id: "app.validationRuleAddedDescription" }),
      })
    }
  }

  const removeValidationRule = (index: number) => {
    const updatedRules = validationRules.filter((_, i) => i !== index)
    setValidationRules(updatedRules)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intl.formatMessage({ id: "app.dataValidation" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Select value={newRule.column} onValueChange={(value) => setNewRule({ ...newRule, column: value })}>
              <SelectTrigger className="w-[180px]">
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
            <Select
              value={newRule.type}
              onValueChange={(value) => setNewRule({ ...newRule, type: value as ValidationRule["type"] })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={intl.formatMessage({ id: "app.selectValidationType" })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="required">{intl.formatMessage({ id: "app.required" })}</SelectItem>
                <SelectItem value="number">{intl.formatMessage({ id: "app.number" })}</SelectItem>
                <SelectItem value="date">{intl.formatMessage({ id: "app.date" })}</SelectItem>
                <SelectItem value="email">{intl.formatMessage({ id: "app.email" })}</SelectItem>
                <SelectItem value="custom">{intl.formatMessage({ id: "app.custom" })}</SelectItem>
                <SelectItem value="length">{intl.formatMessage({ id: "app.length" })}</SelectItem>
                <SelectItem value="regex">{intl.formatMessage({ id: "app.regex" })}</SelectItem>
                <SelectItem value="enum">{intl.formatMessage({ id: "app.enum" })}</SelectItem>
              </SelectContent>
            </Select>
            {newRule.type === "number" && (
              <>
                <Input
                  type="number"
                  placeholder={intl.formatMessage({ id: "app.validationMin" })}
                  value={newRule.min || ""}
                  onChange={(e) => setNewRule({ ...newRule, min: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder={intl.formatMessage({ id: "app.validationMax" })}
                  value={newRule.max || ""}
                  onChange={(e) => setNewRule({ ...newRule, max: Number(e.target.value) })}
                />
              </>
            )}
            {newRule.type === "custom" && (
              <Input
                type="text"
                placeholder={intl.formatMessage({ id: "app.customRegex" })}
                value={newRule.customRegex || ""}
                onChange={(e) => setNewRule({ ...newRule, customRegex: e.target.value })}
              />
            )}
            {newRule.type === "length" && (
              <>
                <Input
                  type="number"
                  placeholder={intl.formatMessage({ id: "app.minLength" })}
                  value={newRule.min || ""}
                  onChange={(e) => setNewRule({ ...newRule, min: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder={intl.formatMessage({ id: "app.maxLength" })}
                  value={newRule.max || ""}
                  onChange={(e) => setNewRule({ ...newRule, max: Number(e.target.value) })}
                />
              </>
            )}
            {newRule.type === "regex" && (
              <Input
                type="text"
                placeholder={intl.formatMessage({ id: "app.regex" })}
                value={newRule.customRegex || ""}
                onChange={(e) => setNewRule({ ...newRule, customRegex: e.target.value })}
              />
            )}
            {newRule.type === "enum" && (
              <Input
                type="text"
                placeholder={intl.formatMessage({ id: "app.enumValues" })}
                value={newRule.options?.join(", ") || ""}
                onChange={(e) => setNewRule({ ...newRule, options: e.target.value.split(",").map((s) => s.trim()) })}
              />
            )}
            <Button onClick={addValidationRule}>{intl.formatMessage({ id: "app.addRule" })}</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{intl.formatMessage({ id: "app.column" })}</TableHead>
                <TableHead>{intl.formatMessage({ id: "app.validationType" })}</TableHead>
                <TableHead>{intl.formatMessage({ id: "app.parameters" })}</TableHead>
                <TableHead>{intl.formatMessage({ id: "app.actions" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationRules.map((rule, index) => (
                <TableRow key={index}>
                  <TableCell>{rule.column}</TableCell>
                  <TableCell>{rule.type}</TableCell>
                  <TableCell>
                    {rule.type === "number" && `Min: ${rule.min}, Max: ${rule.max}`}
                    {rule.type === "custom" && rule.customRegex}
                    {rule.type === "length" && `Min: ${rule.min}, Max: ${rule.max}`}
                    {rule.type === "regex" && rule.customRegex}
                    {rule.type === "enum" && rule.options?.join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" onClick={() => removeValidationRule(index)}>
                      {intl.formatMessage({ id: "app.remove" })}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

