import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";

interface DashboardHeaderProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export const DashboardHeader = ({ onFileUpload, isUploading }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Moje tabulky</h1>
      <FileUpload 
        onFileUpload={onFileUpload}
        isLoading={isUploading}
        acceptedFileTypes={['.csv']}
        maxSizeInMB={10}
      />
    </div>
  );
};