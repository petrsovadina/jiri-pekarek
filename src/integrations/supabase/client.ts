import { createClient } from "@supabase/supabase-js";
import type { Database } from './types';

const supabaseUrl = "https://gjvhrgybjoujrcbxbuth.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdmhyZ3liam91anJjYnhidXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MjI5MTcsImV4cCI6MjAyMzM5ODkxN30.LTqzM9V3NBrHoGLZGa-iYpqvKaK4FVlANBhqGDGxEzw";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});