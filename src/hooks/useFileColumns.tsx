import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseFileColumnsProps {
  fileId: string;
  initialColumns: string[];
  onColumnsUpdate: (columns: string[]) => void;
}

export const useFileColumns = ({ fileId, initialColumns, onColumnsUpdate }: UseFileColumnsProps) => {
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const { toast } = useToast();

  const handleHeaderEdit = async (oldHeader: string, newHeader: string) => {
    const updatedColumns = columns.map(col => 
      col === oldHeader ? newHeader : col
    );

    try {
      const { error } = await supabase
        .from("files")
        .update({ columns: updatedColumns })
        .eq("id", fileId);

      if (error) throw error;

      setColumns(updatedColumns);
      onColumnsUpdate(updatedColumns);

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
    const columnIndex = columns.indexOf(header);
    if (columnIndex === -1) return;

    const updatedColumns = columns.filter(col => col !== header);

    try {
      const { error } = await supabase
        .from("files")
        .update({ columns: updatedColumns })
        .eq("id", fileId);

      if (error) throw error;

      setColumns(updatedColumns);
      onColumnsUpdate(updatedColumns);

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
    const updatedColumns = [...columns, header];

    try {
      const { error } = await supabase
        .from("files")
        .update({ columns: updatedColumns })
        .eq("id", fileId);

      if (error) throw error;

      setColumns(updatedColumns);
      onColumnsUpdate(updatedColumns);

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

  return {
    columns,
    handleHeaderEdit,
    handleHeaderDelete,
    handleHeaderAdd
  };
};