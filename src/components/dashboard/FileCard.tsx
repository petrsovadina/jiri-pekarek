import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

interface FileCardProps {
  id: string;
  name: string;
  createdAt: string;
  onClick: (id: string) => void;
}

export const FileCard = ({ id, name, createdAt, onClick }: FileCardProps) => {
  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {name}
        </CardTitle>
        <CardDescription>
          Vytvořeno: {new Date(createdAt).toLocaleDateString("cs-CZ")}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};