import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { departures, travelPackages } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';
import { occupiedSeats } from '@/lib/travel/seat-capacity';
export default async function Page() {
  const context = await requireOrganizationContext();
  const t = await getTranslations('workflow');
  const common = await getTranslations('travelSimple');
  if (!hasSessionPermission(context.user, 'departure', 'view', context.organizationId))
    return <p>{t('denied')}</p>;
  const records = await readDb
    .select({ departure: departures, package: travelPackages })
    .from(departures)
    .innerJoin(
      travelPackages,
      and(
        eq(departures.packageId, travelPackages.id),
        eq(travelPackages.organizationId, context.organizationId)
      )
    )
    .where(eq(departures.organizationId, context.organizationId))
    .orderBy(desc(departures.departureDate))
    .limit(100);
  const canEdit = hasSessionPermission(context.user, 'departure', 'edit', context.organizationId);
  return (
    <PageShell
      title={t('departuresTitle')}
      description={t('departureHelp')}
      actions={
        hasSessionPermission(context.user, 'departure', 'create', context.organizationId) && (
          <Link
            className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground"
            href="/admin/manajemen/keberangkatan/baru"
          >
            {t('addDeparture')}
          </Link>
        )
      }
    >
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50">
            <tr>
              {['packageId', 'departureDate', 'returnDate', 'quota', 'editDeparture'].map((key) => (
                <th key={key} className="p-4 font-semibold">
                  {t(key as 'packageId')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map(({ departure: d, package: p }) => (
              <tr key={d.id}>
                <td className="p-4">
                  <strong>{p.name}</strong>
                  <small className="mt-1 block text-slate-500">{d.code}</small>
                </td>
                <td className="p-4">
                  {formatIndonesianDate.format(parseDatabaseDate(d.departureDate))}
                </td>
                <td className="p-4">
                  {formatIndonesianDate.format(parseDatabaseDate(d.returnDate))}
                </td>
                <td className="p-4 tabular-nums">
                  {occupiedSeats(d.reservedSeats, d.confirmedSeats)} / {d.quota}
                </td>
                <td className="p-4">
                  {canEdit && (
                    <Link
                      className="inline-flex min-h-11 items-center font-semibold text-primary underline"
                      href={`/admin/manajemen/keberangkatan/${d.id}`}
                    >
                      {t('editDeparture')}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {common('empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground">{t('departureLimit')}</p>
    </PageShell>
  );
}
