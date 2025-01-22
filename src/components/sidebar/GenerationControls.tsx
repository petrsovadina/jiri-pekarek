import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square } from "lucide-react";

interface GenerationControlsProps {
  selectedColumn: string | null;
  selectedPrompt: string | null;
  onGenerateStart: () => void;
  onGenerateStop: () => void;
  isGenerating: boolean;
  progress: number;
}

export const GenerationControls = ({
  selectedColumn,
  selectedPrompt,
  onGenerateStart,
  onGenerateStop,
  isGenerating,
  progress,
}: GenerationControlsProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Generování</h3>
      
      {selectedColumn && selectedPrompt ? (
        <div className="space-y-4">
          {isGenerating ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generování dat...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={onGenerateStop}
              >
                <Square className="h-4 w-4 mr-2" />
                Zastavit
              </Button>
            </>
          ) : (
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={onGenerateStart}
            >
              <Play className="h-4 w-4 mr-2" />
              Spustit generování
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nejprve vyberte sloupec a prompt
        </p>
      )}
    </Card>
  );
};