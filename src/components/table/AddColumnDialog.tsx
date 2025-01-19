import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, type: string) => void;
}

export const AddColumnDialog = ({ open, onClose, onAdd }: AddColumnDialogProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("text");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), type);
      setName("");
      setType("text");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat nový sloupec</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Název sloupce</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zadejte název sloupce"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Typ dat</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte typ dat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Číslo</SelectItem>
                <SelectItem value="date">Datum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit">Přidat sloupec</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};