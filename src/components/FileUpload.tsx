import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileType } from 'lucide-react';

export const FileUpload = ({ 
  onFileUpload,
  isLoading = false 
}: { 
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const validateFile = (file: File) => {
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return (
    <Card className={`p-8 border-2 border-dashed transition-all duration-200 ${
      isDragging ? 'border-primary bg-primary/5' : 'border-border'
    }`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-4 text-center"
      >
        <div className="rounded-full p-4 bg-primary/10">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload your file</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop your CSV or Excel file here
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {isLoading ? 'Uploading...' : 'Select File'}
          </Button>
          <FileType className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">CSV, XLSX</span>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      </div>
    </Card>
  );
};