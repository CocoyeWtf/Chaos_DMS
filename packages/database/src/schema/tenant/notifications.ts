import { uuid, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';
import { notificationTypeEnum } from './enums';

export const notifications = tenantTemplate.table(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    resourceType: varchar('resource_type', { length: 100 }),
    resourceId: uuid('resource_id'),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'string' }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_notification_user').on(table.userId),
    index('idx_notification_unread').on(table.userId, table.isRead),
    index('idx_notification_type').on(table.type),
    index('idx_notification_created').on(table.createdAt),
  ],
);
