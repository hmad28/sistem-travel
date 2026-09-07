'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ContentEntry } from '@/lib/travel/content';
import s from './banner-carousel.module.css';
export function BannerCarousel({entries}:{entries:ContentEntry[]}) {
  const [active,setActive]=useState(0); const [paused,setPaused]=useState(false);
  const t=useTranslations('carousel');
  useEffect(()=>{ if(paused || entries.length<2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const timer=setInterval(()=>setActive(i=>(i+1)%entries.length),6000); return ()=>clearInterval(timer); },[paused,entries.length]);
  if(!entries.length) return null;
  return <section className={s.carousel} aria-label={t('title')}>
    {entries.map((entry,index)=><div key={entry.id} className={`${s.slide} ${index===active?s.active:''}`} aria-hidden={index!==active} inert={index!==active}>
      {entry.image && <BannerImage entry={entry} first={index===0} />}
      {entry.body && <div className={s.copy}><h1>{entry.title}</h1><p>{entry.body}</p></div>}
      {entry.link && <Link href={entry.link} className={s.target} aria-label={entry.title} />}
    </div>)}
    <button className={`${s.arrow} ${s.previous}`} type="button" aria-label={t('previous')} onClick={()=>setActive(i=>(i-1+entries.length)%entries.length)}><ChevronLeft /></button>
    <button className={`${s.arrow} ${s.next}`} type="button" aria-label={t('next')} onClick={()=>setActive(i=>(i+1)%entries.length)}><ChevronRight /></button>
    <div className={s.controls}><span>{active+1} / {entries.length}</span><button type="button" aria-label={t(paused?'play':'pause')} onClick={()=>setPaused(p=>!p)}>{paused?<Play />:<Pause />}</button></div>
  </section>;
}

function BannerImage({entry, first}:{entry:ContentEntry;first:boolean}) {
  const {props} = getImageProps({src:entry.image,alt:entry.title,fill:true,sizes:'100vw',loading:first?'eager':'lazy'});
  const mobile = entry.mobileImage ? getImageProps({src:entry.mobileImage,alt:entry.title,width:780,height:1386,sizes:'100vw'}).props : null;
  return <picture>{mobile && <source media="(max-width:1023px)" srcSet={mobile.srcSet} sizes="100vw" />}
    {/* Responsive art direction uses Next-generated optimized image candidates. */}
    <img {...props} alt={entry.title} fetchPriority={first?'high':undefined} />
  </picture>;
}
