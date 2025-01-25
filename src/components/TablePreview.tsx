import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, MessageSquare } from "lucide-react";
import { useState } from "react";
import { TableCell as EditableTableCell } from "./table/TableCell";
import { AddColumnDialog } from "./table/AddColumnDialog";

interface TablePreviewProps {
  headers: string[];
  data: string[][];
  onHeaderEdit: (oldHeader: string, newHeader: string) => void;
  onHeaderDelete: (header: string) => void;
  onHeaderAdd: (header: string, type: string) => void;
  onHeaderPromptSelect: (header: string) => void;
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
  selectedColumn: string | null;
}

export const TablePreview = ({
  headers,
  data,
  onHeaderEdit,
  onHeaderDelete,
  onHeaderAdd,
  onHeaderPromptSelect,
  onCellChange,
  selectedColumn,
}: TablePreviewProps) => {
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

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
    <div className="rounded-md border animate-fade-in">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader>
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
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/20"
                  onClick={() => setIsAddColumnDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {row.map((cell, colIndex) => (
                  <EditableTableCell
                    key={`${rowIndex}-${colIndex}`}
                    value={cell}
                    onChange={(value) => onCellChange(rowIndex, colIndex, value)}
                  />
                ))}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <AddColumnDialog
        open={isAddColumnDialogOpen}
        onClose={() => setIsAddColumnDialogOpen(false)}
        onAdd={onHeaderAdd}
      />
    </div>
  );
};