import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreatePromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, content: string) => void;
}

export const CreatePromptDialog = ({ open, onClose, onSave }: CreatePromptDialogProps) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Název promptu</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zadejte název promptu"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Text promptu</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Použijte {"{columnName}"} pro reference na hodnoty z jiných sloupců.
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Zadejte text promptu..."
              className="min-h-[150px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit">Uložit prompt</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};