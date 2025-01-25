import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface FileData {
  id: string;
  name: string;
  data: string[][];
  columns: string[];
}

export const useFileManagement = () => {
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    if (!activeFile) return;

    const updatedData = activeFile.data.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === colIndex ? value : cell))
        : row
    );

    try {
      const { error } = await supabase
        .from("files")
        .update({ data: updatedData })
        .eq("id", activeFile.id);

      if (error) throw error;

      setActiveFile(prev => prev ? {
        ...prev,
        data: updatedData
      } : null);

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
    activeFile,
    handleHeaderEdit,
    handleHeaderDelete,
    handleHeaderAdd,
    handleCellChange
  };
};