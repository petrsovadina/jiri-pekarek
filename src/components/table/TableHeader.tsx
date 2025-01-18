import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Save } from "lucide-react";
import { Link } from "react-router-dom";

interface TableHeaderProps {
  fileName?: string;
  onExport: () => void;
  onSave: () => void;
}

export const TableHeader = ({ fileName, onExport, onSave }: TableHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">{fileName || "Untitled Table"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportovat
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Uložit změny
        </Button>
      </div>
    </div>
  );
};