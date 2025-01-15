import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  acceptedFileTypes?: string[];
  maxSizeInMB?: number;
}

export const FileUpload = ({ 
  onFileUpload, 
  isLoading = false,
  acceptedFileTypes = [".csv", ".xlsx"],
  maxSizeInMB = 10
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  
  const validateFile = useCallback((file: File): boolean => {
    // Kontrola typu souboru
    const fileType = file.name.toLowerCase().split('.').pop();
    const isValidType = acceptedFileTypes.some(type => 
      type.toLowerCase().includes(fileType || '')
    );
    
    if (!isValidType) {
      toast({
        title: "Nepodporovaný formát",
        description: `Podporované formáty jsou: ${acceptedFileTypes.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    // Kontrola velikosti souboru
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "Soubor je příliš velký",
        description: `Maximální velikost souboru je ${maxSizeInMB}MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [acceptedFileTypes, maxSizeInMB, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && validateFile(file)) {
        onFileUpload(file);
      }
    },
    [onFileUpload, validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileUpload(file);
      }
    },
    [onFileUpload, validateFile]
  );

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center ${
        dragActive ? "border-primary" : "border-muted-foreground/25"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Upload className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Nahrajte soubor</h3>
          <p className="text-sm text-muted-foreground">
            Přetáhněte sem soubor nebo klikněte pro výběr
          </p>
          <p className="text-xs text-muted-foreground">
            Podporované formáty: {acceptedFileTypes.join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximální velikost: {maxSizeInMB}MB
          </p>
        </div>
        <label className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept={acceptedFileTypes.join(',')}
            disabled={isLoading}
          />
          <Button disabled={isLoading} variant="secondary">
            {isLoading ? "Nahrávání..." : "Vybrat soubor"}
          </Button>
        </label>
      </div>
    </Card>
  );
};