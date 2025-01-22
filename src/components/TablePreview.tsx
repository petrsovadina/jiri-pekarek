import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { TableHeader } from "./table/TableHeader";
import { TableBody } from "./table/TableBody";
import { TableActions } from "./table/TableActions";
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
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  return (
    <div className="rounded-md border animate-fade-in">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader
            headers={headers}
            selectedColumn={selectedColumn}
            onHeaderEdit={onHeaderEdit}
            onHeaderDelete={onHeaderDelete}
            onHeaderPromptSelect={onHeaderPromptSelect}
          />
          <TableBody data={data} onCellChange={onCellChange} />
          <TableActions onAddColumn={() => setIsAddColumnDialogOpen(true)} />
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