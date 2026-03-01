import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { orgLevelEnum } from './enums';

export const organisations = pgTable(
  'organisations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    level: orgLevelEnum('level').notNull(),
    levelDepth: integer('level_depth').notNull(),
    path: text('path'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_org_tenant').on(table.tenantId),
    index('idx_org_parent').on(table.parentId),
    index('idx_org_level').on(table.tenantId, table.level),
    uniqueIndex('idx_org_tenant_code').on(table.tenantId, table.code),
  ],
);

export const organisationsRelations = relations(organisations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [organisations.tenantId],
    references: [tenants.id],
  }),
  parent: one(organisations, {
    fields: [organisations.parentId],
    references: [organisations.id],
    relationName: 'parentChild',
  }),
  children: many(organisations, { relationName: 'parentChild' }),
  closureAncestors: many(organisationClosure, { relationName: 'descendant' }),
  closureDescendants: many(organisationClosure, { relationName: 'ancestor' }),
}));

/**
 * Closure table for efficient hierarchical queries.
 * depth=0 means self-reference (every node is its own ancestor at depth 0).
 */
export const organisationClosure = pgTable(
  'organisation_closure',
  {
    ancestorId: uuid('ancestor_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    descendantId: uuid('descendant_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    depth: integer('depth').notNull(),
  },
  (table) => [
    index('idx_closure_ancestor').on(table.ancestorId),
    index('idx_closure_descendant').on(table.descendantId),
    index('idx_closure_depth').on(table.depth),
    uniqueIndex('idx_closure_pair').on(table.ancestorId, table.descendantId),
  ],
);

export const organisationClosureRelations = relations(organisationClosure, ({ one }) => ({
  ancestor: one(organisations, {
    fields: [organisationClosure.ancestorId],
    references: [organisations.id],
    relationName: 'ancestor',
  }),
  descendant: one(organisations, {
    fields: [organisationClosure.descendantId],
    references: [organisations.id],
    relationName: 'descendant',
  }),
}));
