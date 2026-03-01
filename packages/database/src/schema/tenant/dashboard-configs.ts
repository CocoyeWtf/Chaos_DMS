import { uuid, varchar, timestamp, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';

export const dashboardConfigs = tenantTemplate.table(
  'dashboard_configs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    name: varchar('name', { length: 255 }).notNull().default('Default'),
    config: jsonb('config')
      .$type<{
        widgets: Array<{
          id: string;
          type: string;
          position: { x: number; y: number; w: number; h: number };
          settings: Record<string, unknown>;
        }>;
        theme?: string;
      }>()
      .notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_dashboard_user').on(table.userId),
    index('idx_dashboard_org').on(table.organisationId),
    uniqueIndex('idx_dashboard_user_default').on(
      table.userId,
      table.organisationId,
      table.isDefault,
    ),
  ],
);
