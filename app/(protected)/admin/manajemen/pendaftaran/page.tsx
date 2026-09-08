import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { registrations, pilgrims, departures, travelPackages } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { SimpleRecords } from '@/components/travel/simple-records';
import { formatIdr } from '@/lib/travel/format';
export default async function Page() {
  const context=await requireOrganizationContext(); const t=await getTranslations('workflow');
  if(!hasSessionPermission(context.user,'registration','view',context.organizationId)) return <p>{t('denied')}</p>;
  const rows=await readDb.select({r:registrations,p:pilgrims,d:departures,pkg:travelPackages}).from(registrations).innerJoin(pilgrims,and(eq(pilgrims.id,registrations.pilgrimId),eq(pilgrims.organizationId,context.organizationId))).innerJoin(departures,and(eq(departures.id,registrations.departureId),eq(departures.organizationId,context.organizationId))).innerJoin(travelPackages,and(eq(travelPackages.id,departures.packageId),eq(travelPackages.organizationId,context.organizationId))).where(eq(registrations.organizationId,context.organizationId)).orderBy(desc(registrations.createdAt)).limit(100);
  return <PageShell title={t('registrationsTitle')} description={t('flow')} actions={<Link href="/admin/manajemen/pendaftaran/baru" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground">{t('register')}</Link>}><SimpleRecords title={t('registrationsTitle')} detailLinks={Object.fromEntries(rows.map(({r})=>[r.registrationNumber,`/admin/manajemen/pendaftaran/${r.id}`]))} headers={[t('registrationNumber'),t('pilgrimId'),t('packageId'),t('departureDate'),t('startingPrice')]} rows={rows.map(({r,p,d,pkg})=>[r.registrationNumber,p.fullName,pkg.name,d.departureDate,formatIdr.format(r.finalPrice)])} /></PageShell>;
}
