import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileRecord {
  id: string;
  name: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    checkAuth();

    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        return;
      }

      setFiles(data || []);
      setIsLoading(false);
    };

    fetchFiles();
  }, [navigate]);

  const handleFileClick = (fileId: string) => {
    navigate(`/${fileId}`);
  };

  const handleFileUpload = (uploadedFile: globalThis.File) => {
    setIsUploading(true);
    const processFile = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("Pro nahrání souboru musíte být přihlášeni");
        }

        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            let parsedData;
            let columns;
            
            if (uploadedFile.name.endsWith('.csv')) {
              const text = data as string;
              const rows = text.split('\n').map(row => row.split(','));
              columns = rows[0];
              parsedData = rows.slice(1);
            } else if (uploadedFile.name.endsWith('.xlsx')) {
              toast({
                title: "XLSX formát není momentálně podporován",
                description: "Prosím nahrajte soubor ve formátu CSV",
                variant: "destructive"
              });
              return;
            }

            const { data: fileData, error: fileError } = await supabase
              .from('files')
              .insert({
                name: uploadedFile.name,
                original_name: uploadedFile.name,
                mime_type: uploadedFile.type,
                size: uploadedFile.size,
                columns: columns,
                data: parsedData,
                status: 'pending',
                user_id: user.id
              })
              .select()
              .single();

            if (fileError) throw fileError;

            toast({
              title: "Soubor byl úspěšně nahrán",
              description: "Data byla zpracována a uložena",
            });

            // Refresh the files list
            const { data: newFiles } = await supabase
              .from("files")
              .select("id, name, created_at")
              .order("created_at", { ascending: false });
            
            setFiles(newFiles || []);

          } catch (err) {
            toast({
              variant: "destructive",
              title: "Chyba při zpracování",
              description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
            });
          }
        };

        if (uploadedFile.name.endsWith('.csv')) {
          reader.readAsText(uploadedFile);
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Chyba při nahrávání",
          description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
        });
      } finally {
        setIsUploading(false);
      }
    };

    processFile();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moje tabulky</h1>
          <FileUpload 
            onFileUpload={handleFileUpload}
            isLoading={isUploading}
            acceptedFileTypes={['.csv']}
            maxSizeInMB={10}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New File Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex items-center justify-center h-[200px]">
              <Button variant="ghost" className="h-20 w-20">
                <Plus className="h-10 w-10 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Existing Files */}
          {files.map((file) => (
            <Card
              key={file.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleFileClick(file.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  {file.name}
                </CardTitle>
                <CardDescription>
                  Vytvořeno: {new Date(file.created_at).toLocaleDateString("cs-CZ")}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Načítání tabulek...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Zatím nemáte žádné tabulky. Začněte nahráním nové tabulky.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;