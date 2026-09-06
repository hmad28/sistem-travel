import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Plane,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react';
import { getPublishedPackages } from '@/lib/travel/public-packages';
import {
  formatIdr,
  formatIndonesianDate,
  parseDatabaseDate,
} from '@/lib/travel/format';

export const dynamic = 'force-dynamic';

const demoPackages = [
  { name: 'Umrah Syawal 9 Hari', date: '15 Januari 2027', duration: '9 hari', hotel: 'Setaraf bintang 5', price: 'Rp29.900.000', seats: '3 kursi tersisa', tone: 'bg-[#d9eee5]' },
  { name: 'Awal Ramadan 12 Hari', date: '2 Februari 2027', duration: '12 hari', hotel: 'Dekat Masjidil Haram', price: 'Rp33.500.000', seats: '17 kursi tersedia', tone: 'bg-[#eee5d2]' },
  { name: 'Umrah Plus Turki', date: '18 Maret 2027', duration: '12 hari', hotel: 'Makkah, Madinah & Istanbul', price: 'Rp36.900.000', seats: '27 kursi tersedia', tone: 'bg-[#dce6ef]' },
];

const steps = [
  ['Pilih paket', 'Bandingkan jadwal, fasilitas, dan harga dengan jelas.'],
  ['Lengkapi data', 'Tim kami membantu biodata dan dokumen sampai lengkap.'],
  ['Persiapan bersama', 'Manasik, perlengkapan, dan informasi perjalanan tertata.'],
  ['Berangkat tenang', 'Pendamping menemani jamaah selama perjalanan ibadah.'],
];

