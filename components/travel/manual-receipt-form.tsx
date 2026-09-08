'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createManualReceipt } from '@/app/actions/manual-receipt';
import { Button } from '@/components/ui/button';
export function ManualReceiptForm({options}:{options:{id:string;label:string}[]}){
  const t=useTranslations('internalUx'),w=useTranslations('workflow'),m=useTranslations('receiptManual');
  const [state,action,pending]=useActionState(createManualReceipt,{ok:false,message:''});
  return <form action={action} className="max-w-3xl space-y-5"><p className="rounded-xl border bg-white p-5">{m('manualHint')}</p><fieldset disabled={pending||state.ok} className="space-y-5">
    <label className="grid gap-2"><span className="font-semibold">{m('choosePayment')}</span><select required name="paymentId" className="min-h-12 rounded-lg border bg-white px-3"><option value="">{w('choose')}</option>{options.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
    <label className="grid gap-2"><span className="font-semibold">{t('notes')}</span><textarea name="notes" maxLength={1000} className="min-h-28 rounded-lg border bg-white p-3"/></label>
    <Button type="submit" disabled={!options.length||pending||state.ok}>{pending?w('saving'):m('openReceipt')}</Button></fieldset>
    {state.message&&<div role={state.ok?'status':'alert'}><p>{state.message}</p>{state.href&&<Link className="inline-flex min-h-12 items-center text-primary underline" href={state.href}>{m('openReceipt')}</Link>}</div>}
  </form>;
}
