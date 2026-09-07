import { getTranslations } from 'next-intl/server';
import { getPublicSite } from '@/lib/travel/public-site';
import { PublicShell, CategoryHero } from '@/components/public/site-shell';
import { InquiryForm } from '@/components/public/inner-contact';
import s from '@/components/public/inner.module.css';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const [data, t, search] = await Promise.all([
    getPublicSite(),
    getTranslations('publicInner'),
    searchParams,
  ]);
  return (
    <PublicShell data={data}>
      <CategoryHero
        title={t('contactTitle')}
        description={t('contactDescription')}
        image="/images/makkah-city.png"
      />
      <div className={s.container}>
        <div className={s.detailGrid}>
          <section className={s.panel}>
            <h2>{t('contactInformation')}</h2>
            <h3>{data.brand.name}</h3>
            {data.contact.phone && (
              <>
                <h3>{t('phone')}</h3>
                <a
                  className={s.contactLink}
                  href={`tel:${data.contact.phone.replace(/[^+\d]/g, '')}`}
                >
                  {data.contact.phone}
                </a>
              </>
            )}
            {data.contact.email && (
              <>
                <h3>{t('email')}</h3>
                <a className={s.contactLink} href={`mailto:${data.contact.email}`}>
                  {data.contact.email}
                </a>
              </>
            )}
            {data.contact.address && (
              <>
                <h3>{t('address')}</h3>
                <p>{data.contact.address}</p>
              </>
            )}
            {!data.contact.phone && !data.contact.whatsapp && !data.contact.email && (
              <p>{t('contactUnavailable')}</p>
            )}
            <p>{t('consultationSteps')}</p>
          </section>
          <section className={s.panel}>
            <h2>{t('consultTitle')}</h2>
            <InquiryForm
              whatsapp={data.contact.whatsapp}
              packages={data.packages.map((p) => p.name)}
              selected={search.paket}
            />
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
