import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Připojení k Supabase s vypnutým prepare mode
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true        // Pokud používáte SSL
});

// Vytvoření instance Drizzle
export const db = drizzle(pool, { schema });
