import { and, desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { receipts, payments, invoices } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { SimpleRecords } from '@/components/travel/simple-records';
import { formatIdr, formatIndonesianDate } from '@/lib/travel/format';
export default async function Page() {
  const context=await requireOrganizationContext(); const t=await getTranslations('workflow');
  const u=await getTranslations('internalUx');
  if(!hasSessionPermission(context.user,'finance','view',context.organizationId)) return <p>{t('denied')}</p>;
  const rows=await readDb.select({r:receipts,p:payments,i:invoices}).from(receipts).innerJoin(payments,and(eq(payments.id,receipts.paymentId),eq(payments.organizationId,context.organizationId))).innerJoin(invoices,and(eq(invoices.id,payments.invoiceId),eq(invoices.organizationId,context.organizationId))).where(eq(receipts.organizationId,context.organizationId)).orderBy(desc(receipts.issuedAt)).limit(100);
  return <PageShell title={t('receiptsTitle')} description={u('receiptHint')}><div className="flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground" href="/travel/pembayaran">{u('fromInvoice')}</Link>{hasSessionPermission(context.user,'finance','create',context.organizationId)&&<Link className="inline-flex min-h-12 items-center rounded-lg border bg-white px-5 font-semibold text-primary" href="/admin/manajemen/kwitansi/baru">{u('manual')}</Link>}</div><SimpleRecords title={t('receiptsTitle')} headers={[t('receiptNumber'),t('pilgrimId'),t('invoiceId'),t('paidDate'),t('amount')]} rows={rows.map(({r,p,i})=>[r.receiptNumber,i.customerName,i.invoiceNumber,formatIndonesianDate.format(p.paidAt),formatIdr.format(p.amount)])} detailLinks={Object.fromEntries(rows.map(({r})=>[r.receiptNumber,`/admin/manajemen/kwitansi/${r.id}`]))} /></PageShell>;
}
