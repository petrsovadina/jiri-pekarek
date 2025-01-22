import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, MessageSquare } from "lucide-react";

interface TableHeaderProps {
  headers: string[];
  selectedColumn: string | null;
  onHeaderEdit: (oldHeader: string, newHeader: string) => void;
  onHeaderDelete: (header: string) => void;
  onHeaderPromptSelect: (header: string) => void;
}

export const TableHeader = ({
  headers,
  selectedColumn,
  onHeaderEdit,
  onHeaderDelete,
  onHeaderPromptSelect,
}: TableHeaderProps) => {
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [newHeaderValue, setNewHeaderValue] = useState("");

  const handleHeaderEdit = (header: string) => {
    setEditingHeader(header);
    setNewHeaderValue(header);
  };

  const saveHeaderEdit = () => {
    if (editingHeader && newHeaderValue.trim()) {
      onHeaderEdit(editingHeader, newHeaderValue.trim());
    }
    setEditingHeader(null);
  };

  return (
    <UITableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead 
            key={header} 
            className={`min-w-[150px] ${selectedColumn === header ? 'bg-primary/10' : ''} transition-colors`}
          >
            <div className="flex items-center gap-2">
              {editingHeader === header ? (
                <Input
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  onBlur={saveHeaderEdit}
                  onKeyDown={(e) => e.key === "Enter" && saveHeaderEdit()}
                  className="h-8"
                  autoFocus
                />
              ) : (
                <>
                  <span className="flex-1">{header}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-primary/20"
                      onClick={() => handleHeaderEdit(header)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-primary/20"
                      onClick={() => onHeaderPromptSelect(header)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/20"
                      onClick={() => onHeaderDelete(header)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </UITableHeader>
  );
};