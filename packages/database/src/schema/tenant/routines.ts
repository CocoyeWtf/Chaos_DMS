import {
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { routineFrequencyEnum, routineStatusEnum } from './enums';

export const routines = tenantTemplate.table(
  'routines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    organisationId: uuid('organisation_id').notNull(),
    frequency: routineFrequencyEnum('frequency').notNull(),
    scheduledTime: varchar('scheduled_time', { length: 5 }),
    scheduledDayOfWeek: integer('scheduled_day_of_week'),
    scheduledDayOfMonth: integer('scheduled_day_of_month'),
    checklistTemplateId: uuid('checklist_template_id'),
    assignedTo: uuid('assigned_to').notNull(),
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
    index('idx_routine_org').on(table.organisationId),
    index('idx_routine_assigned').on(table.assignedTo),
    index('idx_routine_frequency').on(table.frequency),
  ],
);

export const routineExecutions = tenantTemplate.table(
  'routine_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    status: routineStatusEnum('status').notNull().default('scheduled'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'string' }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    executedBy: uuid('executed_by'),
    checklistId: uuid('checklist_id'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_routine_exec_routine').on(table.routineId),
    index('idx_routine_exec_scheduled').on(table.scheduledAt),
    index('idx_routine_exec_status').on(table.status),
  ],
);
