import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, MessageCircle, Plane, Compass } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublicSite } from '@/lib/travel/public-site';
import { PublicShell, PackageCard } from '@/components/public/site-shell';
import s from '@/components/public/public.module.css';
import h from '@/components/public/home.module.css';
import { ManagedContent } from '@/components/public/managed-content';
import { BannerCarousel } from '@/components/public/banner-carousel';

export default async function Home() {
  const [data, defaults] = await Promise.all([getPublicSite(), getTranslations('publicSite')]);
  const t = (key: string) => data.homeText[key] || defaults(key);
  return (
    <PublicShell data={data}>
      {data.content.banner.some(e=>e.image) ? <BannerCarousel entries={data.content.banner.filter(e=>e.image)} /> : <section className={h.hero}>
        <Image
          src="/images/makkah.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={h.heroPhoto}
        />
        <div className={h.shade} />
        <div className={s.container}>
          <div className={h.heroCopy}>
            <span className={h.eyebrow}>{t('heroTag')}</span>
            <h1>{t('heroTitle')}</h1>
            <p>{t('heroDescription')}</p>
            <div className={h.heroActions}>
              <Link href="/umroh" className={`${s.button} ${s.orange}`}>
                {t('browse')}
                <ArrowRight className="size-5" />
              </Link>
              <Link href="/kontak" className={h.secondary}>
                <MessageCircle className="size-5" />
                {t('consult')}
              </Link>
            </div>
          </div>
        </div>
      </section>}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.kicker}>{data.brand.name}</span>
              <h2>{t('serviceTitle')}</h2>
              <p>{t('serviceDescription')}</p>
            </div>
          </div>
          <div className={h.services}>
            {[
              [Plane, 'umroh', 'umrohText', '/umroh'],
              [CalendarDays, 'haji', 'hajiText', '/haji'],
              [Compass, 'tour', 'tourText', '/wisata-halal'],
            ].map(([Icon, title, text, href]) => {
              const ServiceIcon = Icon as typeof Plane;
              return (
                <Link key={href as string} href={href as string} className={h.service}>
                  <span>
                    <ServiceIcon className="size-7" />
                  </span>
                  <div>
                    <h3>{t(title as string)}</h3>
                    <p>{t(text as string)}</p>
                  </div>
                  <ArrowRight className="size-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className={`${s.section} ${s.soft}`}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.kicker}>{t('services')}</span>
              <h2>{t('recommended')}</h2>
              <p>{t('recommendedText')}</p>
            </div>
            <Link className={s.button} href="/umroh">
              {t('all')}
              <ArrowRight className="size-5" />
            </Link>
          </div>
          {data.packages.length ? (
            <div className={s.grid}>
              {data.packages.slice(0, 3).map((item) => (
                <PackageCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className={s.empty}>{t('none')}</p>
          )}
        </div>
      </section>
      <section className={s.section}>
        <div className={`${s.container} ${h.guidance}`}>
          <div className={h.guideImage}>
            <Image src="/images/makkah-city.png" alt="" fill sizes="(min-width:1000px) 40vw, 100vw" />
          </div>
          <div>
            <span className={s.kicker}>{t('information')}</span>
            <h2>{t('stepsTitle')}</h2>
            <p className={h.intro}>{t('stepsText')}</p>
            <ol className={h.steps}>
              {[1, 2, 3].map((number) => (
                <li key={number}>
                  <span>{number}</span>
                  <div>
                    <h3>{t(`step${number}`)}</h3>
                    <p>{t(`step${number}Text`)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/faq" className={h.textLink}>
              {t('faq')}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
      <section className={h.contact}>
        <div className={`${s.container} ${h.contactInner}`}>
          <div>
            <h2>{t('helpTitle')}</h2>
            <p>{t('helpText')}</p>
          </div>
          <Link href="/kontak" className={`${s.button} ${s.orange}`}>
            {t('helpAction')}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
      <ManagedContent data={data} />
    </PublicShell>
  );
}
