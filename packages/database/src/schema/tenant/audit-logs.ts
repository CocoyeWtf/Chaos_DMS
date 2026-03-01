import { uuid, varchar, text, timestamp, jsonb, inet, index } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { auditActionEnum } from './enums';

/**
 * Append-only audit log. No UPDATE or DELETE should target this table.
 */
export const auditLogs = tenantTemplate.table(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    action: auditActionEnum('action').notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: uuid('resource_id'),
    organisationId: uuid('organisation_id').notNull(),
    oldValues: jsonb('old_values').$type<Record<string, unknown>>(),
    newValues: jsonb('new_values').$type<Record<string, unknown>>(),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_audit_user').on(table.userId),
    index('idx_audit_action').on(table.action),
    index('idx_audit_resource').on(table.resource, table.resourceId),
    index('idx_audit_org').on(table.organisationId),
    index('idx_audit_created').on(table.createdAt),
  ],
);
