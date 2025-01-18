import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, MessageSquare } from "lucide-react";
import { useState } from "react";

interface TablePreviewProps {
  headers: string[];
  data: string[][];
  onHeaderEdit: (oldHeader: string, newHeader: string) => void;
  onHeaderDelete: (header: string) => void;
  onHeaderAdd: (header: string) => void;
  onHeaderPromptSelect: (header: string) => void;
  selectedColumn: string | null;
}

export const TablePreview = ({
  headers,
  data,
  onHeaderEdit,
  onHeaderDelete,
  onHeaderAdd,
  onHeaderPromptSelect,
  selectedColumn,
}: TablePreviewProps) => {
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [isAddingHeader, setIsAddingHeader] = useState(false);
  const [newHeader, setNewHeader] = useState("");

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

  const handleHeaderAdd = () => {
    if (newHeader.trim()) {
      onHeaderAdd(newHeader.trim());
      setNewHeader("");
      setIsAddingHeader(false);
    }
  };

  return (
    <div className="rounded-md border animate-fade-in">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead 
                  key={header} 
                  className={`min-w-[150px] ${selectedColumn === header ? 'bg-primary/10' : ''}`}
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
                        <span>{header}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleHeaderEdit(header)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onHeaderPromptSelect(header)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
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
                {isAddingHeader ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newHeader}
                      onChange={(e) => setNewHeader(e.target.value)}
                      onBlur={() => setIsAddingHeader(false)}
                      onKeyDown={(e) => e.key === "Enter" && handleHeaderAdd()}
                      className="h-8"
                      placeholder="Nový sloupec"
                      autoFocus
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsAddingHeader(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={`${i}-${j}`}>{cell}</TableCell>
                ))}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};