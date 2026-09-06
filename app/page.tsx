import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, Clock3, Headphones, MapPin, MessageCircle, Plane, ShieldCheck, Star, UsersRound } from 'lucide-react';
import { getPublishedPackages } from '@/lib/travel/public-packages';
import { formatIdr, formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';

export const dynamic = 'force-dynamic';

const packageImages = [
  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
];
const demoPackages = [
  { name: 'Umrah Syawal 9 Hari', date: '15 Januari 2027', duration: '9 hari', hotel: 'Setaraf bintang 5', price: 'Rp29.900.000', seats: '3 kursi tersisa' },
  { name: 'Awal Ramadan 12 Hari', date: '2 Februari 2027', duration: '12 hari', hotel: 'Dekat Masjidil Haram', price: 'Rp33.500.000', seats: '17 kursi tersedia' },
  { name: 'Umrah Plus Turki', date: '18 Maret 2027', duration: '12 hari', hotel: 'Makkah, Madinah & Istanbul', price: 'Rp36.900.000', seats: '27 kursi tersedia' },
];
const whatsapp = 'https://wa.me/6281234567890';

export default async function Home() {
  const published = await getPublishedPackages('hammad-tour').catch(() => []);
  const packages = (published.length ? published.map((item) => ({
    name: item.name,
    date: formatIndonesianDate.format(parseDatabaseDate(item.departureDate)),
    duration: `${item.durationDays} hari`,
    hotel: item.hotel ?? 'Hotel sesuai paket',
    price: formatIdr.format(Number(item.startingPrice)),
    seats: `${Math.max(0, item.quota - item.confirmedSeats)} kursi tersedia`,
  })) : demoPackages).map((item, index) => ({ ...item, image: packageImages[index % packageImages.length] }));

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#152b27]">
      <div className="bg-[#092f2a] text-white"><div className="mx-auto flex min-h-10 max-w-[1380px] items-center justify-between gap-4 px-5 text-sm lg:px-8"><p className="flex items-center gap-2 text-white/75"><ShieldCheck className="size-4 text-[#e1bd62]" /> Travel Umrah & Haji berizin resmi</p><p className="hidden text-white/65 md:block">Senin–Sabtu, 08.00–17.00 WIB · Jakarta</p></div></div>
      <header className="sticky top-0 z-40 border-b border-black/8 bg-[#f7f5ef]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1380px] items-center justify-between gap-6 px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Hammad Tour, beranda"><span className="grid size-11 place-items-center rounded-full border border-[#d7b85f] bg-[#0b3d36] font-serif text-xl font-bold text-[#f0d985]">H</span><span><strong className="block text-lg leading-none tracking-[-.02em]">Hammad Tour</strong><small className="mt-1.5 block text-[10px] font-extrabold tracking-[.22em] text-[#98762f]">UMRAH · HAJI · WISATA</small></span></Link>
          <nav className="hidden items-center gap-8 text-[15px] font-semibold xl:flex" aria-label="Navigasi utama"><Link href="#paket">Paket perjalanan</Link><Link href="#keunggulan">Mengapa kami</Link><Link href="#cara-daftar">Cara mendaftar</Link><Link href="#kontak">Kontak</Link></nav>
          <a href={whatsapp} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0b493f] px-5 text-sm font-bold text-white"><MessageCircle className="size-5" /><span className="hidden sm:inline">Konsultasi WhatsApp</span><span className="sm:hidden">Hubungi</span></a>
        </div>
      </header>

      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#082f2a] text-white">
        <Image src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=2200&q=90" alt="Jamaah beribadah di Masjidil Haram" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,29,25,.97)_0%,rgba(4,34,30,.82)_44%,rgba(4,30,27,.2)_74%,rgba(4,30,27,.48)_100%)]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1380px] items-center px-5 py-20 lg:px-8"><div className="max-w-[760px]">
          <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e0c064]/40 bg-black/20 px-4 text-sm font-bold text-[#f2d887] backdrop-blur"><BadgeCheck className="size-5" /> Amanah mendampingi perjalanan ibadah</p>
          <h1 className="mt-7 text-balance font-serif text-5xl font-semibold leading-[1.04] tracking-[-.035em] sm:text-6xl lg:text-[78px]">Menuju Baitullah dengan hati yang lebih tenang.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">Paket jelas, pembimbing berpengalaman, dan tim yang membantu jamaah dari pendaftaran sampai pulang ke Tanah Air.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="#paket" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#e3bd5e] px-7 font-bold text-[#17302b]">Lihat jadwal keberangkatan <ArrowRight className="size-5" /></Link><a href={whatsapp} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/8 px-7 font-bold backdrop-blur"><MessageCircle className="size-5" /> Tanya tim kami</a></div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/20 pt-7 sm:grid-cols-3">{['Biaya transparan', 'Manasik terarah', 'Dokumen dibantu'].map((item) => <span key={item} className="flex items-center gap-2 text-sm font-semibold text-white/80"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e3bd5e] text-[#11372f]"><Check className="size-4" /></span>{item}</span>)}</div>
        </div></div>
        <div className="relative border-t border-white/15 bg-[#061f1c]/80 backdrop-blur-md"><div className="mx-auto grid max-w-[1380px] divide-y divide-white/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">{[[ShieldCheck, 'PPIU Resmi', 'Legalitas dapat diverifikasi'], [UsersRound, 'Pendamping Jamaah', 'Dibantu langkah demi langkah'], [Headphones, 'Layanan Responsif', 'Konsultasi mudah via WhatsApp']].map(([Icon, title, detail]) => { const ItemIcon = Icon as typeof ShieldCheck; return <div key={title as string} className="flex items-center gap-4 py-5 sm:px-6 first:sm:pl-0"><ItemIcon className="size-7 shrink-0 text-[#e3bd5e]" /><div><strong className="block">{title as string}</strong><span className="text-sm text-white/55">{detail as string}</span></div></div>; })}</div></div>
      </section>

      <section id="paket" className="mx-auto max-w-[1380px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="text-sm font-extrabold tracking-[.18em] text-[#98762f]">JADWAL PILIHAN</p><h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Pilih paket sesuai waktu dan kebutuhan keluarga.</h2></div><p className="max-w-md text-base leading-7 text-[#62716d]">Semua rincian utama ditampilkan sejak awal. Tim kami siap membantu membandingkan paket.</p></div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">{packages.map((item, index) => <article key={item.name} className="group overflow-hidden rounded-[22px] border border-[#17342e]/10 bg-white shadow-[0_18px_50px_rgba(15,52,45,.08)]">
          <div className="relative h-64 overflow-hidden"><Image src={item.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><span className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1.5 text-xs font-extrabold text-[#17342e]">{index === 0 ? 'PALING DEKAT' : index === 1 ? 'PILIHAN KELUARGA' : 'PAKET SPESIAL'}</span><span className="absolute bottom-5 left-5 rounded-full bg-[#b14f32] px-3 py-1.5 text-sm font-bold text-white">{item.seats}</span></div>
          <div className="p-6"><h3 className="font-serif text-[27px] font-semibold leading-tight">{item.name}</h3><div className="mt-5 grid gap-3 text-[15px] text-[#5a6b66]"><span className="flex items-center gap-3"><CalendarDays className="size-5 text-[#a27d2e]" />{item.date}</span><span className="flex items-center gap-3"><Clock3 className="size-5 text-[#a27d2e]" />{item.duration}</span><span className="flex items-center gap-3"><MapPin className="size-5 text-[#a27d2e]" />{item.hotel}</span></div><div className="mt-6 flex items-end justify-between gap-4 border-t pt-5"><div><small className="text-sm text-[#6b7774]">Harga mulai</small><strong className="mt-1 block text-2xl tracking-tight">{item.price}</strong></div><a href={whatsapp} aria-label={`Tanyakan ${item.name}`} className="grid size-12 shrink-0 place-items-center rounded-full bg-[#0b493f] text-white"><ChevronRight className="size-6" /></a></div></div>
        </article>)}</div>
      </section>

      <section id="keunggulan" className="bg-white py-20 lg:py-28"><div className="mx-auto grid max-w-[1380px] gap-12 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
        <div className="relative min-h-[560px] overflow-hidden rounded-[28px]"><Image src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1400&q=85" alt="Suasana Masjid Nabawi di Madinah" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" /><div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/94 p-5 shadow-xl backdrop-blur sm:left-auto sm:max-w-xs"><div className="flex items-center gap-1 text-[#be8b21]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}</div><p className="mt-3 font-serif text-xl leading-snug">“Setiap jamaah layak merasa ditemani, bukan sekadar diberangkatkan.”</p></div></div>
        <div><p className="text-sm font-extrabold tracking-[.18em] text-[#98762f]">MENGAPA HAMMAD TOUR</p><h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Ibadah adalah tujuan utama. Urusan perjalanan biar kami yang menata.</h2><p className="mt-5 text-lg leading-8 text-[#62716d]">Proses yang biasanya membingungkan kami sederhanakan menjadi langkah jelas dan mudah diikuti.</p><div className="mt-9 grid gap-4 sm:grid-cols-2">{[[Building2, 'Legalitas transparan', 'Izin, alamat kantor, dan penanggung jawab mudah diperiksa.'], [Plane, 'Perjalanan tertata', 'Jadwal, hotel, penerbangan, dan perlengkapan dijelaskan sejak awal.'], [UsersRound, 'Ramah untuk lansia', 'Bahasa sederhana dan bantuan langsung bagi jamaah yang belum terbiasa digital.'], [BadgeCheck, 'Pembimbing amanah', 'Manasik serta pendampingan ibadah dari persiapan hingga kepulangan.']].map(([Icon, title, detail]) => { const ItemIcon = Icon as typeof ShieldCheck; return <div key={title as string} className="border-t border-[#17342e]/15 pt-5"><ItemIcon className="size-7 text-[#0b493f]" /><h3 className="mt-4 text-lg font-bold">{title as string}</h3><p className="mt-2 leading-7 text-[#687773]">{detail as string}</p></div>; })}</div></div>
      </div></section>

      <section id="cara-daftar" className="bg-[#0a332e] py-20 text-white lg:py-24"><div className="mx-auto max-w-[1380px] px-5 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-extrabold tracking-[.18em] text-[#e3bd5e]">PROSES PENDAFTARAN</p><h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Empat langkah sederhana menuju Baitullah.</h2></div><ol className="mt-12 grid gap-px overflow-hidden rounded-[24px] bg-white/15 md:grid-cols-4">{[['Konsultasi paket', 'Ceritakan jadwal dan kebutuhan Anda.'], ['Isi data jamaah', 'Tim membantu biodata dan dokumen.'], ['Pembayaran aman', 'Tagihan dan bukti bayar tercatat jelas.'], ['Manasik & berangkat', 'Persiapan bersama sampai hari keberangkatan.']].map(([title, detail], index) => <li key={title} className="bg-[#0d3d36] p-7"><span className="grid size-10 place-items-center rounded-full border border-[#e3bd5e]/50 text-sm font-bold text-[#e3bd5e]">0{index + 1}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-white/60">{detail}</p></li>)}</ol></div></section>

      <section id="kontak" className="mx-auto max-w-[1380px] px-5 py-20 lg:px-8"><div className="relative overflow-hidden rounded-[28px] bg-[#dcb85f] px-7 py-10 sm:px-12 sm:py-14"><div className="absolute -right-16 -top-20 size-72 rounded-full border-[50px] border-white/15" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center"><div className="max-w-3xl"><p className="text-sm font-extrabold tracking-[.18em] text-[#5c4718]">KONSULTASI GRATIS</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#17302b] sm:text-5xl">Masih bingung memilih? Ceritakan rencana Anda.</h2><p className="mt-4 text-lg text-[#4d472f]">Tim kami membantu dengan bahasa yang mudah dipahami, tanpa kewajiban mendaftar.</p></div><a href={whatsapp} className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-[#0b3d36] px-7 font-bold text-white"><MessageCircle className="size-5" /> Hubungi via WhatsApp</a></div></div></section>

      <footer className="bg-[#071f1c] text-white"><div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-10 sm:grid-cols-2 lg:px-8"><div><strong className="font-serif text-2xl">Hammad Tour</strong><p className="mt-3 max-w-md leading-7 text-white/55">Pendamping perjalanan Umrah dan Haji untuk keluarga Indonesia.</p></div><div className="sm:text-right"><p className="font-semibold">Jakarta, Indonesia</p><p className="mt-2 text-white/55">Senin–Sabtu · 08.00–17.00 WIB</p></div></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-[1380px] flex-col gap-2 px-5 py-5 text-sm text-white/45 sm:flex-row sm:justify-between lg:px-8"><span>© 2026 Hammad Tour. Hak cipta dilindungi.</span><span>Powered by <strong className="text-white/70">Hammad Studio</strong></span></div></div></footer>
    </main>
  );
}
