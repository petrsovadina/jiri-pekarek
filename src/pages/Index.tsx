import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { TablePreview } from "@/components/TablePreview";
import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      setSelectedFile(file);
      
      // Read file content
      const text = await file.text();
      const rows = text.split('\n');
      
      // Parse CSV (simple implementation - can be enhanced for more robust parsing)
      const parsedHeaders = rows[0].split(',').map(h => h.trim());
      const parsedData = rows.slice(1)
        .filter(row => row.trim()) // Remove empty rows
        .map(row => row.split(',').map(cell => cell.trim()));

      setHeaders(parsedHeaders);
      setData(parsedData);

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('files')
        .insert({
          name: file.name,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          columns: parsedHeaders,
          data: parsedData,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Soubor byl úspěšně nahrán",
        description: "Vaše data jsou připravena ke zpracování",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Chyba při nahrávání souboru",
        description: error instanceof Error ? error.message : "Nastala neočekávaná chyba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    setHeaders(headers.map(h => h === oldHeader ? newHeader : h));
  };

  const handleHeaderDelete = (header: string) => {
    const headerIndex = headers.indexOf(header);
    setHeaders(headers.filter(h => h !== header));
    setData(data.map(row => row.filter((_, i) => i !== headerIndex)));
  };

  const handleHeaderAdd = (header: string) => {
    setHeaders([...headers, header]);
    setData(data.map(row => [...row, ""]));
  };

  const handlePromptSave = async (prompt: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('prompts')
        .insert({
          name: 'New Prompt',
          content: prompt,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Prompt byl uložen",
        description: "Váš prompt byl úspěšně uložen",
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Chyba při ukládání promptu",
        description: error instanceof Error ? error.message : "Nastala neočekávaná chyba",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Zpracování tabulkových dat</h1>
          <p className="text-muted-foreground">
            Nahrajte tabulku, upravte strukturu a generujte data pomocí AI
          </p>
        </div>

        {!selectedFile ? (
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        ) : (
          <div className="space-y-8 animate-slide-up">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Náhled tabulky</h2>
                    <p className="text-sm text-muted-foreground">
                      Zobrazuji prvních 10 řádků vašich dat
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
                    Nahrát nový soubor
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