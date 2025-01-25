import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Play, Square, Plus } from "lucide-react";
import { useState } from "react";
import { CreatePromptDialog } from "./table/CreatePromptDialog";

interface TableSidebarProps {
  selectedColumn: string | null;
  prompts: Array<{ id: string; name: string; content: string }>;
  onPromptSelect: (promptId: string) => void;
  onPromptCreate: (name: string, content: string) => void;
  onGenerateStart: () => void;
  onGenerateStop: () => void;
  isGenerating: boolean;
  progress: number;
}

export const TableSidebar = ({
  selectedColumn,
  prompts,
  onPromptSelect,
  onPromptCreate,
  onGenerateStart,
  onGenerateStop,
  isGenerating,
  progress,
}: TableSidebarProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [isCreatePromptDialogOpen, setIsCreatePromptDialogOpen] = useState(false);

  const handlePromptSelect = (value: string) => {
    setSelectedPrompt(value);
    onPromptSelect(value);
  };

  return (
    <div className="w-80 border-l">
      <div className="p-4 space-y-4">
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
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Generování</h3>
          
          {selectedColumn && selectedPrompt ? (
            <div className="space-y-4">
              {isGenerating ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generování dat...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={onGenerateStop}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Zastavit
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full"
                  onClick={onGenerateStart}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Spustit generování
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nejprve vyberte sloupec a prompt
            </p>
          )}
        </Card>
      </div>

      <CreatePromptDialog
        open={isCreatePromptDialogOpen}
        onClose={() => setIsCreatePromptDialogOpen(false)}
        onSave={onPromptCreate}
      />
    </div>
  );
};