import { FileCard } from "./FileCard";
import { NewFileCard } from "./NewFileCard";

interface FileRecord {
  id: string;
  name: string;
  created_at: string;
}

interface FileGridProps {
  files: FileRecord[];
  onFileClick: (fileId: string) => void;
  isLoading: boolean;
}

export const FileGrid = ({ files, onFileClick, isLoading }: FileGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Načítání tabulek...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Zatím nemáte žádné tabulky. Začněte nahráním nové tabulky.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewFileCard />
      {files.map((file) => (
        <FileCard
          key={file.id}
          id={file.id}
          name={file.name}
          createdAt={file.created_at}
          onClick={onFileClick}
        />
      ))}
    </div>
  );
};