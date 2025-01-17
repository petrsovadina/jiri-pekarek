import { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import PromptManagementPanel from '@/components/PromptManagementPanel';
import { useParams } from 'react-router-dom';

interface TableData {
  headers: string[];
  rows: string[][];
}

const TableEditorPage = () => {
  const { tableId } = useParams();
    const [tableData, setTableData] = useState<TableData>({
        headers: ["Sloupec 1", "Sloupec 2", "Sloupec 3"],
        rows: [
            ["Data 1-1", "Data 1-2", "Data 1-3"],
            ["Data 2-1", "Data 2-2", "Data 2-3"],
            ["Data 3-1", "Data 3-2", "Data 3-3"],
        ]
    });
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();

    const handleCellChange = (rowIndex: number, cellIndex: number, event: React.ChangeEvent<HTMLTableCellElement>) => {
        const newTableData = { ...tableData };
        newTableData.rows[rowIndex][cellIndex] = event.target.innerText;
        setTableData(newTableData);
    };

    const handleGenerateData = async () => {
        setGenerating(true);
        setProgress(0);
        try {
            const response = await axios.post("/api/generate-data", {
                table: tableData.rows,
                prompt: "Vygeneruj data pro tento radek"
            });

            if (response.status === 200) {
                const generatedData = response.data.generatedData;
                const newTableData = { ...tableData };
                newTableData.rows = newTableData.rows.map((row, index) => {
                    if (generatedData[index]) {
                        row.push(generatedData[index]);
                    }
                    setProgress((index + 1) / newTableData.rows.length * 100);
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
                format: format
            }, {
                responseType: 'blob'
            });

            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `table.${format === 'excel' ? 'xlsx' : 'csv'}`);
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
            <h1 className="text-2xl font-bold text-gray-900">Editor tabulky: {tableId}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tabulka
              </h2>
              <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {tableData.headers.map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                            ))}
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
                                    >
                                        {cell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between">
                    <p>Stav generování:</p>
                    <Progress value={progress} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleGenerateData} disabled={generating}>
                        {generating ? "Generuji..." : "Spustit generování"}
                    </Button>
                    <Button onClick={() => handleExportTable('csv')}>Export CSV</Button>
                    <Button onClick={() => handleExportTable('excel')}>Export Excel</Button>
                </div>
            </div>
            </div>
          </section>

          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Prompt management
              </h2>
              <PromptManagementPanel />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TableEditorPage;
