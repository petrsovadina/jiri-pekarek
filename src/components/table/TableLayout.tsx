import { ReactNode } from "react";
import { TableHeader } from "./TableHeader";
import { TableSidebar } from "../TableSidebar";

interface TableLayoutProps {
  children: ReactNode;
  fileName?: string;
  selectedColumn: string | null;
  prompts: Array<{ id: string; name: string; content: string }>;
  onPromptSelect: (promptId: string) => void;
  onGenerateStart: () => void;
  onGenerateStop: () => void;
  isGenerating: boolean;
  progress: number;
  onExport: () => void;
  onSave: () => void;
}

export const TableLayout = ({
  children,
  fileName,
  selectedColumn,
  prompts,
  onPromptSelect,
  onGenerateStart,
  onGenerateStop,
  isGenerating,
  progress,
  onExport,
  onSave,
}: TableLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <TableHeader
          fileName={fileName}
          onExport={onExport}
          onSave={onSave}
        />
        <div className="flex gap-6">
          <div className="flex-1">
            {children}
          </div>
          <TableSidebar
            selectedColumn={selectedColumn}
            prompts={prompts}
            onPromptSelect={onPromptSelect}
            onGenerateStart={onGenerateStart}
            onGenerateStop={onGenerateStop}
            isGenerating={isGenerating}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
};