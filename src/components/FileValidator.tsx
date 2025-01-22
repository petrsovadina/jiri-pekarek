import { useToast } from "@/hooks/use-toast";

interface FileValidatorProps {
  file: File;
  maxSize?: number;
  allowedTypes?: string[];
}

export const validateFile = ({ 
  file, 
  maxSize = 10 * 1024 * 1024, 
  allowedTypes = ['.csv', '.xlsx'] 
}: FileValidatorProps) => {
  const { toast } = useToast();

  if (!file.name.match(new RegExp(`\\.(${allowedTypes.map(t => t.replace('.', '')).join('|')})$`, 'i'))) {
    toast({
      variant: "destructive",
      title: "Nepodporovaný formát",
      description: `Prosím nahrajte soubor typu ${allowedTypes.join(' nebo ')}`,
    });
    return false;
  }

  if (file.size > maxSize) {
    toast({
      variant: "destructive",
      title: "Soubor je příliš velký",
      description: `Maximální velikost je ${Math.round(maxSize / 1024 / 1024)}MB`,
    });
    return false;
  }

  return true;
};