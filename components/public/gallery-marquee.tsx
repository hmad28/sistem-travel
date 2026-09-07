'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ContentEntry } from '@/lib/validation/travel-content';
import s from './gallery-marquee.module.css';
export function GalleryMarquee({entries}:{entries:ContentEntry[]}) {
  const [paused,setPaused]=useState(false);const t=useTranslations('contentEditor');
  const images=entries.filter(e=>e.image);if(!images.length)return null;
  return <div className={s.gallery} data-paused={paused}>
    <div className={s.toolbar}><button type="button" onClick={()=>setPaused(p=>!p)}>{paused?<Play size={18}/>:<Pause size={18}/>} {t(paused?'playGallery':'pauseGallery')}</button></div>
    {[images,[...images].reverse()].map((row,r)=><div key={r} className={s.viewport}><div className={`${s.track} ${r?s.reverse:''}`}>
      {[0,1].map(copy=><div className={s.group} key={copy} aria-hidden={copy===1}>{Array.from({length:Math.max(4,row.length)},(_,i)=>row[i%row.length]).map((e,i)=><figure key={`${e.id}-${i}`}><Image src={e.image} alt={copy?'':e.title} width={640} height={440} sizes="(max-width:767px) 260px, 360px" /><figcaption>{e.title}</figcaption></figure>)}</div>)}
    </div></div>)}
  </div>;
}
