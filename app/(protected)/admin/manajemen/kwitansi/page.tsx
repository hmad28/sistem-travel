import { and, desc, eq } from 'drizzle-orm';
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
  if(!hasSessionPermission(context.user,'finance','view',context.organizationId)) return <p>{t('denied')}</p>;
  const rows=await readDb.select({r:receipts,p:payments,i:invoices}).from(receipts).innerJoin(payments,and(eq(payments.id,receipts.paymentId),eq(payments.organizationId,context.organizationId))).innerJoin(invoices,and(eq(invoices.id,payments.invoiceId),eq(invoices.organizationId,context.organizationId))).where(eq(receipts.organizationId,context.organizationId)).orderBy(desc(receipts.issuedAt)).limit(100);
  return <PageShell title={t('receiptsTitle')} description={t('receiptsHelp')}><SimpleRecords title={t('receiptsTitle')} headers={[t('receiptNumber'),t('pilgrimId'),t('invoiceId'),t('paidDate'),t('amount')]} rows={rows.map(({r,p,i})=>[r.receiptNumber,i.customerName,i.invoiceNumber,formatIndonesianDate.format(p.paidAt),formatIdr.format(p.amount)])} /></PageShell>;
}
