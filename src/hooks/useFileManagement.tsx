import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFileColumns } from "./useFileColumns";
import { useFileData } from "./useFileData";
import { useToast } from "@/components/ui/use-toast";

interface FileData {
  id: string;
  name: string;
  data: string[][];
  columns: string[];
}

export const useFileManagement = (fileId?: string) => {
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching file data for ID:", fileId);

        const query = supabase
          .from("files")
          .select("*");

        // Pokud máme fileId, načteme konkrétní soubor
        if (fileId) {
          query.eq("id", fileId);
        } else {
          // Jinak načteme první aktivní soubor
          query.eq("is_active", true);
        }

        const { data: files, error: filesError } = await query.limit(1);

        if (filesError) {
          console.error("Error fetching files:", filesError);
          setError("Nepodařilo se načíst data souboru");
          return;
        }

        if (files && files.length > 0) {
          const file = files[0];
          console.log("File loaded:", file);
          
          setActiveFile({
            id: file.id,
            name: file.name,
            data: file.data as string[][] || [],
            columns: file.columns as string[] || []
          });

          // Pokud jsme načetli soubor bez fileId, aktualizujeme URL
          if (!fileId) {
            navigate(`/${file.id}`);
          }
        } else {
          console.log("No files found");
          setError("Soubor nebyl nalezen");
          if (fileId) {
            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Nastala neočekávaná chyba");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fileId, navigate]);

  const { columns, handleHeaderEdit, handleHeaderDelete, handleHeaderAdd } = useFileColumns({
    fileId: activeFile?.id || "",
    initialColumns: activeFile?.columns || [],
    onColumnsUpdate: (newColumns) => {
      setActiveFile(prev => prev ? { ...prev, columns: newColumns } : null);
    }
  });

  const { data, handleCellChange } = useFileData({
    fileId: activeFile?.id || "",
    initialData: activeFile?.data || [],
    onDataUpdate: (newData) => {
      setActiveFile(prev => prev ? { ...prev, data: newData } : null);
    }
  });

  return {
    activeFile: activeFile ? {
      ...activeFile,
      data,
      columns
    } : null,
    isLoading,
    error,
    handleHeaderEdit,
    handleHeaderDelete,
    handleHeaderAdd,
    handleCellChange
  };
};