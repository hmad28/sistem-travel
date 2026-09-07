import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import s from '@/components/public/inner.module.css';
export default async function NotFound() {
  const t = await getTranslations('publicInner');
  return (
    <main className={s.container}>
      <div className={s.empty}>
        <h1 className={s.heading}>{t('packageNotFound')}</h1>
        <p>{t('packageNotFoundDescription')}</p>
        <Link className={s.button} href="/umroh">
          {t('backPackages')}
        </Link>
      </div>
    </main>
  );
}
