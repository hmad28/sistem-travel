import { getTranslations } from 'next-intl/server';
import { LoaderCircle } from 'lucide-react';

export default async function LoadingPage() {
  const t = await getTranslations('travelSimple');
  return (
    <div
      role="status"
      className="flex min-h-[60vh] items-center justify-center gap-3 bg-white px-6 text-lg text-slate-800"
    >
      <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
      {t('loading')}
    </div>
  );
}
