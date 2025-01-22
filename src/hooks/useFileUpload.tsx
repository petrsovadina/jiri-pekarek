import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFileUpload = (onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Pro nahrání souboru musíte být přihlášeni");
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error("Nepodařilo se načíst obsah souboru");
          }

          if (uploadedFile.name.endsWith('.csv')) {
            const text = data as string;
            const rows = text.split('\n')
              .map(row => row.trim())
              .filter(row => row.length > 0)
              .map(row => row.split(',').map(cell => cell.trim()));
            
            const columns = rows[0];
            const parsedData = rows.slice(1).filter(row => row.some(cell => cell !== ''));

            const { error: fileError } = await supabase
              .from('files')
              .insert({
                name: uploadedFile.name,
                original_name: uploadedFile.name,
                mime_type: uploadedFile.type,
                size: uploadedFile.size,
                columns: columns,
                data: parsedData,
                status: 'pending',
                user_id: user.id,
                is_active: true
              });

            if (fileError) throw fileError;

            toast({
              title: "Soubor byl úspěšně nahrán",
              description: "Data byla zpracována a uložena",
            });

            onSuccess();
          } else {
            toast({
              variant: "destructive",
              title: "Nepodporovaný formát",
              description: "Prosím nahrajte soubor ve formátu CSV",
            });
          }
        } catch (err) {
          console.error("Error processing file:", err);
          toast({
            variant: "destructive",
            title: "Chyba při zpracování",
            description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Chyba při čtení souboru",
          description: "Nepodařilo se přečíst obsah souboru",
        });
        setIsUploading(false);
      };

      reader.readAsText(uploadedFile);
    } catch (err) {
      console.error("Error in handleFileUpload:", err);
      toast({
        variant: "destructive",
        title: "Chyba při nahrávání",
        description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
      });
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleFileUpload
  };
};