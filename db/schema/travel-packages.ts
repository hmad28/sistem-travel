import { sql } from 'drizzle-orm';
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { travelPackageTypeEnum, timestamps } from './_shared';
import { users } from './users';

export const travelPackages = pgTable(
  'travel_packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    code: text('code').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    type: travelPackageTypeEnum('type').notNull().default('UMRAH'),
    shortDescription: text('short_description'),
    description: text('description'),
    durationDays: integer('duration_days').notNull(),
    durationNights: integer('duration_nights').notNull(),
    thumbnailKey: text('thumbnail_key'),
    startingPrice: bigint('starting_price', { mode: 'number' }).notNull().default(0),
    departureAirport: text('departure_airport'),
    defaultAirline: text('default_airline'),
    makkahHotelText: text('makkah_hotel_text'),
    madinahHotelText: text('madinah_hotel_text'),
    inclusions: jsonb('inclusions').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    exclusions: jsonb('exclusions').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    facilities: jsonb('facilities').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    requirements: jsonb('requirements').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    itinerary: jsonb('itinerary').$type<Record<string, unknown>[]>().notNull().default(sql`'[]'::jsonb`),
    isPublished: integer('is_published').notNull().default(0),
    isFeatured: integer('is_featured').notNull().default(0),
    displayOrder: integer('display_order').notNull().default(0),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    archivedAt: timestamp('archived_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex('travel_packages_org_slug_idx').on(table.organizationId, table.slug),
    codeIdx: uniqueIndex('travel_packages_org_code_idx').on(table.organizationId, table.code),
    publishedIdx: index('travel_packages_org_published_idx').on(
      table.organizationId,
      table.isPublished
    ),
  })
);

export const packagePriceVariants = pgTable(
  'package_price_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    packageId: uuid('package_id').notNull().references(() => travelPackages.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    occupancy: integer('occupancy'),
    price: bigint('price', { mode: 'number' }).notNull(),
    childPolicy: text('child_policy'),
    isActive: integer('is_active').notNull().default(1),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    packageIdx: index('package_price_variants_package_idx').on(table.organizationId, table.packageId),
    codeIdx: uniqueIndex('package_price_variants_org_code_idx').on(
      table.organizationId,
      table.packageId,
      table.code
    ),
  })
);
