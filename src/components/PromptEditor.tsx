import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";

interface PromptEditorProps {
  onSave: (prompt: string) => void;
  initialPrompt?: string;
}

export const PromptEditor = ({ onSave, initialPrompt = "" }: PromptEditorProps) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleSave = () => {
    if (prompt.trim()) {
      onSave(prompt.trim());
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Prompt Editor</h3>
        <p className="text-sm text-muted-foreground">
          Write your prompt for AI generation. Use {"{columnName}"} to reference other columns.
        </p>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="min-h-[150px] resize-none"
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Prompt
        </Button>
      </div>
    </Card>
  );
};