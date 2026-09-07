import { z } from 'zod';

export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    let id: string | null = null;
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      id =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : (/^\/(?:shorts|embed)\/([^/]+)$/.exec(url.pathname)?.[1] ?? null);
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const contentEntrySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(2).max(200),
  body: z.string().max(30000),
  image: z.string().max(1000),
  mobileImage: z.string().max(1000).default(''),
  videoUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => !v || youtubeId(v) !== null)
    .default(''),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  revision: z.number().int().min(0).default(0),
  link: z
    .string()
    .regex(/^\/(?!\/)[a-zA-Z0-9/?=&_#.-]*$/)
    .or(z.literal('')),
  published: z.boolean(),
});
export type ContentEntry = z.infer<typeof contentEntrySchema>;
export function sortContent(entries: ContentEntry[]) {
  return [...entries].sort((a, b) => a.sortOrder - b.sortOrder);
}
