import { TablePreview } from "@/components/TablePreview";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TableContainerProps {
  activeFile: {
    id: string;
    name: string;
    columns: string[];
    data: string[][];
  } | null;
  selectedColumn: string | null;
  onHeaderEdit: (oldHeader: string, newHeader: string) => void;
  onHeaderDelete: (header: string) => void;
  onHeaderAdd: (header: string) => void;
  onHeaderPromptSelect: (header: string) => void;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
  onSave?: () => void;
  isLoading?: boolean;
}

export const TableContainer = ({
  activeFile,
  selectedColumn,
  onHeaderEdit,
  onHeaderDelete,
  onHeaderAdd,
  onHeaderPromptSelect,
  onCellChange,
  onSave: externalOnSave,
  isLoading
}: TableContainerProps) => {
  const { toast } = useToast();

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

      if (externalOnSave) {
        externalOnSave();
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Chyba při ukládání",
        description: "Nepodařilo se uložit změny",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">
            Tabulka nebyla nalezena nebo nemáte oprávnění k jejímu zobrazení
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{activeFile.name}</h2>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Uložit změny
        </button>
      </div>
      
      <TablePreview
        headers={activeFile.columns}
        data={activeFile.data}
        onHeaderEdit={onHeaderEdit}
        onHeaderDelete={onHeaderDelete}
        onHeaderAdd={onHeaderAdd}
        onHeaderPromptSelect={onHeaderPromptSelect}
        onCellChange={onCellChange}
        selectedColumn={selectedColumn}
      />
    </div>
  );
};