import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPublicSite } from '@/lib/travel/public-site';
import { PublicShell } from '@/components/public/site-shell';
import { PilgrimVideo } from '@/components/public/pilgrim-video';
export default async function Page({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const data = await getPublicSite();
  if (!['page', 'article', 'gallery', 'testimonial'].includes(kind)) notFound();
  const entry = data.content[kind as 'page'].find((e) => e.id === id);
  if (!entry) notFound();
  return (
    <PublicShell data={data}>
      <article className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-4xl font-bold">{entry.title}</h1>
        {entry.videoUrl ? (
          <div className="mx-auto my-8 max-w-[360px]">
            <PilgrimVideo url={entry.videoUrl} title={entry.title} poster={entry.image} />
          </div>
        ) : (
          entry.image && (
            <Image
              src={entry.image}
              alt={entry.title}
              width={1200}
              height={750}
              sizes="(min-width:900px) 850px, 100vw"
              className="my-8 max-h-[520px] w-full rounded-xl object-cover"
            />
          )
        )}
        <div className="mt-8 whitespace-pre-line text-lg leading-8">{entry.body}</div>
      </article>
    </PublicShell>
  );
}
