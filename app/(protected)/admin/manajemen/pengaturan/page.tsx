import { getTranslations } from 'next-intl/server';
import { KeyRound, Globe2, ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';

export default async function TravelSettings() {
  const { organization } = await requireOrganizationContext();
  const t = await getTranslations('travelSimple');
  return (
    <PageShell title={t('settings')} description={t('settingsHint')}>
      <section className="max-w-3xl overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-6">
          <p className="text-muted-foreground">{t('travelName')}</p>
          <h2 className="mt-2 text-xl font-semibold">{organization.name}</h2>
        </div>
        {[
          [KeyRound, t('account'), t('accountHint'), '/administrations/users/profile/edit'],
          [Globe2, t('website'), t('websiteHint'), '/admin/cms/pengaturan'],
        ].map(([Icon, title, description, href]) => {
          const ItemIcon = Icon as typeof KeyRound;
          return (
            <Link
              key={href as string}
              href={href as string}
              className="flex min-h-24 items-center gap-4 border-b p-6 last:border-0 hover:bg-muted/40"
            >
              <ItemIcon className="size-6 shrink-0 text-primary" />
              <span className="flex-1">
                <strong className="block text-lg">{title as string}</strong>
                <span className="mt-1 block text-muted-foreground">{description as string}</span>
              </span>
              <ArrowRight className="size-5" />
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
