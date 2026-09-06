import { bigint, date, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { departures } from './departures';
import { organizations } from './organizations';
import { packagePriceVariants } from './travel-packages';
import { pilgrims } from './pilgrims';
import { documentStatusEnum, registrationStatusEnum, timestamps } from './_shared';
import { users } from './users';

export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    registrationNumber: text('registration_number').notNull(),
    pilgrimId: uuid('pilgrim_id').notNull().references(() => pilgrims.id),
    departureId: uuid('departure_id').notNull().references(() => departures.id),
    priceVariantId: uuid('price_variant_id').references(() => packagePriceVariants.id),
    registrationDate: date('registration_date', { mode: 'string' }).notNull(),
    registrationStatus: registrationStatusEnum('registration_status').notNull().default('DRAFT'),
    documentStatus: documentStatusEnum('document_status').notNull().default('MISSING'),
    basePrice: bigint('base_price', { mode: 'number' }).notNull(),
    discount: bigint('discount', { mode: 'number' }).notNull().default(0),
    additionalFee: bigint('additional_fee', { mode: 'number' }).notNull().default(0),
    finalPrice: bigint('final_price', { mode: 'number' }).notNull(),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex('registrations_org_number_idx').on(
      table.organizationId,
      table.registrationNumber
    ),
    departureIdx: index('registrations_org_departure_idx').on(
      table.organizationId,
      table.departureId,
      table.registrationStatus
    ),
  })
);
