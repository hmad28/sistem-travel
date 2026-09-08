import { Plane } from 'lucide-react';
import { DEFAULT_APP_LOGO_URL, DEFAULT_APP_NAME } from '@/lib/branding/constants';
import s from './public-loading.module.css';

export function PublicLoading({ title, description }: { title: string; description: string }) {
  return (
    <div className={s.screen} role="status" aria-live="polite" aria-atomic="true">
      <div className={s.content}>
        <div className={s.journey} aria-hidden="true">
          <div className={s.outerRing} />
          <div className={s.route} />
          <div className={s.orbit}><span className={s.plane}><Plane size={20} strokeWidth={1.8} /></span></div>
          <div className={s.mark}>
            {/* Local SVG stays lightweight and does not wait for image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULT_APP_LOGO_URL} width={64} height={64} alt="" />
          </div>
        </div>
        <p className={s.brand}>{DEFAULT_APP_NAME}</p>
        <h1 className={s.title}>{title}</h1>
        <p className={s.description}>{description}</p>
        <div className={s.track} aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
