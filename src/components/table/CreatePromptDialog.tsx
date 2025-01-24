import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptEditor } from "@/components/PromptEditor";

interface CreatePromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, content: string) => void;
}

export const CreatePromptDialog = ({ open, onClose, onSave }: CreatePromptDialogProps) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (name.trim() && content.trim()) {
      onSave(name.trim(), content.trim());
      setName("");
      setContent("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Vytvořit nový prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Název promptu
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zadejte název promptu..."
            />
          </div>
          <PromptEditor
            onSave={(prompt) => setContent(prompt)}
            initialPrompt={content}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button onClick={handleSave}>
              Uložit prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};