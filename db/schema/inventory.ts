import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';
import { timestamps } from './_shared';

export const stockItems = pgTable(
  'stock_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    code: text('code').notNull(),
    name: text('name').notNull(),
    unit: text('unit').notNull(),
    quantity: integer('quantity').notNull().default(0),
    minimum: integer('minimum').notNull().default(0),
    revision: integer('revision').notNull().default(0),
    archivedAt: timestamp('archived_at', { mode: 'date' }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('stock_items_org_code_idx').on(t.organizationId, t.code),
    uniqueIndex('stock_items_org_id_idx').on(t.organizationId, t.id),
    check(
      'stock_items_balances_valid',
      sql`${t.quantity} >= 0 and ${t.minimum} >= 0 and ${t.revision} >= 0`
    ),
  ]
);

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    itemId: uuid('item_id').notNull(),
    kind: text('kind').notNull(),
    quantity: integer('quantity').notNull(),
    balanceBefore: integer('balance_before').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    movedDate: date('moved_date', { mode: 'string' }).notNull(),
    note: text('note').notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      columns: [t.organizationId, t.itemId],
      foreignColumns: [stockItems.organizationId, stockItems.id],
      name: 'stock_movements_tenant_item_fk',
    }),
    index('stock_movements_org_item_created_idx').on(t.organizationId, t.itemId, t.createdAt),
    check(
      'stock_movements_balances_valid',
      sql`${t.balanceBefore} >= 0 and ${t.balanceAfter} >= 0 and ${t.balanceAfter} = ${t.balanceBefore} + ${t.quantity}`
    ),
    check(
      'stock_movements_kind_valid',
      sql`(${t.kind} = 'IN' and ${t.quantity} > 0) or (${t.kind} = 'OUT' and ${t.quantity} < 0) or (${t.kind} = 'ADJUST' and ${t.quantity} <> 0)`
    ),
  ]
);
