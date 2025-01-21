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
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          navigate("/auth");
          return;
        }

        console.log("Authenticated user ID:", session.user.id);
        await fetchFiles();
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          variant: "destructive",
          title: "Chyba přihlášení",
          description: "Prosím, přihlaste se znovu",
        });
        navigate("/auth");
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in:", session.user.id);
        await fetchFiles();
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const fetchFiles = async () => {
    try {
      console.log("Fetching files...");
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("User error:", userError);
        throw userError;
      }

      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Uživatel není přihlášen");
      }

      const { data, error } = await supabase
        .from("files")
        .select("id, name, created_at")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Files fetch error:", error);
        throw error;
      }

      console.log("Fetched files:", data);
      setFiles(data || []);
    } catch (error) {
      console.error("Error in fetchFiles:", error);
      toast({
        variant: "destructive",
        title: "Chyba při načítání",
        description: "Nepodařilo se načíst seznam souborů",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = (fileId: string) => {
    navigate(`/table/${fileId}`);
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Pro nahrání souboru musíte být přihlášeni");
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error("Nepodařilo se načíst obsah souboru");
          }

          let parsedData;
          let columns;
          
          if (uploadedFile.name.endsWith('.csv')) {
            const text = data as string;
            const rows = text.split('\n')
              .map(row => row.trim())
              .filter(row => row.length > 0)
              .map(row => row.split(',').map(cell => cell.trim()));
            
            columns = rows[0];
            parsedData = rows.slice(1).filter(row => row.some(cell => cell !== ''));

            const { error: fileError } = await supabase
              .from('files')
              .insert({
                name: uploadedFile.name,
                original_name: uploadedFile.name,
                mime_type: uploadedFile.type,
                size: uploadedFile.size,
                columns: columns,
                data: parsedData,
                status: 'pending',
                user_id: user.id,
                is_active: true
              });

            if (fileError) throw fileError;

            toast({
              title: "Soubor byl úspěšně nahrán",
              description: "Data byla zpracována a uložena",
            });

            await fetchFiles();
          } else {
            toast({
              variant: "destructive",
              title: "Nepodporovaný formát",
              description: "Prosím nahrajte soubor ve formátu CSV",
            });
          }
        } catch (err) {
          console.error("Error processing file:", err);
          toast({
            variant: "destructive",
            title: "Chyba při zpracování",
            description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Chyba při čtení souboru",
          description: "Nepodařilo se přečíst obsah souboru",
        });
        setIsUploading(false);
      };

      reader.readAsText(uploadedFile);
    } catch (err) {
      console.error("Error in handleFileUpload:", err);
      toast({
        variant: "destructive",
        title: "Chyba při nahrávání",
        description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
      });
      setIsUploading(false);
    }
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