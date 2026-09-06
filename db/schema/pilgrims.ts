import { date, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { genderEnum, timestamps } from './_shared';

export const pilgrims = pgTable(
  'pilgrims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    publicId: text('public_id').notNull(),
    fullName: text('full_name').notNull(),
    gender: genderEnum('gender'),
    birthPlace: text('birth_place'),
    birthDate: date('birth_date', { mode: 'string' }),
    nikEncrypted: text('nik_encrypted'),
    phone: text('phone').notNull(),
    email: text('email'),
    address: text('address'),
    city: text('city'),
    province: text('province'),
    occupation: text('occupation'),
    emergencyName: text('emergency_name'),
    emergencyPhone: text('emergency_phone'),
    emergencyRelation: text('emergency_relation'),
    medicalNotes: text('medical_notes'),
    archivedAt: timestamp('archived_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    publicIdIdx: uniqueIndex('pilgrims_org_public_id_idx').on(table.organizationId, table.publicId),
    nameIdx: index('pilgrims_org_name_idx').on(table.organizationId, table.fullName),
    phoneIdx: index('pilgrims_org_phone_idx').on(table.organizationId, table.phone),
  })
);
