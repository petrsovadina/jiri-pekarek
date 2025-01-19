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
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">{fileName || "Nepojmenovaná tabulka"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onExport} className="hover:bg-gray-100">
          <Download className="mr-2 h-4 w-4" />
          Exportovat
        </Button>
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Uložit změny
        </Button>
      </div>
    </div>
  );
};