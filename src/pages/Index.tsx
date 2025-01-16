import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "@/components/FileUploader";
import { TablePreview } from "@/components/TablePreview";
import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface FileData {
  id: string;
  name: string;
  data: string[][];
  columns: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkUser();

    const fetchFiles = async () => {
      const { data: files, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching files:", error);
        return;
      }

      if (files && files.length > 0) {
        const file = files[0];
        setActiveFile({
          id: file.id,
          name: file.name,
          data: file.data as string[][] || [],
          columns: file.columns as string[] || []
        });
      }
    };

    fetchFiles();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    if (!activeFile) return;
    toast({
      title: "Editace hlavičky",
      description: `Změna z "${oldHeader}" na "${newHeader}"`,
    });
  };

  const handleHeaderDelete = (header: string) => {
    if (!activeFile) return;
    toast({
      title: "Smazání hlavičky",
      description: `Smazána hlavička "${header}"`,
    });
  };

  const handleHeaderAdd = (header: string) => {
    if (!activeFile) return;
    toast({
      title: "Přidání hlavičky",
      description: `Přidána hlavička "${header}"`,
    });
  };

  const handlePromptSave = async (prompt: string) => {
    if (!activeFile) return;
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Pro uložení promptu musíte být přihlášeni");
      }

      const { error } = await supabase
        .from("prompts")
        .insert({
          name: "Nový prompt",
          content: prompt,
          description: "Automaticky vytvořený prompt",
          user_id: user.id
        });

      if (error) {
        toast({
          title: "Chyba při ukládání promptu",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Prompt uložen",
        description: "Prompt byl úspěšně uložen pro pozdější použití"
      });
    } catch (err) {
      toast({
        title: "Chyba při ukládání promptu",
        description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">DataCraft AI</h1>
            <div className="flex items-center gap-4">
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Nahrát nový soubor
              </h2>
              <FileUploader />
            </div>
          </section>

          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Náhled dat
              </h2>
              {activeFile ? (
                <TablePreview 
                  headers={activeFile.columns}
                  data={activeFile.data}
                  onHeaderEdit={handleHeaderEdit}
                  onHeaderDelete={handleHeaderDelete}
                  onHeaderAdd={handleHeaderAdd}
                />
              ) : (
                <p className="text-gray-500">
                  Nahrajte soubor pro zobrazení dat
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generování pomocí AI
              </h2>
              {activeFile ? (
                <PromptEditor onSave={handlePromptSave} />
              ) : (
                <p className="text-gray-500">
                  Nahrajte soubor pro použití AI generování
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;