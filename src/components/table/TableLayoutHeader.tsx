import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";

interface TableLayoutHeaderProps {
  fileName?: string;
  onExport: () => void;
  onSave: () => void;
}

export const TableLayoutHeader = ({ fileName, onExport, onSave }: TableLayoutHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{fileName || "Nová tabulka"}</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportovat
        </Button>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Uložit
        </Button>
      </div>
    </div>
  );
};