import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { validateFile } from "./FileValidator";

export const FileUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { uploadProgress, processFile } = useFileProcessor({
    onSuccess: (fileId) => {
      navigate(`/${fileId}`);
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Pro nahrání souboru musíte být přihlášeni");
      }

      if (!validateFile({ file })) {
        return;
      }

      await processFile(file, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nastala neočekávaná chyba");
    } finally {
      setIsUploading(false);
    }
  }, [processFile, navigate]);

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