import { getTranslations } from 'next-intl/server';
import { getPublicSite } from '@/lib/travel/public-site';
import { PublicShell, CategoryHero } from '@/components/public/site-shell';
import { Consultation } from '@/components/public/inner-pages';
import s from '@/components/public/inner.module.css';
export default async function Page() {
  const [data, t] = await Promise.all([getPublicSite(), getTranslations('publicInner')]);
  return (
    <PublicShell data={data}>
      <CategoryHero
        title={t('aboutTitle', { brand: data.brand.name })}
        description={t('aboutDescription')}
        image="/images/makkah-city.png"
      />
      <div className={s.container}>
        <div className={`${s.panel} ${s.narrow}`}>
          <h2>{t('aboutHeading')}</h2>
          <p>{t('aboutBody', { brand: data.brand.name })}</p>
          <h3>{t('beforeBooking')}</h3>
          <p>{t('beforeBookingBody')}</p>
        </div>
        <Consultation data={data} />
      </div>
    </PublicShell>
  );
}
