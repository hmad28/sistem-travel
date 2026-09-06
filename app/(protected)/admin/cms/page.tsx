import {
  ArrowRight,
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
      title="CMS Website"
      description="Kelola informasi yang dilihat calon jamaah di website publik."
    >
      {!canView ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Akses CMS belum diberikan</h2>
          <p className="mt-2 text-base leading-7">Hubungi pemilik travel untuk meminta izin mengelola konten website.</p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-5 rounded-xl bg-[#103f39] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold tracking-[.12em] text-[#ecd28d]">WEBSITE PUBLIK</p>
              <h2 className="mt-2 text-2xl font-bold">Hammad Tour</h2>
              <p className="mt-2 text-base leading-7 text-white/70">Perubahan paket yang diterbitkan akan dibaca langsung oleh halaman depan.</p>
            </div>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 font-bold text-[#103f39]">
              <Globe2 className="size-5" aria-hidden="true" /> Lihat website
            </Link>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Bagian CMS">
            {contentSections.map((item) => {
              const Icon = item.icon;
              const disabled = 'disabled' in item && item.disabled;
              const body = <><span className="grid size-12 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-6" aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold">{item.title}</h2><p className="mt-2 min-h-14 text-base leading-7 text-muted-foreground">{item.description}</p><span className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary">{item.action}{!disabled ? <ArrowRight className="size-5" aria-hidden="true" /> : null}</span></>;
              return disabled
                ? <article key={item.title} className="rounded-xl border bg-muted/30 p-6 opacity-75">{body}</article>
                : <Link key={item.title} href={item.href} className="rounded-xl border bg-card p-6 shadow-sm transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{body}</Link>;
            })}
          </section>
        </>
      )}
    </PageShell>
  );
}
