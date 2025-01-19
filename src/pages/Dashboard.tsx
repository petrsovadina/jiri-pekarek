import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileSpreadsheet } from "lucide-react";

interface File {
  id: string;
  name: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moje tabulky</h1>
          <FileUpload />
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
