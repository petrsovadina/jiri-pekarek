import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseFileDataProps {
  fileId: string;
  initialData: string[][];
  onDataUpdate: (data: string[][]) => void;
}

export const useFileData = ({ fileId, initialData, onDataUpdate }: UseFileDataProps) => {
  const [data, setData] = useState<string[][]>(initialData);
  const { toast } = useToast();

  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    const updatedData = data.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === colIndex ? value : cell))
        : row
    );

    try {
      const { error } = await supabase
        .from("files")
        .update({ data: updatedData })
        .eq("id", fileId);

      if (error) throw error;

      setData(updatedData);
      onDataUpdate(updatedData);

      toast({
        title: "Buňka upravena",
        description: "Hodnota buňky byla úspěšně změněna",
      });
    } catch (error) {
      console.error("Error updating cell:", error);
      toast({
        title: "Chyba při úpravě",
        description: "Nepodařilo se upravit hodnotu buňky",
        variant: "destructive"
      });
    }
  };

  return {
    data,
    handleCellChange
  };
};