import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  FileBarChart,
  FileCheck2,
  Globe2,
  Hotel,
  MessageCircle,
  PackageOpen,
  PlaneTakeoff,
  Plus,
  Search,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import {
  getDepartureRows,
  getInvoiceRows,
  getPilgrimRows,
} from '@/lib/travel/module-data';

type ModuleName = 'jamaah' | 'keberangkatan' | 'pembayaran' | 'operasional' | 'website' | 'laporan';

const modules: Record<ModuleName, { title: string; description: string; action: string; icon: typeof UsersRound }> = {
  jamaah: { title: 'Jamaah & Pendaftaran', description: 'Cari jamaah, periksa biodata, dan buat pendaftaran baru.', action: 'Tambah jamaah', icon: UsersRound },
  keberangkatan: { title: 'Paket & Keberangkatan', description: 'Atur paket, jadwal, harga, dan kuota dalam satu tempat.', action: 'Buat keberangkatan', icon: CalendarDays },
  pembayaran: { title: 'Pembayaran Jamaah', description: 'Lihat tagihan, catat pembayaran, dan terbitkan kwitansi.', action: 'Catat pembayaran', icon: WalletCards },
  operasional: { title: 'Operasional Keberangkatan', description: 'Pantau dokumen, manifest, visa, hotel, kamar, dan perlengkapan.', action: 'Buka checklist', icon: PlaneTakeoff },
  website: { title: 'Kelola Website', description: 'Perbarui paket, artikel, galeri, testimoni, dan halaman publik.', action: 'Buat konten', icon: Globe2 },
  laporan: { title: 'Pusat Laporan', description: 'Unduh laporan jamaah, keuangan, dan kesiapan keberangkatan.', action: 'Unduh laporan', icon: FileBarChart },
};

function StatusBadge({ value }: { value: string }) {
  const good = ['Lengkap', 'Lunas', 'Dibuka'].includes(value);
  const warn = ['Perlu dilengkapi', 'Belum lunas', 'Cicilan', 'Hampir penuh'].includes(value);
  return <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-bold ${good ? 'bg-emerald-100 text-emerald-800' : warn ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'}`}>{value}</span>;
}

function SearchBar({ placeholder, defaultValue }: { placeholder: string; defaultValue?: string }) {
  return <form method="get" className="flex max-w-xl gap-2"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border bg-background px-4 focus-within:ring-2 focus-within:ring-primary"><Search className="size-5 text-muted-foreground" aria-hidden="true" /><span className="sr-only">Cari data</span><input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" name="q" defaultValue={defaultValue} placeholder={placeholder} autoComplete="off" /></label><button type="submit" className="min-h-12 rounded-lg border bg-background px-5 font-bold hover:bg-accent">Cari</button></form>;
}

function DataTable({ headers, rows, statusColumn }: { headers: string[]; rows: string[][]; statusColumn: number }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center"><strong className="text-lg">Data tidak ditemukan</strong><p className="mt-2 text-base text-muted-foreground">Coba kata pencarian lain atau tambahkan data baru.</p></div>;
  return <div className="overflow-x-auto rounded-xl border bg-card shadow-sm"><table className="w-full min-w-[760px] text-left"><thead className="bg-muted/60"><tr>{headers.map((header) => <th key={header} className="h-14 px-5 text-sm font-bold text-muted-foreground">{header}</th>)}</tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row[0]} className="hover:bg-muted/40">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className="h-20 px-5 text-[15px]">{index === 0 ? <strong>{cell}</strong> : index === statusColumn ? <StatusBadge value={cell} /> : cell}</td>)}<td className="px-5"><button type="button" className="min-h-11 rounded-lg px-4 font-bold text-primary hover:bg-accent">Lihat detail</button></td></tr>)}</tbody></table></div>;
}

