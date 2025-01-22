import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreatePromptDialog } from "../table/CreatePromptDialog";
import { useState } from "react";

interface PromptSettingsProps {
  selectedColumn: string | null;
  prompts: Array<{ id: string; name: string; content: string }>;
  onPromptSelect: (promptId: string) => void;
  onPromptCreate: (name: string, content: string) => void;
}

export const PromptSettings = ({
  selectedColumn,
  prompts,
  onPromptSelect,
  onPromptCreate,
}: PromptSettingsProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [isCreatePromptDialogOpen, setIsCreatePromptDialogOpen] = useState(false);

  const handlePromptSelect = (value: string) => {
    setSelectedPrompt(value);
    onPromptSelect(value);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Nastavení promptu</h3>
      
      {selectedColumn ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">
              Vybraný sloupec: <span className="font-medium text-foreground">{selectedColumn}</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-muted-foreground">Vyberte prompt</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatePromptDialogOpen(true)}
                className="hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nový prompt
              </Button>
            </div>
            <Select value={selectedPrompt} onValueChange={handlePromptSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Vyberte sloupec pro nastavení promptu
        </p>
      )}

      <CreatePromptDialog
        open={isCreatePromptDialogOpen}
        onClose={() => setIsCreatePromptDialogOpen(false)}
        onSave={onPromptCreate}
      />
    </Card>
  );
};