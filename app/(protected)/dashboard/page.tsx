import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  FileWarning,
  MessageCircle,
  Plus,
  ReceiptText,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { getDashboardData } from '@/lib/travel/dashboard-data';
import { formatCompactIdr, formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';

export default async function DashboardPage() {
  const { organizationId } = await requireOrganizationContext();
  const data = await getDashboardData(organizationId);
  const t = await getTranslations('internalOverview');
  const nearest = data.nearestDeparture;
  const seatPercentage = nearest?.quota
    ? Math.min(100, Math.round((nearest.confirmedSeats / nearest.quota) * 100))
    : 0;
  const stats = [
    [
      'Jamaah aktif',
      data.pilgrims.toLocaleString('id-ID'),
      `${data.activeDepartures} keberangkatan aktif`,
      UsersRound,
    ],
    [
      'Tagihan berjalan',
      formatCompactIdr.format(data.finance.total),
      `${formatCompactIdr.format(data.finance.paid)} sudah diterima`,
      ReceiptText,
    ],
    [
      'Piutang jamaah',
      formatCompactIdr.format(data.finance.outstanding),
      `${data.finance.unpaidPilgrims} jamaah belum lunas`,
      WalletCards,
    ],
    [
      'Dokumen lengkap',
      `${data.documents.percentage}%`,
      `${data.documents.incomplete} berkas perlu dicek`,
      FileWarning,
    ],
  ] as const;
  const work = [
    {
      icon: WalletCards,
      title: 'Konfirmasi pembayaran jamaah',
      count: data.finance.unpaidPilgrims,
      detail: `${formatCompactIdr.format(data.finance.outstanding)} belum diterima`,
      href: '/travel/pembayaran',
      tone: 'text-amber-700 bg-amber-50',
    },
    {
      icon: FileWarning,
      title: 'Lengkapi dokumen keberangkatan',
      count: data.documents.incomplete,
      detail: 'Paspor, foto, atau berkas pendukung belum lengkap',
      href: '/travel/operasional',
      tone: 'text-rose-700 bg-rose-50',
    },
    {
      icon: CircleCheck,
      title: 'Data jamaah siap diperiksa',
      count: data.pilgrims,
      detail: 'Pastikan biodata sesuai dokumen asli',
      href: '/travel/jamaah',
      tone: 'text-emerald-700 bg-emerald-50',
    },
  ];

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <div className="flex gap-2">
          <Link
            href="/travel/jamaah/baru"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            <UserPlus className="size-4" /> Tambah jamaah
          </Link>
          <Link
            href="/travel/pembayaran"
            className="hidden min-h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-bold sm:inline-flex"
          >
            <Plus className="size-4" /> Catat pembayaran
          </Link>
        </div>
      }
    >
      <section
        className="grid overflow-hidden rounded-xl border bg-white shadow-[0_2px_8px_rgba(25,52,47,.04)] sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan bisnis"
      >
        {stats.map(([label, value, detail, Icon], index) => (
          <article
            key={label}
            className={`p-5 ${index ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-t xl:border-t-0' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">{label}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <strong className="mt-3 block text-[28px] font-bold tabular-nums tracking-[-.03em]">
              {value}
            </strong>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="overflow-hidden rounded-xl border bg-white shadow-[0_2px_8px_rgba(25,52,47,.04)]">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Perlu dikerjakan</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Urut dari yang paling mendesak</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
              <AlertTriangle className="size-4" />{' '}
              {data.finance.unpaidPilgrims + data.documents.incomplete} tugas
            </span>
          </header>
          <div className="divide-y">
            {work.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group grid min-h-[86px] grid-cols-[44px_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-[#f7faf8]"
              >
                <span className={`grid size-11 place-items-center rounded-lg ${item.tone}`}>
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-base">{item.title}</strong>
                  <small className="mt-1 block text-sm text-muted-foreground">{item.detail}</small>
                </span>
                <span className="flex items-center gap-4">
                  <strong className="text-xl tabular-nums">{item.count}</strong>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <footer className="border-t bg-[#fafbfa] px-5 py-3">
            <Link
              href="/travel/operasional"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary"
            >
              Buka semua pekerjaan <ArrowRight className="size-4" />
            </Link>
          </footer>
        </div>

        <aside className="overflow-hidden rounded-xl bg-[#123f38] text-white shadow-[0_10px_30px_rgba(18,63,56,.18)]">
          <div className="border-b border-white/10 p-5">
            <p className="flex items-center gap-2 text-xs font-extrabold tracking-[.12em] text-[#eed183]">
              <CalendarDays className="size-4" /> KEBERANGKATAN TERDEKAT
            </p>
            <h2 className="mt-3 text-xl font-bold">{nearest?.packageName ?? 'Belum ada jadwal'}</h2>
            <p className="mt-1 text-sm text-white/80">
              {nearest
                ? formatIndonesianDate.format(parseDatabaseDate(nearest.departureDate))
                : 'Buat keberangkatan pertama'}
            </p>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-white/60">Kursi terisi</span>
                <strong className="mt-1 block text-3xl tabular-nums">
                  {nearest?.confirmedSeats ?? 0}
                  <small className="ml-1 text-base font-medium text-white/75">
                    /{nearest?.quota ?? 0}
                  </small>
                </strong>
              </div>
              <strong className="text-[#eed183]">{seatPercentage}%</strong>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-[#e3bd5e]"
                style={{ width: `${seatPercentage}%` }}
              />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/[.07] p-3">
                <dt className="text-xs text-white/70">{t('allDocuments')}</dt>
                <dd className="mt-1 text-lg font-bold">{data.documents.percentage}%</dd>
              </div>
              <div className="rounded-lg bg-white/[.07] p-3">
                <dt className="text-xs text-white/70">Status</dt>
                <dd className="mt-1 text-lg font-bold">
                  {nearest ? t('scheduled') : t('unscheduled')}
                </dd>
              </div>
            </dl>
            <Link
              href="/travel/operasional"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-bold text-[#123f38]"
            >
              Buka pusat operasional <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Akses cepat</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pekerjaan yang paling sering dilakukan
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              [UserPlus, 'Data jamaah', 'Cari atau tambah jamaah', '/travel/jamaah'],
              [CalendarDays, 'Jadwal berangkat', 'Atur paket dan kuota', '/travel/keberangkatan'],
              [ReceiptText, 'Pembayaran', 'Tagihan dan kwitansi', '/travel/pembayaran'],
            ].map(([Icon, title, detail, href]) => {
              const QuickIcon = Icon as typeof UserPlus;
              return (
                <Link
                  key={title as string}
                  href={href as string}
                  className="flex min-h-20 items-center gap-3 rounded-lg border p-4 hover:border-primary/40 hover:bg-accent/30"
                >
                  <QuickIcon className="size-5 shrink-0 text-primary" />
                  <span>
                    <strong className="block text-sm">{title as string}</strong>
                    <small className="mt-1 block text-xs text-muted-foreground">
                      {detail as string}
                    </small>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-700 text-white">
            <MessageCircle className="size-5" />
          </span>
          <div>
            <strong className="block text-sm">Hubungi jamaah</strong>
            <Link
              href="/travel/jamaah"
              className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-emerald-800"
            >
              {t('findContact')} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
