'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { saveTravelWorkflow } from '@/app/actions/travel-workflow';
import { Button } from '@/components/ui/button';
import { DEFAULT_DP, settlementDate } from '@/lib/travel/booking-finance';
import { formatIdr } from '@/lib/travel/format';

export type RegistrationOptions = {
  requestId: string;
  people: { id: string; fullName: string; phone: string }[];
  schedules: { id: string; name: string; date: string; price: number }[];
};

export function RegistrationWizard({ requestId, people, schedules }: RegistrationOptions) {
  const t = useTranslations('booking');
  const w = useTranslations('workflow');
  const [state, action, pending] = useActionState(saveTravelWorkflow.bind(null, 'registration'), { ok: false, message: '' });
  const form = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [personId, setPersonId] = useState('');
  const [departureId, setDepartureId] = useState('');
  const [base, setBase] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [extra, setExtra] = useState(0);
  const [dp, setDp] = useState(DEFAULT_DP);
  const [invoice, setInvoice] = useState(DEFAULT_DP);
  const [payer, setPayer] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('QUAD');
  const [confirmed, setConfirmed] = useState(false);
  const person = people.find(p => p.id === personId);
  const schedule = schedules.find(s => s.id === departureId);
  const total = base - discount + extra;
  const validMoney = base > 0 && discount <= base && total > 0 && dp > 0 && dp <= total && invoice > 0 && invoice <= total;
  const due = schedule ? settlementDate(schedule.date) : '';
  const control = 'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-2 focus:outline-blue-600';
  function advance() {
    const fields = form.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`fieldset[data-step="${step}"] input, fieldset[data-step="${step}"] select`);
    for (const field of fields ?? []) if (!field.reportValidity()) return;
    if (step === 1 && !validMoney) return;
    setStep(s => s + 1);
  }
  const amount = (name: string, value: number, update: (value: number) => void, min = 0, max?: number) =>
    <label className="grid gap-2"><span className="font-semibold">{t(name as 'basePrice')}</span><input className={control} name={name} type="number" inputMode="numeric" min={min} max={max} step="1" required value={value} onChange={e => update(Number(e.target.value))} /><span className="text-sm text-slate-600">{formatIdr.format(value)}</span></label>;
  return <form ref={form} action={action} noValidate onSubmit={e => { if (step !== 3 || !confirmed) { e.preventDefault(); if (step < 3) advance(); } }} className="max-w-5xl space-y-6">
    <input type="hidden" name="requestId" value={requestId} />
    <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">{['select', 'pricing', 'payer', 'review'].map((name, i) => <li key={name} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-3 rounded-lg border p-3 ${i === step ? 'border-blue-600 bg-blue-50 text-blue-900' : 'bg-white text-slate-600'}`}><span className="grid size-8 shrink-0 place-items-center rounded-full border">{i < step ? <Check size={18} /> : i + 1}</span>{t(name as 'select')}</li>)}</ol>
    {state.message && <div role={state.ok ? 'status' : 'alert'} className="rounded-lg border p-5">{state.message}{state.ok && state.href && <Link href={state.href} className="mt-3 flex min-h-12 items-center font-semibold text-blue-700 underline">{t('openBooking')}</Link>}{state.errors?.map(key => <p key={key}>{w(key as 'name')}: {w('checkField')}</p>)}</div>}
    <div className="rounded-xl border bg-white p-5 sm:p-8">
      <fieldset data-step="0" hidden={step !== 0} disabled={pending || state.ok} className="space-y-5">
        <legend className="mb-5 text-xl font-semibold">{t('select')}</legend>
        <label className="grid gap-2"><span>{w('departureId')}</span><select className={control} name="departureId" required value={departureId} onChange={e => { setDepartureId(e.target.value); const s = schedules.find(s => s.id === e.target.value); setBase(s?.price ?? 0); }}><option value="">{w('choose')}</option>{schedules.map(s => <option value={s.id} key={s.id}>{s.name} · {s.date}</option>)}</select></label>
        <label className="grid gap-2"><span>{w('pilgrimId')}</span><select className={control} name="pilgrimId" required value={personId} onChange={e => setPersonId(e.target.value)}><option value="">{w('choose')}</option>{people.map(p => <option value={p.id} key={p.id}>{p.fullName} · {p.phone}</option>)}</select></label>
        <Link href="/travel/jamaah/baru" className="inline-flex min-h-12 items-center text-blue-700 underline">{t('addPilgrim')}</Link>
        <label className="grid gap-2"><span>{t('roomType')}</span><select className={control} name="roomType" value={room} onChange={e => setRoom(e.target.value)}>{['QUAD', 'TRIPLE', 'DOUBLE'].map(r => <option key={r} value={r}>{t(r as 'QUAD')}</option>)}</select></label>
      </fieldset>
      <fieldset data-step="1" hidden={step !== 1} disabled={pending || state.ok}>
        <legend className="mb-5 text-xl font-semibold">{t('pricing')}</legend>
        <p className="mb-6 leading-7 text-slate-600">{t('priceHelp')}</p>
        <div className="grid gap-5 sm:grid-cols-2">{amount('basePrice', base, setBase, 1)}{amount('discount', discount, setDiscount, 0, base)}{amount('additionalFee', extra, setExtra)}{amount('dpTarget', dp, setDp, 1, Math.max(1, total))}{amount('initialInvoiceAmount', invoice, setInvoice, 1, Math.max(1, total))}</div>
        {!validMoney && <p role="alert" className="mt-5 text-red-700">{t('priceInvalid')}</p>}
        <p className="mt-5 border-t pt-5 text-lg font-semibold">{t('total')}: {formatIdr.format(Math.max(0, total))}</p>
        <p className="mt-2">{t('due')}: {due}</p>
      </fieldset>
      <fieldset data-step="2" hidden={step !== 2} disabled={pending || state.ok} className="space-y-5">
        <legend className="mb-5 text-xl font-semibold">{t('payer')}</legend>
        <Button variant="outline" type="button" onClick={() => { setPayer(person?.fullName ?? ''); setPhone(person?.phone ?? ''); }}>{t('copyPayer')}</Button>
        <label className="grid gap-2"><span>{t('payerName')}</span><input className={control} name="payerName" minLength={2} maxLength={160} required value={payer} onChange={e => setPayer(e.target.value)} /></label>
        <label className="grid gap-2"><span>{t('payerPhone')}</span><input className={control} name="payerPhone" type="tel" pattern="[+0-9\s\-]{8,20}" required value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label className="grid gap-2"><span>{w('notes')}</span><textarea className={`${control} min-h-28 py-3`} name="notes" maxLength={2000} /></label>
      </fieldset>
      {step === 3 && <section className="space-y-5"><h2 className="text-xl font-semibold">{t('review')}</h2><dl className="grid gap-4 sm:grid-cols-2">{[[w('pilgrimId'), person?.fullName], [w('departureId'), `${schedule?.name} · ${schedule?.date}`], [t('roomType'), t(room as 'QUAD')], [t('payer'), `${payer} · ${phone}`], [t('total'), formatIdr.format(total)], [t('dpTarget'), formatIdr.format(dp)], [t('initialInvoiceAmount'), formatIdr.format(invoice)], [t('due'), due]].map(([label, value]) => <div key={label} className="border-b pb-3"><dt className="text-slate-600">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl><p className="rounded-lg bg-blue-50 p-4 leading-7 text-blue-900">{t('invoiceHelp')}</p><label className="flex min-h-12 items-center gap-3"><input className="size-5" type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />{t('confirm')}</label></section>}
    </div>
    {!state.ok && <div className="flex flex-wrap gap-3">{step > 0 && <Button type="button" variant="outline" disabled={pending} onClick={() => setStep(s => s - 1)}><ArrowLeft />{w('back')}</Button>}{step < 3 ? <Button type="button" onClick={advance}>{t('next')}<ArrowRight /></Button> : <Button type="submit" disabled={pending || !confirmed || !validMoney}>{pending && <LoaderCircle className="animate-spin" />}{t(pending ? 'saving' : 'save')}</Button>}</div>}
  </form>;
}
