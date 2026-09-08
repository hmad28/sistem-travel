'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { saveInventory, type InventoryAction } from '@/app/actions/inventory';

type Item = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minimum: number;
  revision: number;
};
export function InventoryForm({
  mode,
  item,
  requestId,
  today,
}: {
  mode: InventoryAction;
  item?: Item;
  requestId?: string;
  today?: string;
}) {
  const t = useTranslations('inventory');
  const [state, action, pending] = useActionState(saveInventory.bind(null, mode), {
    ok: false,
    message: '',
  });
  const [kind, setKind] = useState('IN');
  const [amount, setAmount] = useState('');
  const [confirm, setConfirm] = useState(false);
  const balance = item?.quantity ?? 0;
  const after =
    kind === 'ADJUST'
      ? Number(amount)
      : kind === 'IN'
        ? balance + Number(amount)
        : balance - Number(amount);
  const movement = mode === 'movement';
  const control =
    'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-2 focus:outline-blue-600';
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={item?.id ?? requestId ?? ''} />
      <input type="hidden" name="revision" value={item?.revision ?? 0} />
      <input type="hidden" name="itemId" value={item?.id ?? ''} />
      <input type="hidden" name="requestId" value={requestId ?? ''} />
      {state.message && (
        <div role={state.ok ? 'status' : 'alert'} className="rounded-lg border p-4">
          {state.message}
          {state.href && (
            <Link
              className="mt-2 flex min-h-11 items-center font-semibold text-blue-700 underline"
              href={state.href}
            >
              {t('viewRecord')}
            </Link>
          )}
        </div>
      )}
      <fieldset disabled={pending || state.ok} className="grid gap-5 sm:grid-cols-2">
        {mode === 'create' || mode === 'edit' ? (
          <>
            <label className="grid gap-2 sm:col-span-2">
              {t('name')}
              <input
                name="name"
                className={control}
                defaultValue={item?.name}
                minLength={2}
                maxLength={120}
                required
              />
            </label>
            <label className="grid gap-2">
              {t('unit')}
              <input
                name="unit"
                className={control}
                defaultValue={item?.unit ?? t('defaultUnit')}
                maxLength={24}
                required
              />
            </label>
            <label className="grid gap-2">
              {t('minimum')}
              <input
                type="number"
                name="minimum"
                className={control}
                min={0}
                max={1000000}
                step={1}
                defaultValue={item?.minimum ?? 0}
                required
              />
            </label>
            <p className="sm:col-span-2 leading-7 text-slate-600">{t('itemHelp')}</p>
          </>
        ) : movement ? (
          <>
            <label className="grid gap-2">
              {t('kind')}
              <select
                name="kind"
                className={control}
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setAmount('');
                  setConfirm(false);
                }}
              >
                {['IN', 'OUT', 'ADJUST'].map((k) => (
                  <option key={k} value={k}>
                    {t(k as 'IN')}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              {t(kind === 'ADJUST' ? 'actualCount' : 'quantity')}
              <input
                type="number"
                name="quantity"
                className={control}
                min={kind === 'ADJUST' ? 0 : 1}
                max={kind === 'OUT' ? balance : 1000000}
                step={1}
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setConfirm(false);
                }}
              />
            </label>
            <label className="grid gap-2">
              {t('date')}
              <input
                type="date"
                name="movedDate"
                className={control}
                required
                defaultValue={today}
                max={today}
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              {t('note')}
              <textarea
                name="note"
                className={`${control} min-h-24 py-3`}
                minLength={3}
                maxLength={1000}
                required
                placeholder={t('noteHint')}
              />
            </label>
            <div className="rounded-lg bg-blue-50 p-4 text-blue-950 sm:col-span-2">
              <p>{t(kind === 'ADJUST' ? 'adjustHelp' : 'movementHelp')}</p>
              <p className="mt-3 text-lg font-semibold">
                {t('balancePreview', {
                  before: balance,
                  after: amount ? after : balance,
                  unit: item?.unit ?? '',
                })}
              </p>
            </div>
            <label className="flex min-h-12 items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                className="size-5"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                required
              />
              {t('confirmMovement')}
            </label>
          </>
        ) : (
          <p className="sm:col-span-2 leading-7 text-slate-600">
            {t(
              mode === 'archive'
                ? 'archiveHelp'
                : mode === 'restore'
                  ? 'restoreHelp'
                  : 'templateHelp'
            )}
          </p>
        )}
      </fieldset>
      {!state.ok && (
        <Button
          type="submit"
          variant={mode === 'archive' ? 'outline' : 'default'}
          disabled={pending || (movement && (!confirm || !amount || after < 0 || after > 1000000))}
        >
          {pending && <LoaderCircle className="animate-spin" />}
          {t(pending ? 'saving' : mode)}
        </Button>
      )}
    </form>
  );
}
