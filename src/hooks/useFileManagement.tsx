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

        // Pokud fileId není definováno nebo je neplatné, načteme aktivní soubor
        const query = supabase
          .from("files")
          .select("*");

        // Pokud máme fileId a vypadá jako UUID, použijeme ho pro filtrování
        if (fileId && fileId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          query.eq("id", fileId);
        } else {
          query.eq("is_active", true);
        }

        const { data: files, error: filesError } = await query.limit(1).maybeSingle();

        if (filesError) {
          console.error("Error fetching files:", filesError);
          setError("Nepodařilo se načíst data souboru");
          return;
        }

        if (files) {
          console.log("File loaded:", files);
          
          setActiveFile({
            id: files.id,
            name: files.name,
            data: files.data as string[][] || [],
            columns: files.columns as string[] || []
          });

          if (!fileId) {
            navigate(`/${files.id}`);
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