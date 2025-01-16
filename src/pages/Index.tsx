import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "@/components/FileUploader";
import { TablePreview } from "@/components/TablePreview";
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();

    // Načtení posledního nahraného souboru
    const fetchLatestFile = async () => {
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Chyba při načítání souboru:', error);
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

    fetchLatestFile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    if (!activeFile) return;
    // TODO: Implementovat editaci hlavičky
    toast({
      title: "Editace hlavičky",
      description: `Změna z "${oldHeader}" na "${newHeader}"`,
    });
  };

  const handleHeaderDelete = (header: string) => {
    if (!activeFile) return;
    // TODO: Implementovat smazání hlavičky
    toast({
      title: "Smazání hlavičky",
      description: `Smazána hlavička "${header}"`,
    });
  };

  const handleHeaderAdd = (header: string) => {
    if (!activeFile) return;
    // TODO: Implementovat přidání hlavičky
    toast({
      title: "Přidání hlavičky",
      description: `Přidána hlavička "${header}"`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DataCraft AI</h1>
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Odhlásit se
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          <section>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Nahrát nový soubor
              </h2>
              <FileUploader />
            </div>
          </section>

          <section>
            <div className="bg-white rounded-lg shadow p-6">
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
                  Nahrajte soubor pro zobrazení náhledu dat
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generování pomocí AI
              </h2>
              {activeFile ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Vyberte sloupec a zadejte prompt pro generování nových dat
                  </p>
                  {/* Zde přidáme výběr sloupce a prompt editor v dalším kroku */}
                </div>
              ) : (
                <p className="text-gray-500">
                  Nejdříve nahrajte soubor pro možnost generování
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