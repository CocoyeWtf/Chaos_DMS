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
import { checklistStatusEnum } from './enums';

export const checklistTemplates = tenantTemplate.table(
  'checklist_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    organisationId: uuid('organisation_id').notNull(),
    structure: jsonb('structure')
      .$type<{
        sections: Array<{
          title: string;
          items: Array<{
            label: string;
            type: 'boolean' | 'numeric' | 'text' | 'select';
            required: boolean;
            options?: string[];
          }>;
        }>;
      }>()
      .notNull(),
    isActive: boolean('is_active').notNull().default(true),
    version: integer('version').notNull().default(1),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_checklist_tpl_org').on(table.organisationId)],
);

export const checklists = tenantTemplate.table(
  'checklists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: 'restrict' }),
    organisationId: uuid('organisation_id').notNull(),
    status: checklistStatusEnum('status').notNull().default('draft'),
    responses: jsonb('responses').$type<Record<string, unknown>>().default({}),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    validatedBy: uuid('validated_by'),
    validatedAt: timestamp('validated_at', { withTimezone: true, mode: 'string' }),
    assignedTo: uuid('assigned_to').notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_checklist_template').on(table.templateId),
    index('idx_checklist_org').on(table.organisationId),
    index('idx_checklist_status').on(table.status),
    index('idx_checklist_assigned').on(table.assignedTo),
  ],
);
