import { notFound } from 'next/navigation';
import { getPublicSite } from '@/lib/travel/public-site';
import { PackageDetail } from '@/components/public/inner-pages';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, data] = await Promise.all([params, getPublicSite()]);
  const item = data.packages.find((item) => item.slug === slug);
  if (!item) notFound();
  return <PackageDetail item={item} data={data} />;
}
