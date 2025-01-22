import { TableBody as UITableBody, TableRow } from "@/components/ui/table";
import { TableCell } from "./TableCell";

interface TableBodyProps {
  data: string[][];
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

export const TableBody = ({ data, onCellChange }: TableBodyProps) => {
  return (
    <UITableBody>
      {data.map((row, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-muted/50">
          {row.map((cell, colIndex) => (
            <TableCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onChange={(value) => onCellChange(rowIndex, colIndex, value)}
            />
          ))}
        </TableRow>
      ))}
    </UITableBody>
  );
};