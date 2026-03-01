import {
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { kpiTypeEnum, kpiFrequencyEnum } from './enums';

export const kpiDefinitions = tenantTemplate.table(
  'kpi_definitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: kpiTypeEnum('type').notNull(),
    frequency: kpiFrequencyEnum('frequency').notNull(),
    unit: varchar('unit', { length: 50 }),
    targetValue: numeric('target_value', { precision: 12, scale: 4 }),
    warningThreshold: numeric('warning_threshold', { precision: 12, scale: 4 }),
    criticalThreshold: numeric('critical_threshold', { precision: 12, scale: 4 }),
    isHigherBetter: boolean('is_higher_better').notNull().default(true),
    organisationId: uuid('organisation_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_kpi_def_org').on(table.organisationId),
    index('idx_kpi_def_type').on(table.type),
  ],
);

/**
 * KPI values. In production, this table will be partitioned monthly
 * via custom SQL migration on the `recorded_at` column.
 */
export const kpiValues = tenantTemplate.table(
  'kpi_values',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kpiDefinitionId: uuid('kpi_definition_id')
      .notNull()
      .references(() => kpiDefinitions.id, { onDelete: 'cascade' }),
    organisationId: uuid('organisation_id').notNull(),
    value: numeric('value', { precision: 12, scale: 4 }).notNull(),
    targetValue: numeric('target_value', { precision: 12, scale: 4 }),
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'string' }).notNull(),
    recordedBy: uuid('recorded_by').notNull(),
    notes: text('notes'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_kpi_val_def').on(table.kpiDefinitionId),
    index('idx_kpi_val_org').on(table.organisationId),
    index('idx_kpi_val_recorded').on(table.recordedAt),
    index('idx_kpi_val_def_org_date').on(
      table.kpiDefinitionId,
      table.organisationId,
      table.recordedAt,
    ),
  ],
);
