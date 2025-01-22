import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileRecord {
  id: string;
  name: string;
  created_at: string;
}

export const useDashboardFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchFiles = async () => {
    try {
      console.log("Fetching files...");
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("User error:", userError);
        throw userError;
      }

      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Uživatel není přihlášen");
      }

      const { data, error } = await supabase
        .from("files")
        .select("id, name, created_at")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Files fetch error:", error);
        throw error;
      }

      console.log("Fetched files:", data);
      setFiles(data || []);
    } catch (error) {
      console.error("Error in fetchFiles:", error);
      toast({
        variant: "destructive",
        title: "Chyba při načítání",
        description: "Nepodařilo se načíst seznam souborů",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files,
    isLoading,
    fetchFiles
  };
};