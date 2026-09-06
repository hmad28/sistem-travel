import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { BadgeCheck, CheckCircle2, Headphones } from 'lucide-react';
import LoginForm from './login-form';
import { BrandLogo } from '@/components/brand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b3b35] px-5 py-12 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(221,190,108,.22),transparent_26rem)]" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 size-80 rounded-full border-[54px] border-[#d9c079]/10" aria-hidden="true" />
          <Card className="relative w-full max-w-[500px] rounded-[24px] border border-[#cfbd8c] bg-[#fbf7ed] p-2 shadow-[0_34px_90px_rgba(1,20,17,.38)] ring-0 sm:p-4">
            <CardHeader className="px-5 pb-7 pt-5 sm:px-7"><div className="mb-8 flex items-center gap-3 lg:hidden"><BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-10" /><strong>{branding.name}</strong></div>
              <p className="text-sm font-bold text-[#0b594c]">Sistem internal Hammad Tour</p>
              <CardTitle className="mt-2 text-[34px] font-bold tracking-[-.035em]">Masuk ke dashboard</CardTitle>
              <CardDescription className="mt-2 text-base leading-7">
                {t('loginWorkspaceDescription', { appName: branding.name })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-7">
              <LoginForm />
              <div className="mt-7 rounded-xl border border-[#ded3b8] bg-[#eee7d7] px-4 py-3 text-center text-sm leading-6 text-[#5d6965]">Tidak bisa masuk? Hubungi pemilik travel atau administrator.</div>
            </CardContent>
          </Card>
        </section>
    </main>
  );
}
