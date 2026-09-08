import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { receipts, payments, invoices } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { PrintDocument } from '@/components/travel/print-document';
import { formatIdr, formatIndonesianDate } from '@/lib/travel/format';
import s from '@/components/travel/finance-document.module.css';
export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const ctx=await requireOrganizationContext(),org=ctx.organizationId,t=await getTranslations('internalUx'),w=await getTranslations('workflow');
  if(!hasSessionPermission(ctx.user,'finance','view',org))return <p>{w('denied')}</p>;
  const [row]=await readDb.select({r:receipts,p:payments,i:invoices}).from(receipts).innerJoin(payments,and(eq(payments.id,receipts.paymentId),eq(payments.organizationId,org))).innerJoin(invoices,and(eq(invoices.id,payments.invoiceId),eq(invoices.organizationId,org))).where(and(eq(receipts.id,id),eq(receipts.organizationId,org)));
  if(!row)notFound();
  const snap=row.r.snapshot,customer=typeof snap.customerName==='string'?snap.customerName:row.i.customerName;
  return <PageShell title={t('receipt')} actions={<PrintDocument/>}><Link className="inline-flex min-h-11 items-center underline print:hidden" href="/admin/manajemen/kwitansi">{t('backReceipts')}</Link>
    <article data-finance-document className={s.document}><header><div><strong>{ctx.organization.name}</strong><h1>{t('receipt')}</h1></div><p>{row.r.receiptNumber}</p></header>
      <dl>{[[t('received'),customer],[t('date'),typeof snap.paidDate==='string'?snap.paidDate:formatIndonesianDate.format(row.p.paidAt)],[t('invoice'),typeof snap.invoiceNumber==='string'?snap.invoiceNumber:row.i.invoiceNumber],[t('method'),row.p.method==='CASH'?t('cash'):row.p.method==='TRANSFER'?t('transfer'):row.p.method]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className={s.amount}><p className="text-base">{t('amount')}</p><strong>{formatIdr.format(typeof snap.amount==='number'?snap.amount:row.p.amount)}</strong></div>
      {typeof snap.notes==='string'&&<p>{snap.notes}</p>}
    </article><Link className="inline-flex min-h-11 items-center underline print:hidden" href={`/admin/manajemen/invoice/${row.i.id}`}>{t('viewInvoice')}</Link>
  </PageShell>;
}
