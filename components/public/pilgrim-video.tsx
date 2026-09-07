'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { youtubeId } from '@/lib/validation/travel-content';

export function PilgrimVideo({ url, title, poster }: { url: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const t = useTranslations('contentEditor');
  const id = youtubeId(url);
  if (!id) return null;
  return <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#142b59] text-white">
    {playing ? <>
      <iframe className="h-full w-full border-0" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      <button type="button" className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white text-[#195acb] focus-visible:outline-4" aria-label={t('stopVideo')} onClick={()=>setPlaying(false)}><X /></button>
    </> : <button type="button" className="group relative flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center focus-visible:outline-4 focus-visible:outline-offset-[-4px]" onClick={()=>setPlaying(true)} aria-label={t('playVideo', { title })}>
      {poster && <Image src={poster} alt="" fill sizes="(min-width:1024px) 360px, 85vw" className="object-cover" />}
      <span className="absolute inset-0 bg-gradient-to-t from-[#142b59] via-[#142b59]/20 to-transparent" />
      <span className="relative grid size-16 place-items-center rounded-full bg-white text-[#195acb] transition-transform group-hover:scale-110"><Play className="size-7" /></span>
      <span className="absolute inset-x-5 bottom-6 text-left"><strong className="block text-xl leading-7">{title}</strong><span className="mt-3 block text-base">{t('videoPrivacy')}</span></span>
    </button>}
  </div>;
}
