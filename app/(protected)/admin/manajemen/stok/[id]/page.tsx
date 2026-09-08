import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { stockItems, stockMovements } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { InventoryForm } from '@/components/travel/inventory-form';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const t = await getTranslations('inventory');
  const context = await requireOrganizationContext(),
    org = context.organizationId;
  if (!hasSessionPermission(context.user, 'inventory', 'view', org)) return <p>{t('denied')}</p>;
  const query = await searchParams,
    page = Math.min(10000, Math.max(1, Number.parseInt(query.page || '1') || 1));
  const [[item], movements] = await Promise.all([
    readDb
      .select()
      .from(stockItems)
      .where(and(eq(stockItems.id, id), eq(stockItems.organizationId, org))),
    readDb
      .select()
      .from(stockMovements)
      .where(and(eq(stockMovements.itemId, id), eq(stockMovements.organizationId, org)))
      .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
      .limit(51)
      .offset((page - 1) * 50),
  ]);
  if (!item) notFound();
  const props = {
    id: item.id,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    minimum: item.minimum,
    revision: item.revision,
  };
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    <PageShell
      title={item.name}
      description={t('description')}
      actions={
        <Link
          className="inline-flex min-h-12 items-center text-blue-700 underline"
          href="/admin/manajemen/stok"
        >
          {t('back')}
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border bg-white p-6">
          <p className="text-slate-600">{t('balance')}</p>
          <p className="mt-2 text-3xl font-semibold">
            {item.quantity} {item.unit}
          </p>
          <p className="mt-3">
            {t('minimum')}: {item.minimum} {item.unit} ·{' '}
            {t(item.archivedAt ? 'archived' : item.quantity <= item.minimum ? 'low' : 'available')}
          </p>
        </section>
        {!item.archivedAt && hasSessionPermission(context.user, 'inventory', 'create', org) && (
          <section className="rounded-xl border bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">{t('movement')}</h2>
            <InventoryForm
              key={`movement-${item.revision}`}
              mode="movement"
              item={props}
              requestId={randomUUID()}
              today={today}
            />
          </section>
        )}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">{t('history')}</h2>
          <p className="mt-2 text-slate-600">{t('historyHelp')}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr>
                  {['date', 'kind', 'change', 'before', 'after', 'note'].map((k) => (
                    <th className="border-b p-3" key={k}>
                      {t(k as 'date')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.slice(0, 50).map((m) => (
                  <tr key={m.id}>
                    <td className="p-3">{m.movedDate}</td>
                    <td className="p-3">{t(m.kind as 'IN')}</td>
                    <td className="p-3">
                      {m.quantity > 0 ? '+' : ''}
                      {m.quantity}
                    </td>
                    <td className="p-3">{m.balanceBefore}</td>
                    <td className="p-3 font-semibold">{m.balanceAfter}</td>
                    <td className="max-w-xs whitespace-pre-wrap break-words p-3">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!movements.length && <p className="mt-4 text-slate-600">{t('noHistory')}</p>}
          <nav className="mt-4 flex justify-between" aria-label={t('pagination')}>
            {page > 1 ? (
              <Link
                className="inline-flex min-h-11 items-center text-blue-700"
                href={`?page=${page - 1}`}
              >
                {t('previous')}
              </Link>
            ) : (
              <span />
            )}
            {movements.length > 50 && (
              <Link
                className="inline-flex min-h-11 items-center text-blue-700"
                href={`?page=${page + 1}`}
              >
                {t('next')}
              </Link>
            )}
          </nav>
        </section>
        {hasSessionPermission(context.user, 'inventory', 'edit', org) && (
          <>
            {!item.archivedAt && (
              <details className="rounded-xl border bg-white p-6">
                <summary className="min-h-11 cursor-pointer text-lg font-semibold">
                  {t('edit')}
                </summary>
                <div className="pt-5">
                  <InventoryForm key={`edit-${item.revision}`} mode="edit" item={props} />
                </div>
              </details>
            )}
            <details className="rounded-xl border bg-white p-6">
              <summary className="min-h-11 cursor-pointer text-lg font-semibold">
                {t(item.archivedAt ? 'restore' : 'archive')}
              </summary>
              <div className="pt-5">
                <InventoryForm
                  key={`archive-${item.revision}`}
                  mode={item.archivedAt ? 'restore' : 'archive'}
                  item={props}
                />
              </div>
            </details>
          </>
        )}
      </div>
    </PageShell>
  );
}
