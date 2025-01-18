import { useState, useEffect } from 'react';
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
import PromptManagementPanel from '@/components/custom/PromptManagementPanel';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTableData, updateTableData } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface TableData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

const TableEditorPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableData>({
    headers: [],
    rows: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const loadTableData = async () => {
      try {
        setError(null);
        const fileData = await fetchTableData(tableId!);

        if (!fileData) {
          throw new Error('Tabulka nebyla nalezena');
        }

        setTableData({
          headers: fileData.columns || [],
          rows: fileData.data || []
        });
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
        const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se načíst data tabulky';
        setError(errorMessage);
        toast({
          title: 'Chyba při načítání',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (tableId) {
      loadTableData();
    }
  }, [tableId, toast, navigate]);

  const handleCellChange = async (rowIndex: number, cellIndex: number, event: React.ChangeEvent<HTMLTableCellElement>) => {
    try {
      const newTableData = { ...tableData };
      newTableData.rows[rowIndex][cellIndex] = event.target.innerText;

      await updateTableData(tableId!, newTableData.rows);
      setTableData(newTableData);
      
      toast({
        title: 'Změny uloženy',
        description: 'Změny byly úspěšně uloženy'
      });
    } catch (error) {
      console.error('Chyba při ukládání změn:', error);
      toast({
        title: 'Chyba při ukládání',
        description: 'Nepodařilo se uložit změny v tabulce',
        variant: 'destructive'
      });
    }
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

        await updateTableData(tableId!, newTableData.rows);
        setTableData(newTableData);
        
        toast({
          title: "Generování dokončeno",
          description: "Data byla úspěšně vygenerována",
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Progress value={100} className="w-[60%]" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')}>
          Zpět na dashboard
        </Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={() => handleExportTable('csv')}>Export CSV</Button>
            <Button onClick={() => handleExportTable('excel')}>Export Excel</Button>
          </div>
          <Button onClick={handleGenerateData} disabled={generating}>
            {generating ? 'Generuji...' : 'Generovat data'}
          </Button>
        </div>

        {generating && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Generování: {Math.round(progress)}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-[2fr,1fr] gap-4">
          <div className="overflow-auto bg-white shadow rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableData.headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
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
          </div>
          <div className="bg-white shadow rounded-lg">
            <PromptManagementPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TableEditorPage;
