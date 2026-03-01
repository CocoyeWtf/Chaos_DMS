import { uuid, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { tenantTemplate } from './schema';

export const documents = tenantTemplate.table(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    organisationId: uuid('organisation_id').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    storagePath: text('storage_path').notNull(),
    resourceType: varchar('resource_type', { length: 100 }),
    resourceId: uuid('resource_id'),
    uploadedBy: uuid('uploaded_by').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_document_org').on(table.organisationId),
    index('idx_document_resource').on(table.resourceType, table.resourceId),
    index('idx_document_uploaded_by').on(table.uploadedBy),
  ],
);
