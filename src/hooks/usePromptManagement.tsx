import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const usePromptManagement = () => {
  const [prompts, setPrompts] = useState<Array<{ id: string; name: string; content: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrompts = async () => {
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select("*");

      if (promptsError) {
        console.error("Error fetching prompts:", promptsError);
        return;
      }

      setPrompts(promptsData || []);
    };

    fetchPrompts();
  }, []);

  const handlePromptCreate = async (name: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("prompts")
        .insert([
          { name, content, user_id: user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setPrompts(prev => [...prev, data]);

      toast({
        title: "Prompt vytvořen",
        description: `Nový prompt "${name}" byl úspěšně vytvořen`,
      });
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast({
        title: "Chyba při vytváření",
        description: "Nepodařilo se vytvořit nový prompt",
        variant: "destructive"
      });
    }
  };

  return {
    prompts,
    handlePromptCreate
  };
};