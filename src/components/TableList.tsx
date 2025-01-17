import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TableData {
  id: string;
  name: string;
  uploadDate: string;
  status: string;
}

const TableList = () => {
    const tables: TableData[] = [
        {
            id: "1",
            name: "Tabulka 1",
            uploadDate: "2024-07-24",
            status: "Generováno"
        },
        {
            id: "2",
            name: "Tabulka 2",
            uploadDate: "2024-07-23",
            status: "Čeká na generování"
        }
    ];

  return (
    <div className="space-y-4">
      {tables.map((table) => (
        <div key={table.id} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
            <p className="text-gray-500 text-sm">Nahráno: {table.uploadDate}</p>
            <p className="text-gray-500 text-sm">Stav: {table.status}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/editor/${table.id}`}>
              <Button size="sm">Otevřít</Button>
            </Link>
            <Button size="sm" variant="destructive">Smazat</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableList;