export default async function Home() {
  const publishedPackages = await getPublishedPackages('hammad-tour').catch((error) => {
    console.warn('[public-packages] Menampilkan data demo karena database belum siap.', error);
    return [];
  });
  const packages = publishedPackages.length
    ? publishedPackages.map((item, index) => ({
        name: item.name,
        date: formatIndonesianDate.format(parseDatabaseDate(item.departureDate)),
        duration: `${item.durationDays} hari`,
        hotel: item.hotel ?? 'Hotel sesuai paket',
        price: formatIdr.format(Number(item.startingPrice)),
        seats: `${Math.max(0, item.quota - item.confirmedSeats)} kursi tersedia`,
        tone: ['bg-[#d9eee5]', 'bg-[#eee5d2]', 'bg-[#dce6ef]'][index % 3],
      }))
    : demoPackages;
  const nearestPackage = packages[0];

  return (
    <main className="min-h-screen bg-[#fbf8f0] text-[#102a2a]">
      <header className="sticky top-0 z-40 border-b border-[#153f37]/10 bg-[#fbf8f0]/95 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Hammad Tour, beranda">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#0d493f] font-serif text-xl font-bold text-[#f9e6ae]">H</span>
            <span><strong className="block font-serif text-xl leading-none">Hammad Tour</strong><small className="mt-1 block text-xs font-semibold tracking-[.16em] text-[#8b6a2d]">UMRAH & HAJI</small></span>
          </Link>
          <nav className="hidden items-center gap-7 text-[15px] font-semibold lg:flex" aria-label="Navigasi utama">
            <Link href="#paket" className="hover:text-[#9a7228]">Paket Umrah</Link>
            <Link href="#cara-daftar" className="hover:text-[#9a7228]">Cara Daftar</Link>
            <Link href="#legalitas" className="hover:text-[#9a7228]">Legalitas</Link>
          </nav>
          <a href="https://wa.me/6281234567890" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0d493f] px-5 text-[15px] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d493f]">
            <MessageCircle className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">Konsultasi Gratis</span><span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#153f37]/10">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#0d493f_0.7px,transparent_0.7px)] [background-size:22px_22px]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9964f]/30 bg-white/70 px-4 py-2 text-sm font-bold text-[#7d5c20]"><BadgeCheck className="size-5" aria-hidden="true" /> Travel Umrah Terdaftar & Terpercaya</p>
            <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.04] tracking-[-.035em] sm:text-6xl lg:text-[76px]">Ibadah lebih tenang karena <em className="font-normal text-[#a1772a]">persiapan tertata.</em></h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-[#49605c]">Kami mendampingi setiap langkah jamaah—mulai dari memilih paket, melengkapi dokumen, manasik, hingga kembali ke Tanah Air.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="#paket" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#0d493f] px-7 text-base font-bold text-white hover:bg-[#083b33]">Lihat Paket Umrah <ArrowRight className="size-5" aria-hidden="true" /></Link>
              <a href="https://wa.me/6281234567890" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#0d493f]/20 bg-white px-7 text-base font-bold hover:border-[#0d493f]/50"><MessageCircle className="size-5 text-[#168b67]" aria-hidden="true" /> Tanya lewat WhatsApp</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[15px] font-semibold text-[#425954]">
              {['Harga transparan', 'Pembimbing berpengalaman', 'Pendampingan dokumen'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-5 text-[#168b67]" aria-hidden="true" /> {item}</span>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-[50%] border border-[#b9964f]/25" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0b3b36] p-7 text-white shadow-2xl shadow-[#0d493f]/20 sm:p-9">
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-7"><div><p className="text-sm font-bold tracking-[.14em] text-[#f0d894]">KEBERANGKATAN TERDEKAT</p><h2 className="mt-3 font-serif text-3xl">{nearestPackage.name}</h2></div><Plane className="size-10 text-[#f0d894]" aria-hidden="true" /></div>
              <dl className="grid gap-5 py-7 sm:grid-cols-2">
                <div><dt className="text-sm text-white/65">Berangkat</dt><dd className="mt-1 text-lg font-bold">{nearestPackage.date}</dd></div>
                <div><dt className="text-sm text-white/65">Durasi</dt><dd className="mt-1 text-lg font-bold">{nearestPackage.duration}</dd></div>
                <div><dt className="text-sm text-white/65">Maskapai</dt><dd className="mt-1 text-lg font-bold">Saudia Airlines</dd></div>
                <div><dt className="text-sm text-white/65">Sisa kuota</dt><dd className="mt-1 text-lg font-bold text-[#f0d894]">{nearestPackage.seats}</dd></div>
              </dl>
              <div className="rounded-2xl bg-white/10 p-5"><span className="text-sm text-white/65">Mulai dari</span><strong className="mt-1 block font-serif text-3xl text-[#f7e4aa]">{nearestPackage.price}</strong></div>
              <Link href="#paket" className="mt-5 flex min-h-12 items-center justify-between rounded-xl bg-[#f7e4aa] px-5 font-bold text-[#153f37]">Lihat rincian paket <ChevronRight className="size-5" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="legalitas" className="bg-white py-7">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            [ShieldCheck, 'Legalitas jelas', 'Izin PPIU terverifikasi'],
            [UsersRound, 'Pendamping amanah', 'Tim berpengalaman'],
            [HeartHandshake, 'Pelayanan personal', 'Dibantu sampai tuntas'],
            [Star, 'Pilihan transparan', 'Biaya dijelaskan di awal'],
          ].map(([Icon, label, detail]) => { const FeatureIcon = Icon as typeof ShieldCheck; return <div key={label as string} className="flex items-center gap-4 p-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e5f0ea] text-[#0d493f]"><FeatureIcon className="size-6" aria-hidden="true" /></span><span><strong className="block text-base">{label as string}</strong><small className="mt-1 block text-sm text-[#687a76]">{detail as string}</small></span></div>; })}
        </div>
      </section>

      <section id="paket" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-3xl"><p className="text-sm font-bold tracking-[.18em] text-[#9a7228]">PILIHAN PERJALANAN</p><h2 className="mt-4 text-balance font-serif text-4xl font-semibold sm:text-5xl">Paket yang jelas, agar jamaah memilih dengan yakin.</h2><p className="mt-5 text-lg leading-8 text-[#5d706c]">Tanggal, fasilitas, hotel, dan biaya ditampilkan apa adanya. Tim kami siap membantu membandingkan pilihan.</p></div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {packages.map((item, index) => <article key={item.name} className="overflow-hidden rounded-[1.6rem] border border-[#153f37]/10 bg-white shadow-sm transition-transform hover:-translate-y-1">
            <div className={`relative h-52 ${item.tone} p-6`}><div className="absolute inset-x-8 bottom-0 h-36 rounded-t-[7rem] border-[14px] border-[#0d493f]/10 border-b-0" aria-hidden="true" /><span className="relative inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#76551e]">Pilihan {index + 1}</span></div>
            <div className="p-6"><h3 className="font-serif text-2xl font-semibold">{item.name}</h3><div className="mt-5 grid gap-3 text-[15px] text-[#4e625e]"><span className="flex items-center gap-3"><CalendarDays className="size-5 text-[#9a7228]" aria-hidden="true" />{item.date}</span><span className="flex items-center gap-3"><Clock3 className="size-5 text-[#9a7228]" aria-hidden="true" />{item.duration}</span><span className="flex items-center gap-3"><MapPin className="size-5 text-[#9a7228]" aria-hidden="true" />{item.hotel}</span></div><div className="mt-6 border-t pt-5"><small className="text-sm text-[#687a76]">Mulai dari</small><strong className="mt-1 block text-2xl">{item.price}</strong><span className="mt-2 block text-sm font-bold text-[#b15b37]">{item.seats}</span></div><a href="https://wa.me/6281234567890" className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-[#0d493f] px-5 font-bold text-white">Tanyakan paket ini</a></div>
          </article>)}
        </div>
      </section>

      <section id="cara-daftar" className="bg-[#0d3f39] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold tracking-[.18em] text-[#efd48d]">CARA MENDAFTAR</p><h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Tidak perlu paham teknologi untuk memulai.</h2><p className="mt-5 text-lg leading-8 text-white/70">Hubungi kami melalui WhatsApp. Tim Hammad Tour membantu proses berikutnya satu per satu.</p></div><ol className="grid gap-4 sm:grid-cols-2">{steps.map(([title, description], index) => <li key={title} className="rounded-2xl border border-white/12 bg-white/[.06] p-6"><span className="grid size-10 place-items-center rounded-full bg-[#efd48d] font-bold text-[#0d3f39]">{index + 1}</span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-white/65">{description}</p></li>)}</ol></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-[#e7dcc3] p-8 sm:p-12 lg:flex-row lg:items-center"><div className="max-w-3xl"><p className="text-sm font-bold tracking-[.16em] text-[#78571d]">KONSULTASI GRATIS</p><h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Masih bingung memilih paket yang cocok?</h2><p className="mt-3 text-lg leading-8 text-[#50615d]">Ceritakan rencana keberangkatan Anda. Kami bantu arahkan tanpa kewajiban mendaftar.</p></div><a href="https://wa.me/6281234567890" className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-xl bg-[#0d493f] px-7 text-base font-bold text-white"><MessageCircle className="size-5" aria-hidden="true" /> Hubungi Hammad Tour</a></div></section>

      <footer className="border-t border-[#153f37]/10 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[#60716d] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span><strong className="text-[#153f37]">Hammad Tour</strong> · Umrah & Haji</span><span>Powered by <strong className="text-[#153f37]">Hammad Studio</strong></span></div></footer>
    </main>
  );
}
