import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export const FileUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processFile = async (file: File, userId: string) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let parsedData;
          let columns;
          
          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const rows = text.split('\n').map(row => row.split(','));
            columns = rows[0];
            parsedData = rows.slice(1);
          } else if (file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            columns = jsonData[0];
            parsedData = jsonData.slice(1);
          }

          const { data: fileData, error: fileError } = await supabase
            .from('files')
            .insert({
              name: file.name,
              original_name: file.name,
              mime_type: file.type,
              size: file.size,
              columns: columns,
              data: parsedData,
              status: 'processed',
              user_id: userId
            })
            .select()
            .single();

          if (fileError) throw fileError;

          toast({
            title: "Soubor byl úspěšně nahrán",
            description: "Data byla zpracována a uložena",
          });

          setUploadProgress(100);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Nastala neočekávaná chyba");
          toast({
            variant: "destructive",
            title: "Chyba při zpracování",
            description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
          });
        }
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 100);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nastala neočekávaná chyba");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Pro nahrání souboru musíte být přihlášeni");
      }

      // Validate file type
      if (!file.name.match(/\.(csv|xlsx)$/i)) {
        throw new Error("Prosím nahrajte soubor typu CSV nebo XLSX");
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Soubor je příliš velký. Maximální velikost je 10MB");
      }

      await processFile(file, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nastala neočekávaná chyba");
      toast({
        variant: "destructive",
        title: "Chyba při nahrávání",
        description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Pusťte soubor pro nahrání"
              : "Přetáhněte sem soubor nebo klikněte pro výběr"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Podporované formáty: CSV, XLSX (max. 10MB)
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">Nahrávání: {Math.round(uploadProgress)}%</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};