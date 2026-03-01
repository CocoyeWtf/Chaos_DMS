import { uuid, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { anomalyStatusEnum, anomalySeverityEnum } from './enums';

export const anomalies = tenantTemplate.table(
  'anomalies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    status: anomalyStatusEnum('status').notNull().default('open'),
    severity: anomalySeverityEnum('severity').notNull(),
    detectedAt: timestamp('detected_at', { withTimezone: true, mode: 'string' }).notNull(),
    detectedBy: uuid('detected_by').notNull(),
    assignedTo: uuid('assigned_to'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'string' }),
    resolvedBy: uuid('resolved_by'),
    rootCause: text('root_cause'),
    immediateAction: text('immediate_action'),
    checklistId: uuid('checklist_id'),
    kpiDefinitionId: uuid('kpi_definition_id'),
    attachments: jsonb('attachments').$type<string[]>().default([]),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_anomaly_org').on(table.organisationId),
    index('idx_anomaly_status').on(table.status),
    index('idx_anomaly_severity').on(table.severity),
    index('idx_anomaly_assigned').on(table.assignedTo),
    index('idx_anomaly_detected').on(table.detectedAt),
    index('idx_anomaly_code').on(table.code),
  ],
);
