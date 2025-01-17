import { useRouter } from 'next/router';
import PromptForm from '@/components/PromptForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const EditPrompt = () => {
  const router = useRouter();
  const promptId = router.query.promptId as string;
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) return;
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("Pro načtení promptu musíte být přihlášeni");
        }

        const { data: promptData, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', promptId)
          .eq('user_id', user.id)
          .single();

        if (promptError) {
          console.error('Error getting prompt:', promptError);
          return;
        }

        if (promptData) {
          setPrompt(promptData);
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
      }
    };

    fetchPrompt();
  }, [promptId]);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Editovat prompt: {prompt.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Formulář pro editaci promptu
              </h2>
              <PromptForm initialName={prompt.name} initialContent={prompt.content} promptId={prompt.id} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EditPrompt;
