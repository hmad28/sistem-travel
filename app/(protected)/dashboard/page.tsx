import {
  ArrowRight,
  CalendarDays,
  FileWarning,
  MessageCircle,
  PackagePlus,
  ReceiptText,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { getDashboardData } from '@/lib/travel/dashboard-data';
import {
  formatCompactIdr,
  formatIndonesianDate,
  parseDatabaseDate,
} from '@/lib/travel/format';

const actions = [
  { label: 'Tambah jamaah', detail: 'Masukkan data jamaah baru', href: '/travel/jamaah', icon: UserPlus },
  { label: 'Buat pendaftaran', detail: 'Pilih paket dan keberangkatan', href: '/travel/keberangkatan', icon: PackagePlus },
  { label: 'Catat pembayaran', detail: 'Simpan pembayaran dan kwitansi', href: '/travel/pembayaran', icon: ReceiptText },
];

export default async function DashboardPage() {
  const { organizationId } = await requireOrganizationContext();
  const data = await getDashboardData(organizationId);
  const nearest = data.nearestDeparture;
  const seatPercentage = nearest?.quota
    ? Math.min(100, Math.round((nearest.confirmedSeats / nearest.quota) * 100))
    : 0;
  const stats = [
    {
      label: 'Jamaah aktif',
      value: data.pilgrims.toLocaleString('id-ID'),
      detail: `${data.activeDepartures} keberangkatan aktif`,
      icon: UsersRound,
    },
    {
      label: 'Total tagihan',
      value: formatCompactIdr.format(data.finance.total),
      detail: `${formatCompactIdr.format(data.finance.paid)} sudah diterima`,
      icon: ReceiptText,
    },
    {
      label: 'Sisa tagihan',
      value: formatCompactIdr.format(data.finance.outstanding),
      detail: `${data.finance.unpaidPilgrims} jamaah perlu dihubungi`,
      icon: WalletCards,
    },
    {
      label: 'Kesiapan dokumen',
      value: `${data.documents.percentage}%`,
      detail: `${data.documents.incomplete} dokumen perlu dilengkapi`,
      icon: FileWarning,
    },
  ];
  const work = [
    {
      tone: 'bg-amber-500',
      title: `${data.finance.unpaidPilgrims} jamaah belum melunasi`,
      detail: `Sisa tagihan ${formatCompactIdr.format(data.finance.outstanding)}`,
      href: '/travel/pembayaran',
    },
    {
      tone: 'bg-rose-500',
      title: `${data.documents.incomplete} dokumen belum lengkap`,
      detail: 'Periksa dokumen sebelum batas pengumpulan',
      href: '/travel/operasional',
    },
    {
      tone: 'bg-emerald-500',
      title: nearest ? 'Keberangkatan terdekat' : 'Belum ada keberangkatan aktif',
      detail: nearest
        ? `${nearest.packageName} · ${nearest.confirmedSeats} dari ${nearest.quota} kursi`
        : 'Buat jadwal keberangkatan untuk mulai menerima jamaah',
      href: '/travel/keberangkatan',
    },
  ];

  return (
    <PageShell title="Ringkasan hari ini" description="Yang perlu dikerjakan tampil lebih dulu. Pilih satu pekerjaan untuk mulai.">
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="text-lg font-bold">Mulai pekerjaan</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {actions.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="group flex min-h-24 items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon className="size-6" aria-hidden="true" /></span><span className="min-w-0"><strong className="block text-base">{item.label}</strong><small className="mt-1 block text-sm leading-5 text-muted-foreground">{item.detail}</small></span><ArrowRight className="ml-auto size-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>; })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan bisnis">
        {stats.map((item) => { const Icon = item.icon; return <article key={item.label} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><p className="text-[15px] font-semibold text-muted-foreground">{item.label}</p><Icon className="size-5 text-primary" aria-hidden="true" /></div><strong className="mt-4 block text-3xl font-bold tabular-nums tracking-tight">{item.value}</strong><small className="mt-2 block text-sm leading-5 text-muted-foreground">{item.detail}</small></article>; })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-xl border bg-card shadow-sm"><header className="border-b p-5"><p className="text-sm font-bold tracking-[.12em] text-primary">PERLU DITINDAKLANJUTI</p><h2 className="mt-2 text-xl font-bold">Pekerjaan penting</h2></header><div className="divide-y">{work.map((item) => <Link key={item.title} href={item.href} className="flex min-h-24 items-center gap-4 p-5 hover:bg-muted/50"><span className={`size-3 shrink-0 rounded-full ${item.tone.split(' ')[0]}`} /><span className="min-w-0"><strong className="block text-base">{item.title}</strong><small className="mt-1 block text-sm leading-5 text-muted-foreground">{item.detail}</small></span><ArrowRight className="ml-auto size-5 text-muted-foreground" aria-hidden="true" /></Link>)}</div></div>

        <div className="rounded-xl bg-[#103f39] p-6 text-white shadow-sm"><CalendarDays className="size-8 text-[#ecd28d]" aria-hidden="true" /><p className="mt-7 text-sm font-bold tracking-[.12em] text-[#ecd28d]">{nearest ? formatIndonesianDate.format(parseDatabaseDate(nearest.departureDate)).toLocaleUpperCase('id-ID') : 'BELUM DIJADWALKAN'}</p><h2 className="mt-2 text-2xl font-bold">{nearest?.packageName ?? 'Buat keberangkatan pertama'}</h2><p className="mt-3 text-base leading-7 text-white/70">{nearest ? `${nearest.confirmedSeats} dari ${nearest.quota} kursi sudah terisi. Kesiapan dokumen seluruh jamaah ${data.documents.percentage}%.` : 'Pilih paket, tanggal, dan kuota. Sistem akan membantu memantau kesiapan jamaah.'}</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Kursi terisi" aria-valuenow={seatPercentage} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-[#ecd28d]" style={{ width: `${seatPercentage}%` }} /></div><Link href="/travel/operasional" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 font-bold text-[#103f39]">Buka pusat keberangkatan <ArrowRight className="size-5" /></Link></div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">Butuh menghubungi jamaah?</h2><p className="mt-1 text-sm leading-6 text-emerald-800">Gunakan WhatsApp untuk mengirim pengingat pembayaran atau dokumen.</p></div><a href="https://wa.me/6281234567890" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 font-bold text-white"><MessageCircle className="size-5" /> Buka WhatsApp</a></section>
    </PageShell>
  );
}
