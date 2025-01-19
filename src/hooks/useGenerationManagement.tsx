import { useState } from "react";

export const useGenerationManagement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const handleGenerateStart = () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const handleGenerateStop = () => {
    setIsGenerating(false);
    setProgress(0);
  };

  return {
    isGenerating,
    progress,
    selectedColumn,
    setSelectedColumn,
    handleGenerateStart,
    handleGenerateStop
  };
};