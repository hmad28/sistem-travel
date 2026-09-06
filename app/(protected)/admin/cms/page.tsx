import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe2,
  Images,
  MessageSquareQuote,
  PackageOpen,
  Palette,
} from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';

const contentSections = [
  {
    title: 'Paket di website',
    description: 'Atur paket yang tampil, harga awal, fasilitas, dan urutan tampil.',
    href: '/travel/keberangkatan',
    icon: PackageOpen,
    action: 'Kelola paket',
  },
  {
    title: 'Halaman website',
    description: 'Siapkan profil travel, legalitas, kontak, dan informasi pelayanan.',
    href: '/administrations/system',
    icon: FileText,
    action: 'Kelola halaman',
  },
  {
    title: 'Logo dan warna',
    description: 'Sesuaikan identitas visual website dengan merek travel.',
    href: '/administrations/system/theme',
    icon: Palette,
    action: 'Atur tampilan',
  },
  {
    title: 'Galeri perjalanan',
    description: 'Kumpulkan foto kegiatan untuk meningkatkan kepercayaan calon jamaah.',
    href: '/admin/cms',
    icon: Images,
    action: 'Segera tersedia',
    disabled: true,
  },
  {
    title: 'Testimoni jamaah',
    description: 'Kelola cerita dan pengalaman jamaah yang ditampilkan di website.',
    href: '/admin/cms',
    icon: MessageSquareQuote,
    action: 'Segera tersedia',
    disabled: true,
  },
] as const;

export default async function CmsDashboardPage() {
  const context = await requireOrganizationContext();
  const canView = hasSessionPermission(context.user, 'cms', 'view', context.organizationId);

  return (
    <PageShell
      title="Website & Konten"
      description="Perbarui informasi yang dilihat calon jamaah tanpa perlu mengubah kode."
    >
      {!canView ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Akses CMS belum diberikan</h2>
          <p className="mt-2 text-base leading-7">Hubungi pemilik travel untuk meminta izin mengelola konten website.</p>
        </div>
      ) : (
        <>
          <section className="grid overflow-hidden rounded-xl border bg-white shadow-[0_2px_8px_rgba(25,52,47,.04)] lg:grid-cols-[1fr_360px]">
            <div className="p-6"><div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><span className="size-2.5 rounded-full bg-emerald-500" /> Website aktif</div><h2 className="mt-3 text-2xl font-bold">Hammad Tour</h2><p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">Paket yang diterbitkan akan tampil langsung pada halaman depan. Periksa kembali harga dan jadwal sebelum menerbitkan.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground"><Globe2 className="size-4" /> Lihat website</Link><Link href="/travel/keberangkatan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold">Kelola paket</Link></div></div>
            <div className="border-t bg-[#f8faf9] p-6 lg:border-l lg:border-t-0"><p className="text-xs font-extrabold tracking-[.12em] text-muted-foreground">STATUS KONTEN</p><div className="mt-4 grid gap-3">{['Identitas travel terisi', 'Paket aktif tersedia', 'Kontak WhatsApp terhubung'].map((item) => <p key={item} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-5 text-emerald-600" /> {item}</p>)}</div></div>
          </section>

          <section className="overflow-hidden rounded-xl border bg-white" aria-label="Bagian CMS">
            <header className="border-b px-5 py-4"><h2 className="text-lg font-bold">Bagian website</h2><p className="mt-1 text-sm text-muted-foreground">Pilih bagian yang ingin diperbarui.</p></header>
            <div className="divide-y">
            {contentSections.map((item) => {
              const Icon = item.icon;
              const disabled = 'disabled' in item && item.disabled;
              const body = <><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary"><Icon className="size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-[15px]">{item.title}</strong><small className="mt-1 block text-sm leading-5 text-muted-foreground">{item.description}</small></span><span className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold ${disabled ? 'bg-muted text-muted-foreground' : 'text-primary'}`}>{item.action}{!disabled ? <ArrowRight className="size-4" aria-hidden="true" /> : null}</span></>;
              return disabled
                ? <article key={item.title} className="flex min-h-20 items-center gap-4 bg-muted/15 px-5 py-4 opacity-75">{body}</article>
                : <Link key={item.title} href={item.href} className="flex min-h-20 items-center gap-4 px-5 py-4 hover:bg-[#f7faf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{body}</Link>;
            })}
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}
