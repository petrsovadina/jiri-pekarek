import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Workbook } from 'exceljs';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // Ponecháme pro auth
import { uploadFile } from '@/lib/api';

export const FileUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const processFile = useCallback(async (file: File, userId: string) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const reader = new FileReader();

      reader.onerror = () => {
        console.error("Chyba při čtení souboru:", reader.error);
        setError(`Chyba při čtení souboru: ${reader.error?.message}`);
        toast({
          variant: "destructive",
          title: "Chyba při čtení souboru",
          description: `Chyba při čtení souboru: ${reader.error?.message}`,
        });
        setIsUploading(false);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 100);
        }
      };

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let parsedData;
          let columns;

          if (file.name.endsWith(".csv")) {
            const text = data as string;
            const rows = text.split("\n").map((row) => row.split(","));
            columns = rows[0];
            parsedData = rows.slice(1);
          } else if (file.name.endsWith(".xlsx")) {
            const workbook = new Workbook();
            const buffer = e.target?.result as ArrayBuffer;
            await workbook.xlsx.load(buffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
              throw new Error("Excel soubor neobsahuje žádný list");
            }

            const jsonData: (string | number | boolean | null)[][] = [];
            worksheet.eachRow((row) => {
              jsonData.push(row.values as (string | number | boolean | null)[]);
            });

            columns = jsonData[0].slice(1);
            parsedData = jsonData.slice(1).map((row) => row.slice(1));
          }

          const fileData = {
            name: file.name,
            original_name: file.name,
            mime_type: file.type,
            size: file.size.toString(),
            columns: columns,
            data: parsedData,
            status: 'pending',
            user_id: userId
          };

          const result = await uploadFile(fileData);
          
          toast({
            title: "Soubor byl úspěšně nahrán",
            description: "Data byla zpracována a uložena",
          });
          
          setUploadProgress(100);
          navigate(`/editor/${result.id}`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Nastala neočekávaná chyba";
          console.error("Chyba při zpracování souboru:", err);
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Chyba při zpracování",
            description: errorMessage,
          });
          setIsUploading(false);
        }
      };

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nastala neočekávaná chyba";
      console.error("Chyba při zpracování souboru:", err);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Chyba při zpracování",
        description: errorMessage,
      });
      setIsUploading(false);
    }
  }, [toast, navigate]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      try {
        // Get current user from Supabase Auth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

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
        const errorMessage = err instanceof Error ? err.message : "Nastala neočekávaná chyba";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Chyba při nahrávání",
          description: errorMessage,
        });
        setIsUploading(false);
      }
    },
    [processFile, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary"
          }`}
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
          <p className="text-sm text-gray-600 mt-2">
            Nahrávání: {Math.round(uploadProgress)}%
          </p>
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
