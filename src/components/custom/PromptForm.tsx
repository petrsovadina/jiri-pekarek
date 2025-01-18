import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PromptFormProps {
    initialName?: string;
    initialContent?: string;
    promptId?: string;
}

const PromptForm = ({ initialName, initialContent, promptId }: PromptFormProps) => {
    const [name, setName] = useState(initialName || "");
    const [content, setContent] = useState(initialContent || "");
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (initialName) setName(initialName);
        if (initialContent) setContent(initialContent);
    }, [initialName, initialContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Pro uložení promptu musíte být přihlášeni");
            }

            const updates = {
                name: name,
                content: content,
                description: "Automaticky vytvořený prompt",
                user_id: user.id
            };

            let error;
            if (promptId) {
                const { error: updateError } = await supabase
                    .from("prompts")
                    .update(updates)
                    .eq('id', promptId)
                    .eq('user_id', user.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("prompts")
                    .insert(updates);
                error = insertError;
            }

            if (error) {
                toast({
                    title: "Chyba při ukládání promptu",
                    description: error.message,
                    variant: "destructive"
                });
                return;
            }

            toast({
                title: "Prompt uložen",
                description: "Prompt byl úspěšně uložen pro pozdější použití"
            });
            navigate("/prompts");
        } catch (err) {
            toast({
                title: "Chyba při ukládání promptu",
                description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
                variant: "destructive"
            });
        }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Název promptu</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zadejte název promptu"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Obsah promptu</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Zadejte obsah promptu"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Uložit</Button>
      </div>
    </form>
  );
};

export default PromptForm;
