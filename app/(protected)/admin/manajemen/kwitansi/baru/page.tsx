import { and,desc,eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { payments,invoices } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { ManualReceiptForm } from '@/components/travel/manual-receipt-form';
import { formatIdr,formatIndonesianDate } from '@/lib/travel/format';
export default async function Page(){
  const ctx=await requireOrganizationContext(),org=ctx.organizationId,t=await getTranslations('internalUx'),w=await getTranslations('workflow');
  if(!hasSessionPermission(ctx.user,'finance','create',org)||!hasSessionPermission(ctx.user,'finance','view',org))return <p>{w('denied')}</p>;
  const rows=await readDb.select({p:payments,i:invoices}).from(payments).innerJoin(invoices,and(eq(invoices.id,payments.invoiceId),eq(invoices.organizationId,org))).where(and(eq(payments.organizationId,org),eq(payments.status,'VERIFIED'))).orderBy(desc(payments.paidAt)).limit(200);
  return <PageShell title={t('manual')}><ManualReceiptForm options={rows.map(({p,i})=>({id:p.id,label:`${i.customerName} · ${i.invoiceNumber} · ${formatIdr.format(p.amount)} · ${formatIndonesianDate.format(p.paidAt)}`}))}/></PageShell>;
}
