import './load-env.mjs';
import { and, eq, inArray } from 'drizzle-orm';
import { createNodeDb } from '../db/node';
import { organizations, travelPackages, departures, pilgrims, registrations, invoices, payments, receipts, invoiceItems } from '@/db/schema';
const {db,pool}=createNodeDb();
try {
  const [org]=await db.select().from(organizations).where(eq(organizations.slug,'hammad-tour'));
  if(!org) throw new Error('Demo organization missing');
  const [pkg]=await db.select().from(travelPackages).where(and(eq(travelPackages.organizationId,org.id),eq(travelPackages.slug,'uji-internal-alur-20260907')));
  const people=await db.select().from(pilgrims).where(and(eq(pilgrims.organizationId,org.id),eq(pilgrims.fullName,'UJI INTERNAL - Jamaah alur 7 September')));
  if(!pkg || pkg.isPublished || people.length !== 1) throw new Error('Fixture identity mismatch');
  const schedules=await db.select().from(departures).where(and(eq(departures.organizationId,org.id),eq(departures.packageId,pkg.id)));
  if(schedules.length!==1)throw new Error('Unexpected fixture departures');
  const regs=await db.select().from(registrations).where(and(eq(registrations.organizationId,org.id),eq(registrations.departureId,schedules[0].id)));
  if(regs.length!==1 || regs[0].pilgrimId!==people[0].id)throw new Error('Unexpected registration');
  const bills=await db.select().from(invoices).where(and(eq(invoices.organizationId,org.id),eq(invoices.registrationId,regs[0].id)));
  if(bills.length!==1 || bills[0].total!==25000000 || bills[0].paidAmount!==5000000 || bills[0].outstandingAmount!==20000000 || bills[0].status!=='PARTIAL')throw new Error('Invoice calculation mismatch');
  const paid=await db.select().from(payments).where(and(eq(payments.organizationId,org.id),eq(payments.invoiceId,bills[0].id)));
  if(paid.length!==1 || paid[0].amount!==5000000)throw new Error('Payment mismatch');
  const issued=await db.select().from(receipts).where(eq(receipts.paymentId,paid[0].id));
  if(issued.length!==1)throw new Error('Receipt missing or duplicated');
  console.log('PASS: package → departure → registration → invoice 25m → payment 5m → balance 20m → one receipt');
  if(process.argv.includes('--cleanup')) {
    await db.transaction(async tx=>{
      await tx.delete(receipts).where(eq(receipts.id,issued[0].id));
      await tx.delete(payments).where(eq(payments.id,paid[0].id));
      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId,bills[0].id));
      await tx.delete(invoices).where(eq(invoices.id,bills[0].id));
      await tx.delete(registrations).where(eq(registrations.id,regs[0].id));
      await tx.delete(departures).where(eq(departures.id,schedules[0].id));
      await tx.delete(pilgrims).where(inArray(pilgrims.id,people.map(p=>p.id)));
      await tx.delete(travelPackages).where(eq(travelPackages.id,pkg.id));
    });
    console.log('Removed only verified UJI INTERNAL fixture records; audit events retained.');
  }
} finally {await pool.end();}
