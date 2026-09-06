import { check, date, index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';
import { travelPackages } from './travel-packages';
import { departureStatusEnum, timestamps } from './_shared';

export const departures = pgTable(
  'departures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    packageId: uuid('package_id').notNull().references(() => travelPackages.id),
    code: text('code').notNull(),
    departureDate: date('departure_date', { mode: 'string' }).notNull(),
    returnDate: date('return_date', { mode: 'string' }).notNull(),
    quota: integer('quota').notNull(),
    reservedSeats: integer('reserved_seats').notNull().default(0),
    confirmedSeats: integer('confirmed_seats').notNull().default(0),
    status: departureStatusEnum('status').notNull().default('DRAFT'),
    meetingPoint: text('meeting_point'),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => ({
    codeIdx: uniqueIndex('departures_org_code_idx').on(table.organizationId, table.code),
    scheduleIdx: index('departures_org_schedule_idx').on(
      table.organizationId,
      table.departureDate,
      table.status
    ),
    validDates: check('departures_valid_dates', sql`${table.returnDate} > ${table.departureDate}`),
    validQuota: check(
      'departures_valid_quota',
      sql`${table.quota} >= 0 and ${table.reservedSeats} >= 0 and ${table.confirmedSeats} >= 0 and ${table.confirmedSeats} <= ${table.quota}`
    ),
  })
);
