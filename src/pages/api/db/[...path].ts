import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const db = drizzle(pool, { schema });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;

  try {
    switch (path[0]) {
      case 'table':
        if (req.method === 'GET') {
          const { id } = req.query;
          const result = await db.query.files.findFirst({
            where: (files, { eq }) => eq(files.id, id as string)
          });
          return res.status(200).json(result);
        }
        if (req.method === 'PUT') {
          const { id } = req.query;
          const { data } = req.body;
          await db.update(schema.files)
            .set({ data, updated_at: new Date() })
            .where(eq(schema.files.id, id as string));
          return res.status(200).json({ success: true });
        }
        break;

      case 'upload':
        if (req.method === 'POST') {
          const fileData = req.body;
          const [result] = await db.insert(schema.files)
            .values(fileData)
            .returning();
          return res.status(200).json(result);
        }
        break;

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