function OperationalView() {
  const items = [
    ['Dokumen jamaah', '83%', '20 dokumen perlu dilengkapi', FileCheck2],
    ['Manifest', '42 jamaah', 'Data identitas sudah diperiksa', UsersRound],
    ['Visa', '35 selesai', '7 sedang diproses', BadgeCheck],
    ['Penerbangan', 'Siap', 'Saudia Airlines · SV 817', PlaneTakeoff],
    ['Hotel & kamar', '38 terisi', '4 jamaah belum mendapat kamar', Hotel],
    ['Perlengkapan', '91%', 'Mukena dan koper perlu ditambah', PackageOpen],
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(([title, value, detail, Icon]) => <article key={title} className="rounded-xl border bg-card p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-6" aria-hidden="true" /></span><StatusBadge value={title === 'Penerbangan' ? 'Lengkap' : title === 'Hotel & kamar' ? 'Perlu dilengkapi' : 'Sedang diperiksa'} /></div><h2 className="mt-5 text-xl font-bold">{title}</h2><strong className="mt-2 block text-3xl tabular-nums">{value}</strong><p className="mt-2 text-[15px] leading-6 text-muted-foreground">{detail}</p><button type="button" className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary">Buka rincian <ArrowRight className="size-5" /></button></article>)}</div>;
}

function WebsiteView() {
  const items = [['Paket publik', '3 paket terbit', PackageOpen], ['Artikel', '8 artikel terbit', FileCheck2], ['Galeri', '24 foto', Globe2], ['Testimoni', '12 testimoni', MessageCircle]] as const;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(([title, detail, Icon]) => <article key={title} className="rounded-xl border bg-card p-6 shadow-sm"><Icon className="size-7 text-primary" /><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-[15px] text-muted-foreground">{detail}</p><button type="button" className="mt-6 min-h-11 font-bold text-primary">Kelola {title.toLowerCase()}</button></article>)}</div>;
}

function ReportsView() {
  return <div className="grid gap-4 md:grid-cols-3">{[['Laporan jamaah', 'Data jamaah per paket dan keberangkatan', UsersRound], ['Laporan keuangan', 'Tagihan, pembayaran, piutang, dan pengeluaran', Banknote], ['Laporan operasional', 'Dokumen, visa, kamar, dan kesiapan', FileCheck2]].map(([title, detail, Icon]) => { const ReportIcon = Icon as typeof UsersRound; return <article key={title as string} className="rounded-xl border bg-card p-6 shadow-sm"><ReportIcon className="size-8 text-primary" /><h2 className="mt-5 text-xl font-bold">{title as string}</h2><p className="mt-2 min-h-14 text-[15px] leading-6 text-muted-foreground">{detail as string}</p><div className="mt-5 flex gap-2"><button type="button" className="min-h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground">Unduh Excel</button><button type="button" className="min-h-11 rounded-lg border px-4 font-bold">PDF</button></div></article>; })}</div>;
}

export default async function TravelModulePage({ params, searchParams }: { params: Promise<{ module: string }>; searchParams: Promise<{ q?: string }> }) {
  const { module: rawModule } = await params;
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim().slice(0, 100);
  if (!(rawModule in modules)) notFound();
  const moduleName = rawModule as ModuleName;
  const config = modules[moduleName];
  const { organizationId } = await requireOrganizationContext();
  const rows =
    moduleName === 'jamaah'
      ? await getPilgrimRows(organizationId, query)
      : moduleName === 'keberangkatan'
        ? await getDepartureRows(organizationId)
        : moduleName === 'pembayaran'
          ? await getInvoiceRows(organizationId, query)
          : [];

  const primaryAction = moduleName === 'jamaah'
    ? <Link href="/travel/jamaah/baru" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 text-base font-bold text-primary-foreground"><Plus className="size-5" aria-hidden="true" />{config.action}</Link>
    : <button type="button" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 text-base font-bold text-primary-foreground"><Plus className="size-5" aria-hidden="true" />{config.action}</button>;

  return <PageShell title={config.title} description={config.description} actions={primaryAction}>
    {moduleName === 'jamaah' ? <><SearchBar placeholder="Cari nama, nomor WhatsApp, atau nomor jamaah…" defaultValue={query} /><DataTable headers={['Nama jamaah', 'Nomor jamaah', 'WhatsApp', 'Dokumen', 'Paket', 'Tindakan']} rows={rows} statusColumn={3} /></> : null}
    {moduleName === 'keberangkatan' ? <><div className="grid gap-4 sm:grid-cols-3">{[['Paket aktif',String(rows.length)],['Data ditampilkan',String(rows.length)],['Sumber data','Database']].map(([label,value]) => <article key={label} className="rounded-xl border bg-card p-5"><p className="text-[15px] text-muted-foreground">{label}</p><strong className="mt-2 block text-3xl tabular-nums">{value}</strong></article>)}</div><DataTable headers={['Paket', 'Tanggal berangkat', 'Kuota', 'Mulai dari', 'Status', 'Tindakan']} rows={rows} statusColumn={4} /></> : null}
    {moduleName === 'pembayaran' ? <><SearchBar placeholder="Cari invoice atau nama jamaah…" defaultValue={query} /><DataTable headers={['Nomor invoice', 'Jamaah', 'Tagihan', 'Terbayar', 'Status', 'Tindakan']} rows={rows} statusColumn={4} /></> : null}
    {moduleName === 'operasional' ? <OperationalView /> : null}
    {moduleName === 'website' ? <WebsiteView /> : null}
    {moduleName === 'laporan' ? <ReportsView /> : null}
  </PageShell>;
}
