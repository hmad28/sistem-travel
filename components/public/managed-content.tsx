import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { PublicSiteData } from '@/lib/travel/public-site';
import s from './public.module.css';
import { PilgrimVideo } from './pilgrim-video';
export async function ManagedContent({data}:{data:PublicSiteData}) {
  const t = await getTranslations('contentEditor');
  return <>{(['page','article','gallery','testimonial','faq'] as const).map(kind => data.content[kind].length > 0 && <section className={s.section} key={kind} id={kind}><div className={s.container}><h2>{t(kind)}</h2><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.content[kind].map(entry => kind === 'faq' ? <details key={entry.id} className="rounded-xl border p-5"><summary className="cursor-pointer font-semibold">{entry.title}</summary><p className="mt-4 whitespace-pre-line leading-7">{entry.body}</p></details> : <article key={entry.id} className="overflow-hidden rounded-xl border bg-white">
    {/* CMS upload URLs are validated against the organization's upload records. */}
    {kind === 'testimonial' && entry.videoUrl ? <PilgrimVideo url={entry.videoUrl} title={entry.title} poster={entry.image} /> : entry.image && <Image src={entry.image} alt={entry.title} width={800} height={450} sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="aspect-video w-full object-cover" />}
    <div className="space-y-3 p-5"><h3 className="text-xl font-bold">{entry.title}</h3><p className="whitespace-pre-line leading-7">{entry.body.slice(0,220)}</p><Link className="inline-flex min-h-11 items-center font-semibold text-blue-700" href={entry.link || `/informasi/${kind}/${entry.id}`}>{t('read')}</Link></div>
  </article>)}</div></div></section>)}</>;
}
