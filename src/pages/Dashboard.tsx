import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FileGrid } from "@/components/dashboard/FileGrid";

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

  const handleFileUpload = (uploadedFile: File) => {
    setIsUploading(true);
    const processFile = async () => {
      try {
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
            } else {
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

        reader.readAsText(uploadedFile);
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
        <DashboardHeader 
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        <FileGrid 
          files={files}
          onFileClick={handleFileClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;