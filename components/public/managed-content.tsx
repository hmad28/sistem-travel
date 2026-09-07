import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { PublicSiteData } from '@/lib/travel/public-site';
import s from './public.module.css';
import { PilgrimVideo } from './pilgrim-video';
import { GalleryMarquee } from './gallery-marquee';

export async function ManagedContent({data}:{data:PublicSiteData}) {
  const t=await getTranslations('contentEditor');
  return <>{(['article','gallery','testimonial','faq'] as const).map(kind=>data.content[kind].length>0&&<section className={s.section} key={kind} id={kind}><div className={s.container}><h2>{t(kind)}</h2>
    {kind==='gallery'?<GalleryMarquee entries={data.content.gallery}/>:kind==='faq'?<div className="mt-8 divide-y border-y border-slate-200">{data.content.faq.map(e=><details key={e.id} className="py-5"><summary className="min-h-11 cursor-pointer content-center pr-5 text-lg font-semibold">{e.title}</summary><p className="max-w-4xl whitespace-pre-line pb-3 pt-3 leading-8">{e.body}</p></details>)}</div>:<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.content[kind].map(e=>kind==='testimonial'?<div key={e.id}>{e.videoUrl?<PilgrimVideo url={e.videoUrl} title={e.title} poster={e.image}/>:e.image&&<Image src={e.image} alt={e.title} width={360} height={640} className="aspect-[9/16] w-full rounded-2xl object-cover"/>}</div>:<article key={e.id} className="overflow-hidden rounded-xl border bg-white">{e.image&&<Image src={e.image} alt={e.title} width={800} height={450} className="aspect-video w-full object-cover"/>}<div className="space-y-3 p-5"><h3>{e.title}</h3><p className="whitespace-pre-line leading-7">{e.body.slice(0,220)}</p><Link className="inline-flex min-h-11 items-center font-semibold text-blue-700" href={e.link||`/informasi/${kind}/${e.id}`}>{t('read')}</Link></div></article>)}</div>}
  </div></section>)}</>;
}
