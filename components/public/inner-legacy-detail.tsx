import { notFound, redirect } from 'next/navigation';
import { getPublicSite } from '@/lib/travel/public-site';
export async function LegacyDetail({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; slug?: string }>;
}) {
  const [search, data] = await Promise.all([searchParams, getPublicSite()]);
  const item = data.packages.find((item) => item.id === search.id || item.slug === search.slug);
  if (!item) notFound();
  redirect(`/paket/${item.slug}`);
}
