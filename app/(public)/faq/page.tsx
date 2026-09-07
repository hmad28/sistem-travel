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
        title={t('faqTitle')}
        description={t('faqDescription')}
        image="/images/makkah.jpg"
      />
      <div className={s.container}>
        <div className={s.faq}>
          {data.content.faq.length ? data.content.faq.map(entry => <details key={entry.id}><summary>{entry.title}</summary><p className="whitespace-pre-line">{entry.body}</p></details>) : ['choose', 'register', 'documents', 'elderly', 'payment', 'schedule'].map((key) => (
            <details key={key}>
              <summary>{t(`faq.${key}.question`)}</summary>
              <p>{t(`faq.${key}.answer`)}</p>
            </details>
          ))}
        </div>
        <Consultation data={data} />
      </div>
    </PublicShell>
  );
}
