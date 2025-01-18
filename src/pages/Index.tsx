import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TablePreview } from "@/components/TablePreview";
import { TableLayout } from "@/components/table/TableLayout";
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
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Array<{ id: string; name: string; content: string }>>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
    };
    checkUser();

    const fetchData = async () => {
      // Fetch active file
      const { data: files, error: filesError } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (filesError) {
        console.error("Error fetching files:", filesError);
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

      // Fetch prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select("*");

      if (promptsError) {
        console.error("Error fetching prompts:", promptsError);
        return;
      }

      setPrompts(promptsData || []);
    };

    fetchData();
  }, [navigate]);

  const handleHeaderEdit = async (oldHeader: string, newHeader: string) => {
    if (!activeFile) return;

    const updatedColumns = activeFile.columns.map(col => 
      col === oldHeader ? newHeader : col
    );

    try {
      const { error } = await supabase
        .from("files")
        .update({ columns: updatedColumns })
        .eq("id", activeFile.id);

      if (error) throw error;

      setActiveFile(prev => prev ? {
        ...prev,
        columns: updatedColumns
      } : null);

      toast({
        title: "Sloupec přejmenován",
        description: `Název sloupce změněn z "${oldHeader}" na "${newHeader}"`,
      });
    } catch (error) {
      console.error("Error updating column:", error);
      toast({
        title: "Chyba při přejmenování",
        description: "Nepodařilo se přejmenovat sloupec",
        variant: "destructive"
      });
    }
  };

  const handleHeaderDelete = async (header: string) => {
    if (!activeFile) return;

    const columnIndex = activeFile.columns.indexOf(header);
    if (columnIndex === -1) return;

    const updatedColumns = activeFile.columns.filter(col => col !== header);
    const updatedData = activeFile.data.map(row => 
      row.filter((_, index) => index !== columnIndex)
    );

    try {
      const { error } = await supabase
        .from("files")
        .update({ 
          columns: updatedColumns,
          data: updatedData
        })
        .eq("id", activeFile.id);

      if (error) throw error;

      setActiveFile(prev => prev ? {
        ...prev,
        columns: updatedColumns,
        data: updatedData
      } : null);

      toast({
        title: "Sloupec smazán",
        description: `Sloupec "${header}" byl úspěšně smazán`,
      });
    } catch (error) {
      console.error("Error deleting column:", error);
      toast({
        title: "Chyba při mazání",
        description: "Nepodařilo se smazat sloupec",
        variant: "destructive"
      });
    }
  };

  const handleHeaderAdd = async (header: string) => {
    if (!activeFile) return;

    const updatedColumns = [...activeFile.columns, header];
    const updatedData = activeFile.data.map(row => [...row, ""]);

    try {
      const { error } = await supabase
        .from("files")
        .update({ 
          columns: updatedColumns,
          data: updatedData
        })
        .eq("id", activeFile.id);

      if (error) throw error;

      setActiveFile(prev => prev ? {
        ...prev,
        columns: updatedColumns,
        data: updatedData
      } : null);

      toast({
        title: "Sloupec přidán",
        description: `Nový sloupec "${header}" byl úspěšně přidán`,
      });
    } catch (error) {
      console.error("Error adding column:", error);
      toast({
        title: "Chyba při přidávání",
        description: "Nepodařilo se přidat nový sloupec",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Funkce exportu bude brzy implementována",
    });
  };

  const handleSave = async () => {
    if (!activeFile) return;

    try {
      const { error } = await supabase
        .from("files")
        .update({ 
          data: activeFile.data,
          columns: activeFile.columns,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeFile.id);

      if (error) throw error;

      toast({
        title: "Změny uloženy",
        description: "Všechny změny byly úspěšně uloženy",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Chyba při ukládání",
        description: "Nepodařilo se uložit změny",
        variant: "destructive"
      });
    }
  };

  return (
    <TableLayout
      fileName={activeFile?.name}
      selectedColumn={selectedColumn}
      prompts={prompts}
      onPromptSelect={(promptId) => {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
          toast({
            title: "Prompt vybrán",
            description: `Vybrán prompt "${prompt.name}"`,
          });
        }
      }}
      onGenerateStart={() => {
        setIsGenerating(true);
        setProgress(0);
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsGenerating(false);
              return 100;
            }
            return prev + 10;
          });
        }, 1000);
      }}
      onGenerateStop={() => {
        setIsGenerating(false);
        setProgress(0);
      }}
      isGenerating={isGenerating}
      progress={progress}
      onExport={handleExport}
      onSave={handleSave}
    >
      {activeFile ? (
        <TablePreview
          headers={activeFile.columns}
          data={activeFile.data}
          onHeaderEdit={handleHeaderEdit}
          onHeaderDelete={handleHeaderDelete}
          onHeaderAdd={handleHeaderAdd}
          onHeaderPromptSelect={setSelectedColumn}
          selectedColumn={selectedColumn}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nahrajte soubor pro zobrazení dat
          </p>
        </div>
      )}
    </TableLayout>
  );
};

export default Index;