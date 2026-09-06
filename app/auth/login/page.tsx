import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { BadgeCheck, CheckCircle2, Headphones } from 'lucide-react';
import LoginForm from './login-form';
import { BrandLogo } from '@/components/brand';
import { loadAppBranding } from '@/lib/branding/server';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const [t, branding] = await Promise.all([getTranslations('auth'), loadAppBranding()]);

  return (
    <main className="grid min-h-screen bg-[#f3f5f3] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#082f2a] text-white lg:block">
        <Image src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1600&q=85" alt="Masjidil Haram" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,31,27,.28),rgba(4,31,27,.92))]" />
        <div className="relative flex h-full min-h-screen flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3"><BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-11" /><div><strong className="block text-lg">{branding.name}</strong><span className="text-xs font-bold tracking-[.16em] text-[#ead080]">TOUR OPERATIONS</span></div></div>
          <div className="max-w-xl pb-8"><p className="inline-flex items-center gap-2 text-sm font-bold text-[#ead080]"><BadgeCheck className="size-5" /> Sistem operasional travel terpadu</p><h1 className="mt-5 font-serif text-5xl font-semibold leading-tight">Layani jamaah dengan data yang lebih rapi.</h1><p className="mt-5 text-lg leading-8 text-white/70">Kelola pendaftaran, pembayaran, dokumen, dan kesiapan keberangkatan dalam satu tempat.</p><div className="mt-8 flex gap-6 text-sm font-semibold text-white/75"><span className="flex items-center gap-2"><CheckCircle2 className="size-5 text-[#ead080]" /> Mudah digunakan</span><span className="flex items-center gap-2"><Headphones className="size-5 text-[#ead080]" /> Bantuan tersedia</span></div></div>
        </div>
        </section>
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#082f2a] px-7 py-12 text-white sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_5%,rgba(221,190,108,.13),transparent_25rem)]" aria-hidden="true" />
          <div className="relative w-full max-w-[470px]">
            <div className="mb-14 flex items-center gap-3 lg:hidden"><BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-11" /><div><strong className="block">{branding.name}</strong><span className="text-xs font-bold tracking-[.14em] text-[#dbc16e]">TOUR OPERATIONS</span></div></div>
            <p className="text-sm font-semibold text-[#dbc16e]">Sistem internal Hammad Tour</p>
            <h2 className="mt-3 text-[38px] font-bold leading-tight tracking-[-.04em] sm:text-[42px]">Masuk ke dashboard</h2>
            <p className="mt-3 text-base leading-7 text-white/60">{t('loginWorkspaceDescription', { appName: branding.name })}</p>
            <div className="mt-10"><LoginForm /></div>
            <p className="mt-8 border-t border-white/10 pt-5 text-center text-sm leading-6 text-white/45">Tidak bisa masuk? Hubungi pemilik travel atau administrator.</p>
          </div>
        </section>
    </main>
  );
}
