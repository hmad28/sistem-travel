import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { getDepartureRows, getInvoiceRows, getPilgrimRows } from '@/lib/travel/module-data';
import { SimpleRecords } from '@/components/travel/simple-records';
import { hasSessionPermission } from '@/lib/auth/permissions';

export default async function TravelModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (module === 'keberangkatan') redirect('/admin/manajemen/keberangkatan');
  if (module === 'website') redirect('/admin');
  if (module === 'laporan') redirect('/travel/pembayaran');
  if (!['jamaah', 'keberangkatan', 'pembayaran', 'operasional'].includes(module)) notFound();
  const { organizationId, organization, user } = await requireOrganizationContext();
  const t = await getTranslations('travelSimple');
  const w = await getTranslations('workflow');
  const resource = module === 'pembayaran' ? 'finance' : module === 'keberangkatan' ? 'departure' : 'pilgrim';
  if (!hasSessionPermission(user, resource, 'view', organizationId)) return <p>{t('denied')}</p>;
  const pilgrims =
    module === 'jamaah' || module === 'operasional' ? await getPilgrimRows(organizationId) : [];
  const rows =
    module === 'keberangkatan'
      ? await getDepartureRows(organizationId)
      : module === 'pembayaran'
        ? await getInvoiceRows(organizationId)
        : pilgrims;
  const headers =
    module === 'keberangkatan'
      ? ['package', 'date', 'capacity', 'price', 'status']
      : module === 'pembayaran'
        ? ['invoice', 'pilgrim', 'total', 'paid', 'status']
        : ['pilgrim', 'number', 'phone', 'documents', 'package'];
  return (
    <PageShell
      title={t(module)}
      description={t(`${module}Hint`)}
      actions={
        module === 'jamaah' ? (
          <Link
            href="/travel/jamaah/baru"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"
          >
            <Plus className="size-5" />
            {t('addPilgrim')}
          </Link>
        ) : module !== 'operasional' ? <Link href={`/admin/manajemen/${module}/baru`} className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground">{w(module === 'keberangkatan' ? 'addDeparture' : 'addPayment')}</Link> : undefined
      }
    >
      {module === 'jamaah' && <Link href="/admin/manajemen/pendaftaran/baru" className="inline-flex min-h-12 items-center rounded-lg border bg-white px-5 font-semibold text-primary">{w('register')}</Link>}
      {organization.slug === 'hammad-tour' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          {t('demo')}
        </p>
      )}
      <SimpleRecords title={t(module)} headers={headers.map((key) => t(key))} rows={rows} />
      <p className="text-sm text-muted-foreground">{t('limit')}</p>
    </PageShell>
  );
}
