'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Globe2,
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  WalletCards,
  PlaneTakeoff,
  ChartNoAxesCombined,
  Settings2,
  Palette,
  PackageOpen,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand';
import type { AppBranding } from '@/lib/branding/constants';

export function TravelWorkspace({
  branding,
  children,
}: {
  branding: AppBranding;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const t = useTranslations('workspace');
  const [open, setOpen] = useState(false);
  const internal =
    path.startsWith('/travel') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/admin/manajemen') ||
    path.startsWith('/administrations');
  const entries = internal
    ? ([
        ['/admin/manajemen', 'overview', LayoutDashboard],
        ['/travel/jamaah', 'pilgrims', UsersRound],
        ['/travel/keberangkatan', 'departures', CalendarDays],
        ['/travel/operasional', 'operations', PlaneTakeoff],
        ['/travel/pembayaran', 'payments', WalletCards],
        ['/travel/laporan', 'reports', ChartNoAxesCombined],
        ['/administrations', 'settings', Settings2],
      ] as const)
    : ([
        ['/admin', 'cmsOverview', LayoutDashboard],
        ['/admin/cms/paket', 'packages', PackageOpen],
        ['/admin/cms/pengaturan', 'brand', Palette],
      ] as const);
  return (
    <div className="tour-workspace" data-workspace={internal ? 'internal' : 'cms'}>
      {open && (
        <button
          className="workspace-backdrop"
          onClick={() => setOpen(false)}
          aria-label={t('close')}
        />
      )}
      <aside className={`workspace-sidebar ${open ? 'is-open' : ''}`}>
        <div className="workspace-brand">
          <BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-11" />
          <div>
            <strong>{branding.name}</strong>
            <small>{t(internal ? 'internal' : 'cms')}</small>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label={t('close')}>
            <X />
          </button>
        </div>
        <div className="workspace-switch" aria-label={t('switch')}>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            aria-current={!internal ? 'page' : undefined}
          >
            <Globe2 /> CMS
          </Link>
          <Link
            href="/admin/manajemen"
            onClick={() => setOpen(false)}
            aria-current={internal ? 'page' : undefined}
          >
            <Building2 /> {t('internalShort')}
          </Link>
        </div>
        <p className="workspace-section-label">{t(internal ? 'business' : 'content')}</p>
        <nav aria-label={t(internal ? 'internal' : 'cms')}>
          {entries.map(([href, key, Icon]) => {
            const active =
              href === '/admin'
                ? path === '/admin' || path === '/admin/cms'
                : path === href || path.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{t(key)}</span>
                {active && <span className="workspace-active-dot" />}
              </Link>
            );
          })}
        </nav>
        <div className="workspace-sidebar-bottom">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Globe2 />
            {t('viewSite')}
            <ArrowUpRight />
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/auth/login' })}>
            <LogOut />
            {t('logout')}
          </button>
          <small>Powered by Hammad Studio</small>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="flex items-center gap-3">
            <button
              className="workspace-menu lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={t('menu')}
              aria-expanded={open}
            >
              <Menu />
            </button>
            <span className="workspace-context-icon">{internal ? <Building2 /> : <Globe2 />}</span>
            <div>
              <strong>{t(internal ? 'internal' : 'cms')}</strong>
              <small>{t(internal ? 'internalDescription' : 'cmsDescription')}</small>
            </div>
          </div>
          <Link className="workspace-site-link" href="/" target="_blank" rel="noopener noreferrer">
            {t('viewSite')}
            <ArrowUpRight />
          </Link>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
