import './load-env.mjs';
import assert from 'node:assert/strict';
import { and, eq, inArray } from 'drizzle-orm';
import { createNodeDb } from '../db/node';
import { organizations, travelPackages, departures, pilgrims, registrations, invoices, payments, receipts, invoiceItems } from '../db/schema';
const { db, pool } = createNodeDb();
const slug = 'uji-dp-flow-v2-private';
const name = 'UJI INTERNAL DP V2';
try {
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, 'hammad-tour'));
  assert(org);
  if (process.argv.includes('--create')) {
    const existing = await db.select().from(travelPackages).where(and(eq(travelPackages.organizationId, org.id), eq(travelPackages.slug, slug)));
    assert.equal(existing.length, 0, 'Fixture already exists');
    await db.transaction(async tx => {
      const [pkg] = await tx.insert(travelPackages).values({ organizationId: org.id, code: slug, slug, name,
        type: 'UMRAH', durationDays: 9, durationNights: 8, startingPrice: 30_000_000, isPublished: 0 }).returning();
      const [departure] = await tx.insert(departures).values({ organizationId: org.id, packageId: pkg.id,
        code: slug, departureDate: '2027-01-15', returnDate: '2027-01-23', quota: 5, status: 'OPEN' }).returning();
      const [person] = await tx.insert(pilgrims).values({ organizationId: org.id, publicId: slug,
        fullName: name, phone: '081200000000' }).returning();
      console.log({ departureId: departure.id, pilgrimId: person.id });
    });
  } else {
    const [pkg] = await db.select().from(travelPackages).where(and(eq(travelPackages.organizationId, org.id), eq(travelPackages.slug, slug)));
    assert(pkg && !pkg.isPublished);
    const schedules = await db.select().from(departures).where(and(eq(departures.organizationId, org.id), eq(departures.packageId, pkg.id)));
    assert.equal(schedules.length, 1);
    const people = await db.select().from(pilgrims).where(and(eq(pilgrims.organizationId, org.id), eq(pilgrims.publicId, slug)));
    assert.equal(people.length, 1);
    const regs = await db.select().from(registrations).where(and(eq(registrations.organizationId, org.id), eq(registrations.departureId, schedules[0].id)));
    assert.equal(regs.length, 1);
    assert.equal(regs[0].pilgrimId, people[0].id);
    assert.equal(regs[0].finalPrice, 29_000_000);
    assert.equal(regs[0].dpTarget, 5_000_000);
    assert.equal(regs[0].settlementDueDate, '2026-12-16');
    const bills = await db.select().from(invoices).where(and(eq(invoices.organizationId, org.id), eq(invoices.registrationId, regs[0].id)));
    assert.equal(bills.length, 2);
    assert.equal(bills.reduce((sum, b) => sum + b.total, 0), 29_000_000);
    assert.equal(bills.reduce((sum, b) => sum + b.paidAmount, 0), 5_000_000);
    const first = bills.find(b => b.total === 5_000_000);
    assert.equal(first?.status, 'PAID');
    assert.equal(first?.snapshot.agreedPrice, 29_000_000);
    const paid = await db.select().from(payments).where(and(eq(payments.organizationId, org.id), inArray(payments.invoiceId, bills.map(b => b.id))));
    assert.equal(paid.length, 1);
    const vouchers = await db.select().from(receipts).where(and(eq(receipts.organizationId, org.id), eq(receipts.paymentId, paid[0].id)));
    assert.equal(vouchers.length, 1);
    console.log('PASS: agreed 29m, DP invoice 5m paid, next invoice 24m, H-30 deadline, one receipt.');
    if (process.argv.includes('--cleanup')) await db.transaction(async tx => {
      await tx.delete(receipts).where(eq(receipts.id, vouchers[0].id));
      await tx.delete(payments).where(eq(payments.id, paid[0].id));
      await tx.delete(invoiceItems).where(inArray(invoiceItems.invoiceId, bills.map(b => b.id)));
      await tx.delete(invoices).where(inArray(invoices.id, bills.map(b => b.id)));
      await tx.delete(registrations).where(eq(registrations.id, regs[0].id));
      await tx.delete(departures).where(eq(departures.id, schedules[0].id));
      await tx.delete(pilgrims).where(eq(pilgrims.id, people[0].id));
      await tx.delete(travelPackages).where(eq(travelPackages.id, pkg.id));
      console.log('Removed only the verified private fixture; audit events retained.');
    });
  }
} finally { await pool.end(); }
