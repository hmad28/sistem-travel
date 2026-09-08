import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { and, asc, eq, ilike, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { stockItems } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { InventoryForm } from '@/components/travel/inventory-form';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const t = await getTranslations('inventory');
  const context = await requireOrganizationContext(),
    org = context.organizationId;
  if (!hasSessionPermission(context.user, 'inventory', 'view', org)) return <p>{t('denied')}</p>;
  const params = await searchParams,
    q = (params.q || '').slice(0, 120);
  const status = ['archived', 'low'].includes(params.status || '') ? params.status! : 'active';
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page || '1') || 1));
  const filter = and(
    eq(stockItems.organizationId, org),
    status === 'archived' ? isNotNull(stockItems.archivedAt) : isNull(stockItems.archivedAt),
    status === 'low' ? lte(stockItems.quantity, stockItems.minimum) : undefined,
    q ? ilike(stockItems.name, `%${q}%`) : undefined
  );
  const [items, [summary]] = await Promise.all([
    readDb
      .select()
      .from(stockItems)
      .where(filter)
      .orderBy(asc(stockItems.name), asc(stockItems.id))
      .limit(51)
      .offset((page - 1) * 50),
    readDb
      .select({
        active: sql<number>`count(*) filter (where ${stockItems.archivedAt} is null)::int`,
        low: sql<number>`count(*) filter (where ${stockItems.archivedAt} is null and ${stockItems.quantity} <= ${stockItems.minimum})::int`,
      })
      .from(stockItems)
      .where(eq(stockItems.organizationId, org)),
  ]);
  const canCreate = hasSessionPermission(context.user, 'inventory', 'create', org);
  const href = (p: number) => `?${new URLSearchParams({ q, status, page: String(p) })}`;
  return (
    <PageShell title={t('title')} description={t('description')}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-slate-600">{t('activeItems')}</p>
            <p className="mt-2 text-3xl font-semibold">{summary.active}</p>
          </div>
          <Link href="?status=low" className="rounded-xl border bg-white p-5 hover:border-blue-600">
            <p className="text-slate-600">{t('lowItems')}</p>
            <p className="mt-2 text-3xl font-semibold">{summary.low}</p>
            <p className="mt-2 text-blue-700">{t('lowHelp')}</p>
          </Link>
        </div>
        <form className="flex flex-wrap gap-3" method="get">
          <label className="grid min-w-48 flex-1 gap-2">
            {t('search')}
            <input
              className="min-h-12 rounded-lg border bg-white px-3"
              name="q"
              maxLength={120}
              defaultValue={q}
            />
          </label>
          <label className="grid gap-2">
            {t('show')}
            <select
              className="min-h-12 rounded-lg border bg-white px-3"
              name="status"
              defaultValue={status}
            >
              {['active', 'low', 'archived'].map((s) => (
                <option key={s} value={s}>
                  {t(s as 'active')}
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-12 self-end rounded-lg bg-primary px-5 text-primary-foreground"
            type="submit"
          >
            {t('filter')}
          </button>
        </form>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {['name', 'balance', 'minimum', 'status', 'detail'].map((k) => (
                  <th className="p-4 font-semibold" key={k}>
                    {t(k as 'name')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.slice(0, 50).map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">{item.name}</td>
                  <td className="p-4 tabular-nums">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-4">
                    {item.minimum} {item.unit}
                  </td>
                  <td className="p-4">
                    {t(
                      item.archivedAt
                        ? 'archived'
                        : item.quantity <= item.minimum
                          ? 'low'
                          : 'available'
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline"
                      href={`/admin/manajemen/stok/${item.id}`}
                    >
                      {t('detail')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <p className="p-8 text-center text-slate-600">{t('empty')}</p>}
        </div>
        <nav className="flex items-center justify-between" aria-label={t('pagination')}>
          {page > 1 ? (
            <Link
              className="inline-flex min-h-11 items-center text-blue-700 underline"
              href={href(page - 1)}
            >
              {t('previous')}
            </Link>
          ) : (
            <span />
          )}
          <span>{t('page', { page })}</span>
          {items.length > 50 && (
            <Link
              className="inline-flex min-h-11 items-center text-blue-700 underline"
              href={href(page + 1)}
            >
              {t('next')}
            </Link>
          )}
        </nav>
        {canCreate && (
          <div className="space-y-4">
            <details className="rounded-xl border bg-white p-5">
              <summary className="min-h-11 cursor-pointer text-lg font-semibold">
                {t('create')}
              </summary>
              <div className="pt-5">
                <InventoryForm mode="create" requestId={randomUUID()} />
              </div>
            </details>
            <details className="rounded-xl border bg-white p-5">
              <summary className="min-h-11 cursor-pointer text-lg font-semibold">
                {t('template')}
              </summary>
              <div className="pt-5">
                <InventoryForm mode="template" />
              </div>
            </details>
          </div>
        )}
      </div>
    </PageShell>
  );
}
