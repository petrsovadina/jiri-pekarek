import { TablePreview } from "@/components/TablePreview";
import { TableLayout } from "@/components/table/TableLayout";
import { useFileManagement } from "@/hooks/useFileManagement";
import { usePromptManagement } from "@/hooks/usePromptManagement";
import { useGenerationManagement } from "@/hooks/useGenerationManagement";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { fileId } = useParams();
  const { toast } = useToast();
  
  const { 
    activeFile,
    isLoading,
    error,
    handleHeaderEdit,
    handleHeaderDelete,
    handleHeaderAdd,
    handleCellChange
  } = useFileManagement(fileId);

  const {
    prompts,
    handlePromptCreate
  } = usePromptManagement();

  const {
    isGenerating,
    progress,
    selectedColumn,
    setSelectedColumn,
    handleGenerateStart,
    handleGenerateStop
  } = useGenerationManagement();

  const handleExport = () => {
    if (!activeFile?.data) {
      toast({
        variant: "destructive",
        title: "Chyba při exportu",
        description: "Nejsou k dispozici žádná data pro export",
      });
      return;
    }

    // TODO: Implementovat export dat
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Načítání dat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-500">
            Zkontrolujte, zda máte přístup k tomuto souboru a zkuste to znovu
          </p>
        </div>
      </div>
    );
  }

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
      onPromptCreate={handlePromptCreate}
      onGenerateStart={handleGenerateStart}
      onGenerateStop={handleGenerateStop}
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
          onCellChange={handleCellChange}
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