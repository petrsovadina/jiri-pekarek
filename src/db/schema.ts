import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

// Tabulka pro soubory
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  original_name: text('original_name').notNull(),
  mime_type: text('mime_type').notNull(),
  size: text('size').notNull(),
  columns: jsonb('columns').notNull(),
  data: jsonb('data').notNull(),
  status: text('status').notNull().default('pending'),
  user_id: uuid('user_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Tabulka pro prompty
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  user_id: uuid('user_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});
