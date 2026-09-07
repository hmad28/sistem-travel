import { getTranslations } from 'next-intl/server';
import { LoaderCircle } from 'lucide-react';

export default async function Loading() {
  const t = await getTranslations('travelSimple');
  return (
    <div role="status" aria-live="polite" className="space-y-6 py-4">
      <div className="flex items-center gap-3 text-lg font-semibold">
        <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
        {t('loading')}
      </div>
      <p className="text-muted-foreground">{t('loadingHint')}</p>
      <div
        aria-hidden
        className="h-64 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
      />
    </div>
  );
}
