import { bigint, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { pilgrims } from './pilgrims';
import { registrations } from './registrations';
import { documentStatusEnum, timestamps } from './_shared';
import { users } from './users';

export const documentTypes = pgTable(
  'document_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestamps,
  },
  (table) => ({
    codeIdx: uniqueIndex('document_types_org_code_idx').on(table.organizationId, table.code),
  })
);

export const pilgrimDocuments = pgTable(
  'pilgrim_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    pilgrimId: uuid('pilgrim_id').notNull().references(() => pilgrims.id),
    registrationId: uuid('registration_id').references(() => registrations.id),
    documentTypeId: uuid('document_type_id').notNull().references(() => documentTypes.id),
    fileKey: text('file_key').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    status: documentStatusEnum('status').notNull().default('UPLOADED'),
    reviewNotes: text('review_notes'),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    uploadedAt: timestamp('uploaded_at', { mode: 'date' }).notNull().defaultNow(),
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { mode: 'date' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    pilgrimIdx: index('pilgrim_documents_org_pilgrim_idx').on(
      table.organizationId,
      table.pilgrimId,
      table.status
    ),
  })
);
