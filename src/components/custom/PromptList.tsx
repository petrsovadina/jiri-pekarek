import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PromptData {
  id: string;
  name: string;
  lastModified: string;
  content: string;
}

const PromptList = () => {
    const [prompts, setPrompts] = useState<PromptData[]>([]);

    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    throw new Error("Pro načtení promptů musíte být přihlášeni");
                }

                const { data: promptsData, error: promptsError } = await supabase
                    .from('prompts')
                    .select('*')
                    .eq('user_id', user.id);

                if (promptsError) {
                    console.error('Error getting prompts:', promptsError);
                    return;
                }

                if (promptsData) {
                    const formattedPrompts = promptsData.map(prompt => ({
                        id: prompt.id,
                        name: prompt.name,
                        lastModified: prompt.updated_at || prompt.created_at,
                        content: prompt.content
                    }));
                    setPrompts(formattedPrompts);
                }
            } catch (error) {
                console.error('Error fetching prompts:', error);
            }
        };

        fetchPrompts();
    }, []);

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
            <p className="text-gray-500 text-sm">Poslední úprava: {prompt.lastModified}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/prompts/${prompt.id}/edit`}>
              <Button size="sm">Editovat</Button>
            </Link>
            <Button size="sm" variant="destructive">Smazat</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromptList;
