import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { registrations, pilgrims, departures, travelPackages, invoices } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { InstallmentInvoiceForm } from '@/components/travel/installment-invoice-form';
import { formatIdr } from '@/lib/travel/format';
import { bookingBalance, settlementDate } from '@/lib/travel/booking-finance';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const context = await requireOrganizationContext(), org = context.organizationId;
  const t = await getTranslations('booking'), w = await getTranslations('workflow');
  if (!hasSessionPermission(context.user, 'registration', 'view', org) || !hasSessionPermission(context.user, 'finance', 'view', org)) return <p>{w('denied')}</p>;
  const [row] = await readDb.select({ r: registrations, p: pilgrims, d: departures, pkg: travelPackages }).from(registrations)
    .innerJoin(pilgrims, and(eq(pilgrims.id, registrations.pilgrimId), eq(pilgrims.organizationId, org)))
    .innerJoin(departures, and(eq(departures.id, registrations.departureId), eq(departures.organizationId, org)))
    .innerJoin(travelPackages, and(eq(travelPackages.id, departures.packageId), eq(travelPackages.organizationId, org)))
    .where(and(eq(registrations.id, id), eq(registrations.organizationId, org)));
  if (!row) notFound();
  const bills = await readDb.select().from(invoices).where(and(eq(invoices.organizationId, org), eq(invoices.registrationId, id))).orderBy(asc(invoices.createdAt));
  const valid = bills.filter(b => !['DRAFT', 'VOID'].includes(b.status) && !b.voidedAt);
  const issued = valid.reduce((sum, b) => sum + b.total, 0), paid = valid.reduce((sum, b) => sum + b.paidAmount, 0);
  const cancelled = ['CANCELLED', 'REFUNDED', 'REJECTED'].includes(row.r.registrationStatus);
  const balance = bookingBalance({ total: row.r.finalPrice, dpTarget: row.r.dpTarget, paid, cancelled });
  const available = Math.max(0, row.r.finalPrice - issued);
  const due = row.r.settlementDueDate || settlementDate(row.d.departureDate);
  return <PageShell title={row.r.registrationNumber} description={`${row.p.fullName} · ${row.pkg.name} · ${row.d.departureDate}`} actions={<Link className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground" href="/admin/manajemen/pembayaran/baru">{t('pay')}</Link>}>
    <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{[[t('total'), row.r.finalPrice], [t('paid'), paid], [t('outstanding'), balance.outstanding]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-5"><p className="text-slate-600">{label}</p><p className="mt-2 text-2xl font-semibold">{formatIdr.format(Number(value))}</p></div>)}</div>
    <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">{t('detail')}</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[[t('due'), due], [t('dpTarget'), formatIdr.format(row.r.dpTarget)], [w('status'), t(balance.status)], [t('payerName'), row.r.payerName || row.p.fullName], [t('payerPhone'), row.r.payerPhone || row.p.phone], [t('roomType'), t(row.r.roomType as 'QUAD')]].map(([label, value]) => <div key={label}><dt className="text-slate-600">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl></section>
    <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">{t('invoices')}</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left"><thead><tr>{[w('invoiceId'), t('amount'), t('paid'), t('dueDate')].map(label => <th key={label} className="border-b p-3">{label}</th>)}</tr></thead><tbody>{valid.map(b => <tr key={b.id}><td className="p-3">{b.invoiceNumber}</td><td className="p-3">{formatIdr.format(b.total)}</td><td className="p-3">{formatIdr.format(b.paidAmount)}</td><td className="p-3">{b.dueDate || '—'}</td></tr>)}</tbody></table></div></section>
    {available > 0 && !cancelled && hasSessionPermission(context.user, 'finance', 'create', org) && <InstallmentInvoiceForm registrationId={id} requestId={randomUUID()} available={available} due={due} />}
    </div>
  </PageShell>;
}
