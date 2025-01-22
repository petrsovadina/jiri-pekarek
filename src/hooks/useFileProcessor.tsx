import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface FileProcessorOptions {
  onSuccess: (fileId: string) => void;
}

export const useFileProcessor = ({ onSuccess }: FileProcessorOptions) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const processFile = async (file: File, userId: string) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let parsedData: string[][] = [];
          let columns: string[] = [];
          
          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const rows = text.split('\n').map(row => row.split(','));
            columns = rows[0];
            parsedData = rows.slice(1).filter(row => row.some(cell => Boolean(cell.trim())));
          } else if (file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as (string | number)[][];
            columns = jsonData[0].map(String);
            parsedData = jsonData.slice(1)
              .filter(row => row.some(cell => Boolean(cell)))
              .map(row => row.map(String));
          }

          const { data: fileData, error: fileError } = await supabase
            .from('files')
            .insert({
              name: file.name,
              original_name: file.name,
              mime_type: file.type,
              size: file.size,
              columns: columns,
              data: parsedData,
              status: 'pending',
              user_id: userId,
              is_active: true
            })
            .select()
            .single();

          if (fileError) throw fileError;

          toast({
            title: "Soubor byl úspěšně nahrán",
            description: "Data byla zpracována a uložena",
          });

          if (fileData) {
            onSuccess(fileData.id);
          }

          setUploadProgress(100);
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Chyba při zpracování",
            description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
          });
          throw err;
        }
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 100);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Chyba při zpracování",
        description: err instanceof Error ? err.message : "Nastala neočekávaná chyba",
      });
      throw err;
    }
  };

  return {
    uploadProgress,
    processFile
  };
};