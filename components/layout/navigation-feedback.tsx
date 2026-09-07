'use client';

import { useLinkStatus } from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function NavigationFeedback() {
  const { pending } = useLinkStatus();
  const t = useTranslations('travelSimple');
  if (!pending) return null;
  return <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" /><span className="sr-only">{t('loading')}</span></span>;
}
