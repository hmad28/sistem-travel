'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LoaderCircle } from 'lucide-react';
import { issueInstallmentInvoice } from '@/app/actions/travel-workflow';
import { Button } from '@/components/ui/button';
import { formatIdr } from '@/lib/travel/format';
export function InstallmentInvoiceForm({ registrationId, requestId, available, due }: { registrationId: string; requestId: string; available: number; due: string }) {
  const t = useTranslations('booking');
  const [state, action, pending] = useActionState(issueInstallmentInvoice, { ok: false, message: '' });
  return <form action={action} className="space-y-5 rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">{t('issue')}</h2><p className="leading-7 text-slate-600">{t('issueHelp')}</p><p>{t('unbilled')}: <strong>{formatIdr.format(available)}</strong></p>
    <input type="hidden" name="requestId" value={requestId} /><input type="hidden" name="registrationId" value={registrationId} />
    <fieldset disabled={pending || state.ok} className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2">{t('amount')}<input className="min-h-12 rounded-lg border px-3" type="number" name="amount" min={1} max={available} step={1} defaultValue={available} required /></label><label className="grid gap-2">{t('dueDate')}<input className="min-h-12 rounded-lg border px-3" name="dueDate" type="date" defaultValue={due} max={due} required /></label></fieldset>
    {state.message && <p role={state.ok ? 'status' : 'alert'}>{state.message}</p>}
    {state.ok ? <Link className="inline-flex min-h-12 items-center text-blue-700 underline" href="/admin/manajemen/pembayaran/baru">{t('pay')}</Link> : <Button disabled={pending || available <= 0} type="submit">{pending && <LoaderCircle className="animate-spin" />}{t('issue')}</Button>}
  </form>;
}
