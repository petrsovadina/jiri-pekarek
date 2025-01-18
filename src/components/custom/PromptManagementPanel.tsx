import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash } from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface PromptManagementPanelProps {
  onPromptSelect?: (prompt: Prompt) => void;
  selectedPromptId?: string;
}

const PromptManagementPanel = ({ onPromptSelect, selectedPromptId }: PromptManagementPanelProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt>>({
    name: "",
    content: "",
    description: "",
  });
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen");

      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPrompts(data || []);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({
        title: "Chyba při načítání promptů",
        description: "Nepodařilo se načíst prompty",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen");

      const { data, error } = await supabase
        .from("prompts")
        .insert([
          {
            name: newPrompt.name,
            content: newPrompt.content,
            description: newPrompt.description,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPrompts([data, ...prompts]);
      setNewPrompt({ name: "", content: "", description: "" });
      toast({
        title: "Prompt vytvořen",
        description: "Nový prompt byl úspěšně vytvořen",
      });
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast({
        title: "Chyba při vytváření promptu",
        description: "Nepodařilo se vytvořit nový prompt",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen");
      if (editingPrompt.user_id !== user.id) throw new Error("Nemáte oprávnění upravit tento prompt");

      const { data, error } = await supabase
        .from("prompts")
        .update({
          name: editingPrompt.name,
          content: editingPrompt.content,
          description: editingPrompt.description,
        })
        .eq("id", editingPrompt.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPrompts(prompts.map((p) => (p.id === data.id ? data : p)));
      setEditingPrompt(null);
      toast({
        title: "Prompt aktualizován",
        description: "Prompt byl úspěšně aktualizován",
      });
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Chyba při aktualizaci promptu",
        description: "Nepodařilo se aktualizovat prompt",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen");

      const prompt = prompts.find((p) => p.id === id);
      if (!prompt) throw new Error("Prompt nebyl nalezen");
      if (prompt.user_id !== user.id) throw new Error("Nemáte oprávnění smazat tento prompt");

      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setPrompts(prompts.filter((p) => p.id !== id));
      toast({
        title: "Prompt smazán",
        description: "Prompt byl úspěšně smazán",
      });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Chyba při mazání promptu",
        description: "Nepodařilo se smazat prompt",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Správa promptů</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Vytvořit nový prompt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vytvořit nový prompt</DialogTitle>
              <DialogDescription>
                Zadejte název a obsah nového promptu. Můžete použít proměnné ve formátu {'{sloupec}'} pro vložení hodnot z jiných sloupců.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Název promptu</Label>
                <Input
                  id="name"
                  placeholder="např. Generování popisu produktu"
                  value={newPrompt.name}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Popis</Label>
                <Input
                  id="description"
                  placeholder="např. Generuje detailní popis produktu na základě názvu a kategorie"
                  value={newPrompt.description}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Obsah promptu</Label>
                <Textarea
                  id="content"
                  placeholder="např. Vytvoř detailní popis produktu s názvem {nazev} v kategorii {kategorie}. Popis by měl obsahovat hlavní vlastnosti a výhody produktu."
                  value={newPrompt.content}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, content: e.target.value })
                  }
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePrompt} disabled={!newPrompt.name || !newPrompt.content}>
                Vytvořit prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {prompts.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vyberte prompt</Label>
            <Select
              value={selectedPromptId}
              onValueChange={(value) => {
                const prompt = prompts.find((p) => p.id === value);
                if (prompt && onPromptSelect) {
                  onPromptSelect(prompt);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1">
                        <p className="font-medium">{prompt.name}</p>
                        {prompt.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {prompt.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPrompt(prompt);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrompt(prompt.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPromptId && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <Label>Náhled promptu</Label>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {prompts.find((p) => p.id === selectedPromptId)?.content}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Zatím nemáte žádné prompty</p>
          <p className="text-sm">Vytvořte nový prompt pro generování dat</p>
        </div>
      )}

      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upravit prompt</DialogTitle>
              <DialogDescription>
                Upravte název a obsah promptu. Můžete použít proměnné ve formátu {'{sloupec}'} pro vložení hodnot z jiných sloupců.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Název promptu</Label>
                <Input
                  id="edit-name"
                  value={editingPrompt.name}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Popis</Label>
                <Input
                  id="edit-description"
                  value={editingPrompt.description}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Obsah promptu</Label>
                <Textarea
                  id="edit-content"
                  value={editingPrompt.content}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      content: e.target.value,
                    })
                  }
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdatePrompt} disabled={!editingPrompt.name || !editingPrompt.content}>
                Uložit změny
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromptManagementPanel;
