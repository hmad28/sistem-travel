import { CataloguePage, type CatalogueSearch } from '@/components/public/inner-pages';
export default async function Page({ searchParams }: { searchParams: Promise<CatalogueSearch> }) {
  return <CataloguePage kind="haji" search={await searchParams} />;
}
