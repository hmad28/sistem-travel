import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  date,
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
import { registrations } from './registrations';
import { invoiceStatusEnum, paymentStatusEnum, timestamps } from './_shared';
import { users } from './users';

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    invoiceNumber: text('invoice_number').notNull(),
    registrationId: uuid('registration_id').references(() => registrations.id),
    customerName: text('customer_name').notNull(),
    issueDate: date('issue_date', { mode: 'string' }).notNull(),
    dueDate: date('due_date', { mode: 'string' }),
    subtotal: bigint('subtotal', { mode: 'number' }).notNull(),
    discount: bigint('discount', { mode: 'number' }).notNull().default(0),
    additionalFee: bigint('additional_fee', { mode: 'number' }).notNull().default(0),
    total: bigint('total', { mode: 'number' }).notNull(),
    paidAmount: bigint('paid_amount', { mode: 'number' }).notNull().default(0),
    outstandingAmount: bigint('outstanding_amount', { mode: 'number' }).notNull(),
    status: invoiceStatusEnum('status').notNull().default('DRAFT'),
    notes: text('notes'),
    snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    voidedAt: timestamp('voided_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex('invoices_org_number_idx').on(table.organizationId, table.invoiceNumber),
    statusIdx: index('invoices_org_status_due_idx').on(
      table.organizationId,
      table.status,
      table.dueDate
    ),
    totalsValid: check(
      'invoices_totals_valid',
      sql`${table.total} >= 0 and ${table.paidAmount} >= 0 and ${table.outstandingAmount} >= 0`
    ),
  })
);

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: bigint('unit_price', { mode: 'number' }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    paymentNumber: text('payment_number').notNull(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    method: text('method').notNull(),
    paidAt: timestamp('paid_at', { mode: 'date' }).notNull(),
    referenceNumber: text('reference_number'),
    proofFileKey: text('proof_file_key'),
    status: paymentStatusEnum('status').notNull().default('PENDING'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
    verifiedAt: timestamp('verified_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex('payments_org_number_idx').on(table.organizationId, table.paymentNumber),
    invoiceIdx: index('payments_org_invoice_idx').on(table.organizationId, table.invoiceId, table.status),
    positiveAmount: check('payments_positive_amount', sql`${table.amount} > 0`),
  })
);

export const receipts = pgTable(
  'receipts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id),
    receiptNumber: text('receipt_number').notNull(),
    paymentId: uuid('payment_id').notNull().references(() => payments.id),
    issuedAt: timestamp('issued_at', { mode: 'date' }).notNull().defaultNow(),
    issuedBy: uuid('issued_by').references(() => users.id, { onDelete: 'set null' }),
    snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull(),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex('receipts_org_number_idx').on(table.organizationId, table.receiptNumber),
    paymentIdx: uniqueIndex('receipts_payment_idx').on(table.paymentId),
  })
);
