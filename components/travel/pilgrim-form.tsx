'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import Link from 'next/link';
import type { CreatePilgrimInput } from '@/lib/validation/pilgrim';

const inputClass =
  'mt-2 min-h-12 w-full rounded-lg border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export function PilgrimForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePilgrimInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch('/api/travel/pilgrims', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(result.error ?? 'Data belum berhasil disimpan. Silakan coba lagi.');
      return;
    }
    router.push('/travel/jamaah');
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-7" aria-labelledby="main-data-title">
        <div className="border-b pb-5">
          <p className="text-sm font-bold text-primary">LANGKAH 1 DARI 1</p>
          <h2 id="main-data-title" className="mt-2 text-xl font-bold">Data utama jamaah</h2>
          <p className="mt-2 text-base leading-7 text-muted-foreground">Isi tiga data utama terlebih dahulu. Data lain boleh dilengkapi nanti.</p>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-base font-bold">Nama lengkap sesuai KTP <span className="text-destructive">*</span></span>
            <input {...register('fullName', { required: 'Nama lengkap wajib diisi.', minLength: { value: 3, message: 'Nama minimal 3 huruf.' } })} className={inputClass} autoFocus autoComplete="name" aria-invalid={Boolean(errors.fullName)} />
            {errors.fullName ? <span className="mt-2 block text-sm font-semibold text-destructive">{errors.fullName.message}</span> : null}
          </label>
          <label className="block">
            <span className="text-base font-bold">Nomor WhatsApp <span className="text-destructive">*</span></span>
            <input {...register('phone', { required: 'Nomor WhatsApp wajib diisi.', pattern: { value: /^(?:\+?62|0)[0-9]{8,13}$/, message: 'Contoh: 081234567890.' } })} className={inputClass} inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" aria-invalid={Boolean(errors.phone)} />
            {errors.phone ? <span className="mt-2 block text-sm font-semibold text-destructive">{errors.phone.message}</span> : <span className="mt-2 block text-sm text-muted-foreground">Boleh diawali 08 atau 62.</span>}
          </label>
          <label className="block">
            <span className="text-base font-bold">Jenis kelamin</span>
            <select {...register('gender')} className={inputClass} defaultValue="">
              <option value="">Pilih jika sudah diketahui</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </label>
        </div>
      </section>

      <details className="rounded-xl border bg-card shadow-sm">
        <summary className="min-h-14 cursor-pointer px-5 py-4 text-base font-bold sm:px-7">Lengkapi biodata lainnya (opsional)</summary>
        <div className="grid gap-6 border-t p-5 sm:grid-cols-2 sm:p-7">
          <label><span className="font-semibold">Tempat lahir</span><input {...register('birthPlace')} className={inputClass} /></label>
          <label><span className="font-semibold">Tanggal lahir</span><input {...register('birthDate')} type="date" className={inputClass} /></label>
          <label className="sm:col-span-2"><span className="font-semibold">Alamat email</span><input {...register('email')} type="email" className={inputClass} autoComplete="email" /></label>
          <label className="sm:col-span-2"><span className="font-semibold">Alamat tempat tinggal</span><textarea {...register('address')} className={`${inputClass} min-h-28 py-3`} /></label>
          <label><span className="font-semibold">Kota/kabupaten</span><input {...register('city')} className={inputClass} /></label>
          <label><span className="font-semibold">Provinsi</span><input {...register('province')} className={inputClass} /></label>
          <label><span className="font-semibold">Nama kontak darurat</span><input {...register('emergencyName')} className={inputClass} /></label>
          <label><span className="font-semibold">Nomor kontak darurat</span><input {...register('emergencyPhone')} className={inputClass} inputMode="tel" /></label>
        </div>
      </details>

      {serverError ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-base font-semibold text-destructive">{serverError}</div> : null}

      <div className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
        <Link href="/travel/jamaah" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-base font-bold"><ArrowLeft className="size-5" /> Batal</Link>
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Save className="size-5" aria-hidden="true" />}
          {isSubmitting ? 'Menyimpan…' : 'Simpan jamaah'}
        </button>
      </div>
    </form>
  );
}
