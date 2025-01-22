import { ReactNode } from "react";
import { TableLayoutHeader } from "./TableLayoutHeader";
import { TableSidebar } from "../TableSidebar";

interface TableLayoutProps {
  children: ReactNode;
  fileName?: string;
  selectedColumn: string | null;
  prompts: Array<{ id: string; name: string; content: string }>;
  onPromptSelect: (promptId: string) => void;
  onPromptCreate: (name: string, content: string) => void;
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
  onPromptCreate,
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
        <TableLayoutHeader
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
            onPromptCreate={onPromptCreate}
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