import Link from 'next/link';
import { CalendarDays, Check, Clock3, MapPin, Plane, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublicSite, type PublicSiteData, type PublicPackage } from '@/lib/travel/public-site';
import { PublicShell, CategoryHero, PackageCard } from './site-shell';
import { formatIdr, formatIndonesianDate, parseDatabaseDate } from '@/lib/travel/format';
import s from './inner.module.css';

export type CatalogueKind = 'umroh' | 'plus' | 'haji' | 'tour' | 'padang';
export type CatalogueSearch = Record<string, string | string[] | undefined>;
function value(search: CatalogueSearch, key: string) {
  const v = search[key];
  return typeof v === 'string' ? v : '';
}
function matches(item: PublicPackage, kind: CatalogueKind) {
  return kind === 'haji'
    ? item.type === 'HAJJ'
    : kind === 'tour'
      ? item.type === 'TOUR'
      : kind === 'plus'
        ? item.type === 'UMRAH' && /plus/i.test(item.name)
        : kind === 'padang'
          ? item.type === 'UMRAH' && /padang|pdg/i.test(item.departureAirport)
          : item.type === 'UMRAH';
}
export async function Consultation({ data }: { data: PublicSiteData }) {
  const t = await getTranslations('publicInner');
  return (
    <section className={s.cta}>
      <div>
        <h2>{t('consultTitle')}</h2>
        <p>{t('consultDescription', { brand: data.brand.name })}</p>
      </div>
      <Link href="/kontak" className={s.button}>
        {t('consult')}
        <ArrowRight size={20} />
      </Link>
    </section>
  );
}
export async function CataloguePage({
  kind,
  search = {},
}: {
  kind: CatalogueKind;
  search?: CatalogueSearch;
}) {
  const [data, t] = await Promise.all([getPublicSite(), getTranslations('publicInner')]);
  const all = data.packages.filter((item) => matches(item, kind));
  const query = value(search, 'q');
  const month = value(search, 'month');
  const sort = value(search, 'sort');
  const packages = all
    .filter(
      (item) =>
        (!query || item.name.toLowerCase().includes(query.toLowerCase())) &&
        (!month || item.departureDate?.slice(0, 7) === month)
    )
    .sort((a, b) =>
      sort === 'price-desc'
        ? b.startingPrice - a.startingPrice
        : sort === 'date'
          ? (a.departureDate ?? '9999').localeCompare(b.departureDate ?? '9999')
          : a.startingPrice - b.startingPrice
    );
  const months = [
    ...new Set(all.map((item) => item.departureDate?.slice(0, 7)).filter((v): v is string => !!v)),
  ].sort();
  const programme = kind === 'haji' || kind === 'plus';
  return (
    <PublicShell data={data}>
      <CategoryHero
        title={t(`${kind}Title`)}
        description={t(`${kind}Description`)}
        image={kind === 'haji' ? '/images/makkah.jpg' : '/images/makkah-city.png'}
      />
      <div className={s.container}>
        {programme && (
          <div className={s.programIntro}>
            <h2 className={s.heading}>{t('chooseProgramme')}</h2>
            <p>{t('programmeDescription')}</p>
          </div>
        )}
        <div className={s.catalogue}>
          <form className={s.filters} method="get">
            <h2 className={s.heading}>{t('filter')}</h2>
            <label>
              {t('search')}
              <input name="q" defaultValue={query} placeholder={t('searchPlaceholder')} />
            </label>
            <label>
              {t('departureMonth')}
              <select name="month" defaultValue={month}>
                <option value="">{t('allMonths')}</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {new Intl.DateTimeFormat('id-ID', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'Asia/Jakarta',
                    }).format(new Date(`${m}-01T00:00:00+07:00`))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('sort')}
              <select name="sort" defaultValue={sort}>
                <option value="">{t('priceLow')}</option>
                <option value="price-desc">{t('priceHigh')}</option>
                <option value="date">{t('dateSoon')}</option>
              </select>
            </label>
            <button className={s.button} type="submit">
              {t('applyFilter')}
            </button>
            <Link
              href={
                kind === 'plus'
                  ? '/umroh-plus'
                  : kind === 'haji'
                    ? '/haji'
                    : kind === 'tour'
                      ? '/wisata-halal'
                      : kind === 'padang'
                        ? '/umroh-starter-padang'
                        : '/umroh'
              }
            >
              {t('reset')}
            </Link>
          </form>
          <div>
            <div className={s.toolbar}>
              <p>{t('resultCount', { count: packages.length })}</p>
            </div>
            {packages.length ? (
              <div className={s.grid}>
                {packages.map((item) => (
                  <PackageCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className={s.empty}>
                <h2>{t('noPackages')}</h2>
                <p>{all.length ? t('changeFilter') : t('notPublished')}</p>
                <Link href="/kontak" className={s.button}>
                  {t('askProgramme')}
                </Link>
              </div>
            )}
          </div>
        </div>
        <Consultation data={data} />
      </div>
    </PublicShell>
  );
}

function Itinerary({ items }: { items: PublicPackage['itinerary'] }) {
  return (
    <div className={s.timeline}>
      {items.map((day, index) => {
        const title =
          typeof day.title === 'string' ? day.title : typeof day.name === 'string' ? day.name : '';
        const description = typeof day.description === 'string' ? day.description : '';
        const activities = Array.isArray(day.activities)
          ? day.activities.filter((v): v is string => typeof v === 'string')
          : [];
        if (!title && !description && !activities.length) return null;
        return (
          <section key={index}>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
            {activities.length > 0 && (
              <ul>
                {activities.map((activity, i) => (
                  <li key={i}>
                    <Check />
                    {activity}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
export async function PackageDetail({ item, data }: { item: PublicPackage; data: PublicSiteData }) {
  const t = await getTranslations('publicInner');
  const lists = [
    ['included', item.inclusions],
    ['excluded', item.exclusions],
    ['requirements', item.requirements],
  ] as const;
  return (
    <PublicShell data={data}>
      <CategoryHero
        title={item.name}
        description={item.shortDescription || t('detailDescription')}
        image={item.image}
      />
      <div className={s.heroMeta}>
        <span>
          <Clock3 />
          {t('days', { count: item.durationDays })}
        </span>
        {item.departureDate && (
          <span>
            <CalendarDays />
            {formatIndonesianDate.format(parseDatabaseDate(item.departureDate))}
          </span>
        )}
        {item.departureAirport && (
          <span>
            <Plane />
            {item.departureAirport}
          </span>
        )}
      </div>
      <div className={s.container}>
        <Link
          href={item.type === 'HAJJ' ? '/haji' : item.type === 'TOUR' ? '/wisata-halal' : '/umroh'}
          className={s.back}
        >
          {t('backPackages')}
        </Link>
        <div className={s.detailGrid}>
          <div className={s.stack}>
            {item.description && (
              <section className={s.panel}>
                <h2>{t('description')}</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{item.description}</p>
              </section>
            )}
            {lists
              .filter(([, items]) => items.length)
              .map(([key, items]) => (
                <section className={s.panel} key={key}>
                  <h2>{t(key)}</h2>
                  <ul>
                    {items.map((text, index) => (
                      <li key={index}>
                        <Check />
                        {text}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            {(item.hotel || item.madinahHotel) && (
              <section className={s.panel}>
                <h2>{t('hotel')}</h2>
                {item.hotel && (
                  <>
                    <h3>{t('makkah')}</h3>
                    <p>{item.hotel}</p>
                  </>
                )}
                {item.madinahHotel && (
                  <>
                    <h3>{t('madinah')}</h3>
                    <p>{item.madinahHotel}</p>
                  </>
                )}
              </section>
            )}
            {item.itinerary.some(
              (day) =>
                typeof day.title === 'string' ||
                typeof day.description === 'string' ||
                Array.isArray(day.activities)
            ) && (
              <section className={s.panel}>
                <h2>{t('itinerary')}</h2>
                <Itinerary items={item.itinerary} />
              </section>
            )}
          </div>
          <aside className={`${s.panel} ${s.pricePanel}`}>
            <p>{t('fromPrice')}</p>
            <div className={s.price}>{formatIdr.format(item.startingPrice)}</div>
            <p>{t('priceNote')}</p>
            <div className={s.facts}>
              <div>
                <CalendarDays />
                <span>
                  {item.departureDate
                    ? formatIndonesianDate.format(parseDatabaseDate(item.departureDate))
                    : t('askSchedule')}
                </span>
              </div>
              {item.airline && (
                <div>
                  <Plane />
                  <span>{item.airline}</span>
                </div>
              )}
              {item.departureAirport && (
                <div>
                  <MapPin />
                  <span>{item.departureAirport}</span>
                </div>
              )}
            </div>
            <Link className={s.button} href={`/kontak?paket=${encodeURIComponent(item.name)}`}>
              {t('askPackage')}
            </Link>
          </aside>
        </div>
        <Consultation data={data} />
      </div>
    </PublicShell>
  );
}
