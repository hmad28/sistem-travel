import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { invoices, payments, receipts, invoiceItems } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { PrintDocument } from '@/components/travel/print-document';
import { formatIdr,formatIndonesianDate } from '@/lib/travel/format';
import s from '@/components/travel/finance-document.module.css';
export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const ctx=await requireOrganizationContext(),org=ctx.organizationId,t=await getTranslations('internalUx'),w=await getTranslations('workflow');
  const b=await getTranslations('booking');
  if(!hasSessionPermission(ctx.user,'finance','view',org))return <p>{w('denied')}</p>;
  const [bill]=await readDb.select().from(invoices).where(and(eq(invoices.id,id),eq(invoices.organizationId,org)));if(!bill)notFound();
  const [items,paid]=await Promise.all([readDb.select().from(invoiceItems).where(eq(invoiceItems.invoiceId,id)),readDb.select({p:payments,r:receipts}).from(payments).leftJoin(receipts,and(eq(receipts.paymentId,payments.id),eq(receipts.organizationId,org))).where(and(eq(payments.invoiceId,id),eq(payments.organizationId,org))).orderBy(desc(payments.paidAt))]);
  return <PageShell title={bill.invoiceNumber} description={t('invoiceHint')} actions={<PrintDocument/>}>
    <div className="flex flex-wrap gap-4 print:hidden"><Link className="inline-flex min-h-12 items-center underline" href="/travel/pembayaran">{t('backFinance')}</Link>{bill.outstandingAmount>0&&!bill.voidedAt&&!['DRAFT','VOID'].includes(bill.status)&&hasSessionPermission(ctx.user,'finance','create',org)&&<Link className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground" href={`/admin/manajemen/pembayaran/baru?invoice=${id}`}>{t('pay')}</Link>}</div>
    <article data-finance-document className={s.document}><header><div><strong>{ctx.organization.name}</strong><h1>{t('invoice')}</h1></div><p>{bill.invoiceNumber}</p></header><dl><div><dt>{t('name')}</dt><dd>{bill.customerName}</dd></div><div><dt>{b('dueDate')}</dt><dd>{bill.dueDate||'—'}</dd></div></dl>
      <ul className="mt-8 divide-y">{items.map(item=><li key={item.id} className="flex justify-between gap-5 py-4"><span>{item.description} × {item.quantity}</span><strong>{formatIdr.format(item.amount)}</strong></li>)}</ul><div className={s.amount}><p className="text-base">{t('total')}</p><strong>{formatIdr.format(bill.total)}</strong></div><dl><div><dt>{t('paid')}</dt><dd>{formatIdr.format(bill.paidAmount)}</dd></div><div><dt>{t('remaining')}</dt><dd>{formatIdr.format(bill.outstandingAmount)}</dd></div></dl></article>
    <section className="space-y-4 print:hidden"><h2 className="text-xl font-semibold">{t('paymentHistory')}</h2>{paid.length?paid.map(({p,r})=><div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"><span>{formatIndonesianDate.format(p.paidAt)} · {formatIdr.format(p.amount)}</span>{r?<Link className="inline-flex min-h-11 items-center text-primary underline" href={`/admin/manajemen/kwitansi/${r.id}`}>{r.receiptNumber} →</Link>:<span>{p.paymentNumber}</span>}</div>):<p>{t('noPayments')}</p>}</section>
  </PageShell>;
}
