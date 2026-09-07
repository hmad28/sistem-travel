import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, Plane, Menu } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand';
import type { PublicPackage, PublicSiteData } from '@/lib/travel/public-site';
import { formatIdr, formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';
import s from './public.module.css';
import { VisitorTracker } from './visitor-tracker';

export async function PublicShell({
  data,
  children,
}: {
  data: PublicSiteData;
  children: React.ReactNode;
}) {
  const t = await getTranslations('publicSite');
  const links = [
    ['/umroh', 'umroh'],
    ['/umroh-plus', 'plus'],
    ['/haji', 'haji'],
    ['/wisata-halal', 'tour'],
    ['/kontak', 'contact'],
  ] as const;
  return (
    <div className={s.site}>
      <VisitorTracker />
      <header className={s.header}>
        <div className={`${s.container} ${s.headerInner}`}>
          <Link href="/" className={s.logo}>
            <BrandLogo name={data.brand.name} logoUrl={data.brand.logoUrl} className="size-11" />
            <span>
              <strong>{data.brand.name}</strong>
              <small>{t('tagline')}</small>
            </span>
          </Link>
          <nav className={s.nav} aria-label={t('navigation')}>
            {links.map(([href, key]) => (
              <Link href={href} key={href}>
                {t(key)}
              </Link>
            ))}
            <Link href="/kontak" className={s.button}>
              {t('consult')}
            </Link>
          </nav>
          <details className={s.mobileNav}>
            <summary aria-label={t('menu')}>
              <Menu />
            </summary>
            <nav aria-label={t('navigation')}>
              {links.map(([href, key]) => (
                <Link href={href} key={href}>
                  {t(key)}
                </Link>
              ))}
              <Link href="/faq">{t('faq')}</Link>
            </nav>
          </details>
        </div>
      </header>
      <main>{children}</main>
      <footer className={s.footer}>
        <div className={s.container}>
          <div className={s.footerGrid}>
            <div>
              <strong>{data.brand.name}</strong>
              <p>{t('footerDescription')}</p>
              {data.contact.address && <p>{data.contact.address}</p>}
            </div>
            <div>
              <h3>{t('services')}</h3>
              {links.slice(0, 4).map(([href, key]) => (
                <Link key={href} href={href}>
                  {t(key)}
                </Link>
              ))}
            </div>
            <div>
              <h3>{t('information')}</h3>
              <Link href="/tentang">{t('about')}</Link>
              <Link href="/faq">{t('faq')}</Link>
              <Link href="/kontak">{t('contact')}</Link>
              <Link href="/auth/login">{t('staff')}</Link>
            </div>
          </div>
          <div className={s.copyright}>
            <span>
              © {new Date().getFullYear()} {data.brand.name}
            </span>
            <span>Powered by Hammad Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function CategoryHero({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className={s.hero}>
      <div className={`${s.container} ${s.heroInner}`}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className={s.heroImage}>
          <Image src={image} alt="" fill priority sizes="(min-width: 1000px) 45vw, 100vw" />
        </div>
      </div>
    </section>
  );
}

export async function PackageCard({ item }: { item: PublicPackage }) {
  const t = await getTranslations('publicSite');
  return (
    <article className={s.card}>
      <Link href={`/paket/${item.slug}`} className={s.cardPhoto} aria-label={item.name}>
        <Image src={item.image} alt="" fill sizes="(min-width: 1000px) 33vw, 100vw" />
      </Link>
      <div className={s.cardBody}>
        <h3>
          <Link href={`/paket/${item.slug}`}>{item.name}</Link>
        </h3>
        <div className={s.facts}>
          <span>
            <Clock3 className="size-4" />
            {t('days', { count: item.durationDays })}
          </span>
          <span>
            <CalendarDays className="size-4" />
            {item.departureDate
              ? formatIndonesianDate.format(parseDatabaseDate(item.departureDate))
              : t('askSchedule')}
          </span>
          {item.airline && (
            <span>
              <Plane className="size-4" />
              {item.airline}
            </span>
          )}
        </div>
        <div className={s.price}>
          <small>{t('from')}</small>
          <strong>{formatIdr.format(item.startingPrice)}</strong>
        </div>
        <Link className={s.cardLink} href={`/paket/${item.slug}`}>
          {t('details')}
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </article>
  );
}
