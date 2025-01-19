import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TableCell as UITableCell } from "@/components/ui/table";

interface TableCellProps {
  value: string;
  onChange: (value: string) => void;
}

export const TableCell = ({ value, onChange }: TableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  return (
    <UITableCell onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-8"
        />
      ) : (
        value
      )}
    </UITableCell>
  );
};