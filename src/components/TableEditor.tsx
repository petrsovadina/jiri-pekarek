import { useState } from "react";
import { PromptManagementPanel } from "@/components/PromptManagementPanel";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Plus, ArrowLeft, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Prompt {
  id: string;
  name: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ColumnType {
  name: string;
  type: "text" | "number" | "date";
}

const TableEditor = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableData>({
    headers: ["Sloupec 1", "Sloupec 2", "Sloupec 3"],
    rows: [
      ["Data 1-1", "Data 1-2", "Data 1-3"],
      ["Data 2-1", "Data 2-2", "Data 2-3"],
      ["Data 3-1", "Data 3-2", "Data 3-3"],
    ],
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [newColumn, setNewColumn] = useState<ColumnType>({ name: "", type: "text" });
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  const handleCellChange = (rowIndex: number, cellIndex: number, event: React.ChangeEvent<HTMLTableCellElement>) => {
    const newTableData = { ...tableData };
    newTableData.rows[rowIndex][cellIndex] = event.target.innerText;
    setTableData(newTableData);
  };

  const handleAddColumn = () => {
    const newTableData = { ...tableData };
    newTableData.headers.push(newColumn.name);
    newTableData.rows.forEach((row) => row.push(""));
    setTableData(newTableData);
    setNewColumn({ name: "", type: "text" });
  };

  const handleRenameHeader = (index: number) => {
    const newName = prompt("Zadejte nový název sloupce");
    if (newName) {
      const newTableData = { ...tableData };
      newTableData.headers[index] = newName;
      setTableData(newTableData);
    }
  };

  const handleDeleteHeader = (index: number) => {
    const newTableData = { ...tableData };
    newTableData.headers.splice(index, 1);
    newTableData.rows.forEach((row) => row.splice(index, 1));
    setTableData(newTableData);
  };

  const handleSetPrompt = (index: number) => {
    setSelectedColumn(index);
  };

  const handleGenerateData = async () => {
    if (selectedColumn === null) {
      toast({
        title: "Chyba při generování",
        description: "Vyberte sloupec pro generování dat",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setProgress(0);
    try {
      const response = await axios.post("/api/generate-data", {
        table: tableData.rows,
        prompt: selectedPrompt?.content,
        targetColumn: selectedColumn,
      });

      if (response.status === 200) {
        const generatedData = response.data.generatedData;
        const newTableData = { ...tableData };
        newTableData.rows = newTableData.rows.map((row, index) => {
          if (generatedData[index]) {
            row[selectedColumn] = generatedData[index];
          }
          setProgress(((index + 1) / newTableData.rows.length) * 100);
          return row;
        });
        setTableData(newTableData);
        toast({
          title: "Generování dokončeno",
          description: "Data byla úspěšně vygenerována",
        });
      } else {
        toast({
          title: "Chyba při generování",
          description: "Nepodařilo se vygenerovat data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating data:", error);
      toast({
        title: "Chyba při generování",
        description: "Nepodařilo se vygenerovat data",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setProgress(100);
    }
  };

  const handleExportTable = async (format: string) => {
    try {
      const response = await axios.post("/api/export-table", {
        table: tableData.rows,
        format: format,
      }, {
        responseType: "blob",
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `table.${format === "excel" ? "xlsx" : "csv"}`);
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Export dokončen",
          description: "Tabulka byla úspěšně exportována",
        });
      } else {
        toast({
          title: "Chyba při exportu",
          description: "Nepodařilo se exportovat tabulku",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error exporting table:", error);
      toast({
        title: "Chyba při exportu",
        description: "Nepodařilo se exportovat tabulku",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Editor tabulky</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleExportTable("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportTable("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Uložit změny
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableData.headers.map((header, index) => (
                        <TableHead key={header}>
                          <div className="flex items-center justify-between">
                            {header}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRenameHeader(index)}>
                                  Přejmenovat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteHeader(index)}>
                                  Smazat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSetPrompt(index)}>
                                  Nastavit prompt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Přidat nový sloupec</DialogTitle>
                              <DialogDescription>
                                Zadejte název a typ nového sloupce
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Název sloupce</Label>
                                <Input
                                  id="name"
                                  value={newColumn.name}
                                  onChange={(e) =>
                                    setNewColumn({ ...newColumn, name: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="type">Typ dat</Label>
                                <Select
                                  value={newColumn.type}
                                  onValueChange={(value: "text" | "number" | "date") =>
                                    setNewColumn({ ...newColumn, type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Číslo</SelectItem>
                                    <SelectItem value="date">Datum</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddColumn}>Přidat sloupec</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleCellChange(rowIndex, cellIndex, e)}
                            className={
                              selectedColumn === cellIndex ? "bg-blue-50" : undefined
                            }
                          >
                            {cell}
                          </TableCell>
                        ))}
                        <TableCell />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="fixed right-4 top-24">
                Prompt Panel
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nastavení promptu</SheetTitle>
              </SheetHeader>
              <PromptManagementPanel
                onPromptSelect={(prompt) => setSelectedPrompt(prompt)}
                selectedPromptId={selectedPrompt?.id}
              />
              <div className="mt-8 space-y-4">
                <div className="grid gap-2">
                  <Label>Vybraný sloupec</Label>
                  <p className="text-sm text-gray-500">
                    {selectedColumn !== null
                      ? tableData.headers[selectedColumn]
                      : "Žádný sloupec není vybrán"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Generování</Label>
                  <Progress value={progress} />
                  <Button
                    onClick={handleGenerateData}
                    disabled={generating || selectedColumn === null || !selectedPrompt}
                    className="w-full"
                  >
                    {generating ? "Generuji..." : "Spustit generování"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>
    </div>
  );
};

export default TableEditor;
