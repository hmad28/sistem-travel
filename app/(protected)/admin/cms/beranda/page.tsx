import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/components/layout';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { getHomeContent } from '@/lib/travel/home-content';
import { homeKeys, type HomeKey } from '@/lib/validation/home-content';
import { HomeContentForm } from '@/components/travel/home-content-form';
export default async function Page() {
  const context = await requireOrganizationContext();
  const t = await getTranslations('homeEditor');
  if (!hasSessionPermission(context.user, 'cms', 'edit', context.organizationId)) return <p>{t('denied')}</p>;
  const [content, defaults] = await Promise.all([getHomeContent(context.organizationId), getTranslations('publicSite')]);
  const values = Object.fromEntries(homeKeys.map(key => [key, content.draft[key] ?? content.published[key] ?? defaults(key)])) as Record<HomeKey, string>;
  return <PageShell title={t('title')} description={t('description')}><HomeContentForm values={values} revision={content.revision} /></PageShell>;
}
