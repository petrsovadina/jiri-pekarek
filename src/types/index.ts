export interface Table {
  id: string;
  name: string;
  data: any[][];
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  apiKey?: string;
  createdAt: Date;
}

export interface TableGenerationConfig {
  tableId: string;
  promptId: string;
  targetColumn: string;
  sourceColumns: string[];
}
