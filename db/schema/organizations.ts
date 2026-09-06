import {
  AnyPgColumn,
  index,
  pgTable,
  text,
  varchar,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { orgStatusEnum, timestamps } from './_shared';
import { users } from './users';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    legalName: text('legal_name'),
    logoUrl: text('logo_url'),
    faviconUrl: text('favicon_url'),
    primaryColor: varchar('primary_color', { length: 16 }).default('#0d493f'),
    secondaryColor: varchar('secondary_color', { length: 16 }).default('#d4ad5c'),
    email: text('email'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    address: text('address'),
    city: text('city'),
    province: text('province'),
    websiteDomain: text('website_domain'),
    timezone: text('timezone').notNull().default('Asia/Jakarta'),
    currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
    locale: varchar('locale', { length: 10 }).notNull().default('id-ID'),
    status: orgStatusEnum('status').notNull().default('ACTIVE'),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => organizations.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex('organizations_slug_idx').on(table.slug),
    ownerIdx: index('organizations_owner_id_idx').on(table.ownerId),
    parentIdx: index('organizations_parent_id_idx').on(table.parentId),
  })
);
