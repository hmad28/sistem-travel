import { index, pgTable, text, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const websiteVisits = pgTable('website_visits', {
  id: uuid('id').notNull(),
  organizationId: uuid('organization_id').notNull().references(()=>organizations.id,{onDelete:'cascade'}),
  visitorKey: text('visitor_key').notNull(),
  path: text('path').notNull(),
  device: text('device').notNull(),
  referrer: text('referrer').notNull().default(''),
  createdAt: timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at',{withTimezone:true}).notNull().defaultNow(),
}, t=>[
  primaryKey({columns:[t.organizationId,t.id]}),
  index('website_visits_org_created_idx').on(t.organizationId,t.createdAt),
  index('website_visits_org_seen_idx').on(t.organizationId,t.lastSeenAt),
]);
