import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gjvhrgybjoujrcbxbuth.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdmhyZ3liam91anJjYnhidXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNjM1NDAsImV4cCI6MjA1MjczOTU0MH0.fHR76CYHuhTj8lZQLeXv5UAiDl5t4UZTVohS1Mflk4Y";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);