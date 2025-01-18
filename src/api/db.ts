import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funkce pro práci s daty
export async function fetchTableData(tableId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', tableId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTableData(tableId: string, data: any) {
  const { error } = await supabase
    .from('files')
    .update({ data })
    .eq('id', tableId);

  if (error) throw error;
}

export async function uploadFile(fileData: any) {
  const { data, error } = await supabase
    .from('files')
    .insert(fileData)
    .select()
    .single();

  if (error) throw error;
  return data;
}
