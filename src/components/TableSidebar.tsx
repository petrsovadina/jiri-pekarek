import { useState } from "react";
import { PromptSettings } from "./sidebar/PromptSettings";
import { GenerationControls } from "./sidebar/GenerationControls";

interface TableSidebarProps {
  selectedColumn: string | null;
  prompts: Array<{ id: string; name: string; content: string }>;
  onPromptSelect: (promptId: string) => void;
  onPromptCreate: (name: string, content: string) => void;
  onGenerateStart: () => void;
  onGenerateStop: () => void;
  isGenerating: boolean;
  progress: number;
}

export const TableSidebar = ({
  selectedColumn,
  prompts,
  onPromptSelect,
  onPromptCreate,
  onGenerateStart,
  onGenerateStop,
  isGenerating,
  progress,
}: TableSidebarProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompt(promptId);
    onPromptSelect(promptId);
  };

  return (
    <div className="w-80 border-l animate-slide-in-right">
      <div className="p-4 space-y-4">
        <PromptSettings
          selectedColumn={selectedColumn}
          prompts={prompts}
          onPromptSelect={handlePromptSelect}
          onPromptCreate={onPromptCreate}
        />
        <GenerationControls
          selectedColumn={selectedColumn}
          selectedPrompt={selectedPrompt}
          onGenerateStart={onGenerateStart}
          onGenerateStop={onGenerateStop}
          isGenerating={isGenerating}
          progress={progress}
        />
      </div>
    </div>
  );
};