import { getTranslations } from 'next-intl/server';
import { ArrowRight, CalendarDays, FileCheck2, UsersRound, WalletCards, Plus, PackageOpen } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { getDashboardData } from '@/lib/travel/dashboard-data';
import { formatIdr, formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';
import { hasSessionPermission } from '@/lib/auth/permissions';

export default async function DashboardPage() {
  const { organizationId, organization, user } = await requireOrganizationContext();
  const t = await getTranslations('travelSimple');
  const inventory = await getTranslations('inventory');
  if (!hasSessionPermission(user, 'report', 'view', organizationId)) return <p>{t('denied')}</p>;
  const data = await getDashboardData(organizationId);
  const tasks = [
    ...(hasSessionPermission(user, 'inventory', 'view', organizationId) ? [{
      title: inventory('lowItems'), hint: inventory('lowHelp'), value: String(data.lowStockItems),
      detail: null, href: '/admin/manajemen/stok?status=low', icon: PackageOpen,
    }] : []),
    {
      title: t('dueTitle'),
      hint: t('dueHint'),
      value: t('countInvoices', { count: data.finance.unpaidPilgrims }),
      detail: formatIdr.format(data.finance.outstanding),
      href: '/travel/pembayaran',
      icon: WalletCards,
    },
    {
      title: t('docsTitle'),
      hint: t('docsHint'),
      value: t('countRecords', { count: data.documents.incomplete }),
      detail: null,
      href: '/travel/operasional',
      icon: FileCheck2,
    },
  ];
  return (
    <PageShell
      title={t('overview')}
      description={t('overviewHint')}
      actions={
        <Link
          href="/travel/jamaah/baru"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Plus className="size-5" />
          {t('addPilgrim')}
        </Link>
      }
    >
      {organization.slug === 'hammad-tour' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          {t('demo')}
        </p>
      )}
      <section className="grid gap-5 md:grid-cols-2">
        {tasks.map((task) => (
          <Link
            href={task.href}
            key={task.href}
            className="rounded-xl border bg-white p-6 transition hover:border-primary hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <task.icon className="size-6 text-primary" />
              <h2 className="text-xl font-semibold">{task.title}</h2>
            </div>
            <strong className="mt-5 block text-3xl tabular-nums">{task.value}</strong>
            {task.detail && <p className="mt-2 text-xl tabular-nums">{task.detail}</p>}
            <p className="mt-3 text-muted-foreground">{task.hint}</p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">
              {t('view')}
              <ArrowRight className="size-5" />
            </span>
          </Link>
        ))}
      </section>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold">
          <CalendarDays className="size-6 text-primary" />
          {t('nextDeparture')}
        </h2>
        {data.nearestDeparture ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
            <div>
              <strong className="text-lg">{data.nearestDeparture.packageName}</strong>
              <p className="mt-2 text-muted-foreground">
                {formatIndonesianDate.format(
                  parseDatabaseDate(data.nearestDeparture.departureDate)
                )}
              </p>
            </div>
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border px-5 font-semibold"
              href="/travel/keberangkatan"
            >
              {t('view')}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">{t('noDeparture')}</p>
        )}
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">{t('quick')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [UsersRound, 'jamaah'],
            [CalendarDays, 'keberangkatan'],
            [WalletCards, 'pembayaran'],
          ].map(([Icon, key]) => {
            const TaskIcon = Icon as typeof UsersRound;
            return (
              <Link
                href={`/travel/${key}`}
                key={key as string}
                className="flex min-h-20 items-center gap-3 rounded-lg border bg-white p-5 font-semibold hover:bg-accent"
              >
                <TaskIcon className="size-5 text-primary" />
                {t(key as string)}
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
