import { TableLayout } from "@/components/table/TableLayout";
import { TableContainer } from "@/components/table/TableContainer";
import { LoadingState } from "@/components/table/LoadingState";
import { ErrorState } from "@/components/table/ErrorState";
import { useFileManagement } from "@/hooks/useFileManagement";
import { usePromptManagement } from "@/hooks/usePromptManagement";
import { useGenerationManagement } from "@/hooks/useGenerationManagement";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

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

    toast({
      title: "Export",
      description: "Funkce exportu bude brzy implementována",
    });
  };

  const handleSave = () => {
    toast({
      title: "Ukládání",
      description: "Změny byly úspěšně uloženy",
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <TableLayout
      fileName={activeFile?.name || ""}
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
      <TableContainer
        activeFile={activeFile}
        selectedColumn={selectedColumn}
        onHeaderEdit={handleHeaderEdit}
        onHeaderDelete={handleHeaderDelete}
        onHeaderAdd={handleHeaderAdd}
        onHeaderPromptSelect={setSelectedColumn}
        onCellChange={handleCellChange}
        onSave={handleSave}
      />
    </TableLayout>
  );
};

export default Index;