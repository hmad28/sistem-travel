'use client';

import { useTranslations } from 'next-intl';

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('travelSimple');
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-6 text-center text-slate-800">
      <h1 className="text-2xl font-bold">{t('loadError')}</h1>
      <p>{t('loadErrorHint')}</p>
      <button
        onClick={reset}
        className="min-h-12 rounded-lg bg-blue-700 px-6 font-semibold text-white"
      >
        {t('retry')}
      </button>
    </main>
  );
}
