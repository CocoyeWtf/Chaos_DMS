import { uuid, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { actionPlanStatusEnum } from './enums';
import { anomalies } from './anomalies';

export const actionPlans = tenantTemplate.table(
  'action_plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    anomalyId: uuid('anomaly_id').references(() => anomalies.id, { onDelete: 'set null' }),
    status: actionPlanStatusEnum('status').notNull().default('draft'),
    priority: integer('priority').notNull().default(3),
    assignedTo: uuid('assigned_to').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'string' }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    completedBy: uuid('completed_by'),
    steps: jsonb('steps')
      .$type<
        Array<{
          phase: 'plan' | 'do' | 'check' | 'act';
          description: string;
          status: 'pending' | 'in_progress' | 'completed';
          completedAt?: string;
        }>
      >()
      .default([]),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    version: integer('version').notNull().default(1),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_action_plan_org').on(table.organisationId),
    index('idx_action_plan_anomaly').on(table.anomalyId),
    index('idx_action_plan_status').on(table.status),
    index('idx_action_plan_assigned').on(table.assignedTo),
    index('idx_action_plan_due').on(table.dueDate),
  ],
);
