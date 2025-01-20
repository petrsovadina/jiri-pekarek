import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useFileColumns } from "./useFileColumns";
import { useFileData } from "./useFileData";

interface FileData {
  id: string;
  name: string;
  data: string[][];
  columns: string[];
}

export const useFileManagement = () => {
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
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
    handleHeaderEdit,
    handleHeaderDelete,
    handleHeaderAdd,
    handleCellChange
  };
};