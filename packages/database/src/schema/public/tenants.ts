import { pgTable, uuid, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { tenantStatusEnum } from './enums';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  schemaName: varchar('schema_name', { length: 63 }).notNull().unique(),
  status: tenantStatusEnum('status').notNull().default('provisioning'),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  maxUsers: integer('max_users').notNull().default(500),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
