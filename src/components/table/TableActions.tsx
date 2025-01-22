import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TableActionsProps {
  onAddColumn: () => void;
}

export const TableActions = ({ onAddColumn }: TableActionsProps) => {
  return (
    <TableHead className="w-[100px]">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-primary/20"
        onClick={onAddColumn}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </TableHead>
  );
};