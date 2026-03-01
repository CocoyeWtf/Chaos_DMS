import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { organisations } from './organisations';
import { userStatusEnum } from './enums';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'restrict' }),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    displayName: varchar('display_name', { length: 200 }),
    status: userStatusEnum('status').notNull().default('pending'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_user_email_tenant').on(table.tenantId, table.email),
    index('idx_user_org').on(table.organisationId),
    index('idx_user_status').on(table.tenantId, table.status),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  organisation: one(organisations, {
    fields: [users.organisationId],
    references: [organisations.id],
  }),
}));
