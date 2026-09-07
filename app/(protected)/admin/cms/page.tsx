import Image from 'next/image';
import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, PackageOpen, Palette, FileText, Globe2 } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { readDb } from '@/db/read';
import { travelPackages } from '@/db/schema';
import { loadAppBranding } from '@/lib/branding/server';
import { TrafficDashboard } from '@/components/travel/traffic-dashboard';

export default async function CmsDashboardPage() {
  const context = await requireOrganizationContext();
  const t = await getTranslations('cmsWorkspace');
  if (!hasSessionPermission(context.user, 'cms', 'view', context.organizationId))
    return <p>{t('denied')}</p>;
  const [packages, branding] = await Promise.all([
    readDb
      .select({ name: travelPackages.name, published: travelPackages.isPublished })
      .from(travelPackages)
      .where(eq(travelPackages.organizationId, context.organizationId)),
    loadAppBranding(),
  ]);
  const published = packages.filter((p) => p.published).length;
  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <Link
          href="/"
          target="_blank"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg border bg-white px-4 font-semibold"
        >
          {t('preview')}
          <ArrowUpRight className="size-4" />
        </Link>
      }
    >
      <TrafficDashboard organizationId={context.organizationId} />
      <section className="cms-summary-grid">
        {[
          [t('total'), packages.length, PackageOpen],
          [t('published'), published, Globe2],
          [t('draft'), packages.length - published, FileText],
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Globe2;
          return (
            <article key={label as string}>
              <span>
                <I />
              </span>
              <div>
                <p>{label as string}</p>
                <strong>{value as number}</strong>
              </div>
            </article>
          );
        })}
      </section>
      <section className="grid items-start gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border bg-white">
          <header className="border-b p-6">
            <h2 className="text-xl font-bold">{t('manage')}</h2>
            <p className="mt-2 text-base text-muted-foreground">{t('manageDescription')}</p>
          </header>
          <div className="divide-y">
            {[
              [PackageOpen, t('packages'), t('packageDescription'), '/admin/cms/paket'],
              [Palette, t('identity'), t('identityDescription'), '/admin/cms/pengaturan'],
            ].map(([Icon, title, description, href]) => {
              const I = Icon as typeof Globe2;
              return (
                <Link
                  href={href as string}
                  key={title as string}
                  className="group flex items-center gap-4 p-6 hover:bg-slate-50"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf2f9] text-[#195acb]">
                    <I className="size-5" />
                  </span>
                  <div className="flex-1">
                    <strong className="text-base">{title as string}</strong>
                    <p className="mt-1 text-base leading-6 text-muted-foreground">
                      {description as string}
                    </p>
                  </div>
                  <ArrowUpRight className="size-5 text-slate-400" />
                </Link>
              );
            })}
          </div>
          <div className="m-6 rounded-lg bg-slate-50 p-4 text-base leading-7 text-slate-600">
            {t('note')}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="flex items-center gap-1.5 border-b bg-slate-50 px-5 py-3">
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="ml-3 text-xs text-slate-500">{branding.name}</span>
          </div>
          <div className="relative h-64 bg-[#142b59]">
            <Image
              src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&q=85"
              fill
              sizes="450px"
              alt=""
              className="object-cover opacity-55"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
              <small className="mb-3 font-semibold text-amber-200">{branding.name}</small>
              <h3 className="max-w-xs text-3xl font-bold leading-tight">{t('previewTitle')}</h3>
            </div>
          </div>
          <div className="p-5">
            <h2 className="font-bold">{t('connected')}</h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              {t('connectedDescription')}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
