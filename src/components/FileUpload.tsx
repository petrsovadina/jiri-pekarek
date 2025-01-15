import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading = false }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

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
      if (file && (file.type === "text/csv" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
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
            Podporované formáty: CSV, XLSX
          </p>
        </div>
        <label className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".csv,.xlsx"
            disabled={isLoading}
          />
          <Button disabled={isLoading}>
            {isLoading ? "Nahrávání..." : "Vybrat soubor"}
          </Button>
        </label>
      </div>
    </Card>
  );
};