import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { TablePreview } from "@/components/TablePreview";
import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    // For demo purposes, we'll just show a success message
    // In a real app, we would parse the file here
    toast({
      title: "File uploaded successfully",
      description: "Your file is ready for processing",
    });
    
    // Demo data
    setHeaders(["Name", "Email", "Company", "Position"]);
    setData([
      ["John Doe", "john@example.com", "Acme Inc", "Developer"],
      ["Jane Smith", "jane@example.com", "Tech Corp", "Designer"],
      ["Bob Johnson", "bob@example.com", "Big Co", "Manager"],
    ]);
  };

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    setHeaders(headers.map(h => h === oldHeader ? newHeader : h));
  };

  const handleHeaderDelete = (header: string) => {
    setHeaders(headers.filter(h => h !== header));
    setData(data.map(row => row.filter((_, i) => headers[i] !== header)));
  };

  const handleHeaderAdd = (header: string) => {
    setHeaders([...headers, header]);
    setData(data.map(row => [...row, ""]));
  };

  const handlePromptSave = (prompt: string) => {
    toast({
      title: "Prompt saved",
      description: "Your prompt has been saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Table Data Processor</h1>
          <p className="text-muted-foreground">
            Upload your table, manage columns, and generate data with AI
          </p>
        </div>

        {!selectedFile ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8 animate-slide-up">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Table Preview</h2>
                    <p className="text-sm text-muted-foreground">
                      Showing first 10 rows of your data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setHeaders([]);
                      setData([]);
                    }}
                  >
                    Upload New File
                  </Button>
                </div>
                <TablePreview
                  headers={headers}
                  data={data}
                  onHeaderEdit={handleHeaderEdit}
                  onHeaderDelete={handleHeaderDelete}
                  onHeaderAdd={handleHeaderAdd}
                />
              </div>
            </Card>

            <PromptEditor onSave={handlePromptSave} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;