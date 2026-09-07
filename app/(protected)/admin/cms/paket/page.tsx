import { eq, asc } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { travelPackages } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { formatIdr } from '@/lib/travel/format';
import Link from 'next/link';

export default async function CmsPackages() {
  const context = await requireOrganizationContext();
  const t = await getTranslations('cmsPackages');
  const w = await getTranslations('workflow');
  if (!hasSessionPermission(context.user, 'cms', 'view', context.organizationId))
    return <p>{t('denied')}</p>;
  const packages = await readDb
    .select()
    .from(travelPackages)
    .where(eq(travelPackages.organizationId, context.organizationId))
    .orderBy(asc(travelPackages.displayOrder));
  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={<Link href="/admin/cms/paket/baru" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground">{w('addPackage')}</Link>}
    >
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              {[t('name'), t('duration'), t('price'), t('publication')].map((x) => (
                <th className="px-6 py-4" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-6 py-6 font-semibold"><Link className="text-primary underline" href={`/admin/cms/paket/${p.id}`}>{p.name}</Link></td>
                <td className="px-6">{t('days', { count: p.durationDays })}</td>
                <td className="px-6">{formatIdr.format(p.startingPrice)}</td>
                <td className="px-6">
                  <span
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${p.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t(p.isPublished ? 'published' : 'draft')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
