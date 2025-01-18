import { create } from 'zustand';
import { Table, Prompt } from '../types';

interface AppState {
  tables: Table[];
  prompts: Prompt[];
  setTables: (tables: Table[]) => void;
  setPrompts: (prompts: Prompt[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tables: [],
  prompts: [],
  setTables: (tables) => set({ tables }),
  setPrompts: (prompts) => set({ prompts }),
}));
