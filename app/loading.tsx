import { getTranslations } from 'next-intl/server';
import { PublicLoading } from '@/components/public/public-loading';

export default async function LoadingPage() {
  const t = await getTranslations('publicLoading');
  return <PublicLoading title={t('title')} description={t('description')} />;
}
