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
import { NavigationFeedback } from './navigation-feedback';
import { usePermission } from '@/lib/auth/client-permissions';
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
  const c = useTranslations('contentEditor');
  const w = useTranslations('workflow');
  const [open, setOpen] = useState(false);
  const canPilgrims = usePermission('pilgrim', 'view');
  const canDepartures = usePermission('departure', 'view');
  const canFinance = usePermission('finance', 'view');
  const canCms = usePermission('cms', 'view');
  const canRegistration = usePermission('registration', 'view');
  const internal =
    path.startsWith('/travel') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/admin/manajemen') ||
    path.startsWith('/administrations');
  const entries = internal
    ? ([
        ['/admin/manajemen', 'overview', LayoutDashboard],
        ['/travel/jamaah', 'pilgrims', UsersRound],
        ['/admin/manajemen/keberangkatan', 'departures', CalendarDays],
        ['/travel/operasional', 'operations', PlaneTakeoff],
        ['/travel/pembayaran', 'payments', WalletCards],
        ['/admin/manajemen/pengaturan', 'settings', Settings2],
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
            <Globe2 /> CMS <NavigationFeedback />
          </Link>
          <Link
            href="/admin/manajemen"
            onClick={() => setOpen(false)}
            aria-current={internal ? 'page' : undefined}
          >
            <Building2 /> {t('internalShort')} <NavigationFeedback />
          </Link>
        </div>
        <p className="workspace-section-label">{t(internal ? 'business' : 'content')}</p>
        <nav aria-label={t(internal ? 'internal' : 'cms')}>
          {entries
            .filter(([, key]) =>
              key === 'payments'
                ? canFinance
                : key === 'pilgrims' || key === 'operations'
                  ? canPilgrims
                  : key === 'departures'
                    ? canDepartures
                    : key === 'packages' || key === 'cmsOverview'
                      ? canCms
                      : true
            )
            .map(([href, key, Icon]) => {
              const active =
                href === '/admin'
                  ? path === '/admin' || path === '/admin/cms'
                  : href === '/admin/manajemen'
                    ? path === href || path === '/dashboard'
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
                  <NavigationFeedback />
                  {active && <span className="workspace-active-dot" />}
                </Link>
              );
            })}
          {!internal &&
            canCms &&
            (['banner', 'article', 'gallery', 'testimonial', 'faq'] as const).map(
              (kind) => (
                <Link
                  key={kind}
                  href={`/admin/cms/konten/${kind}`}
                  onClick={() => setOpen(false)}
                  aria-current={path.includes(`/konten/${kind}`) ? 'page' : undefined}
                >
                  <Globe2 />
                  <span>{c(kind)}</span>
                  <NavigationFeedback />
                </Link>
              )
            )}
          {internal && canRegistration && (
            <Link
              href="/admin/manajemen/pendaftaran"
              onClick={() => setOpen(false)}
              aria-current={path.startsWith('/admin/manajemen/pendaftaran') ? 'page' : undefined}
            >
              <UsersRound />
              <span>{w('registrationsTitle')}</span>
              <NavigationFeedback />
            </Link>
          )}
          {internal && canFinance && (
            <Link
              href="/admin/manajemen/kwitansi"
              onClick={() => setOpen(false)}
              aria-current={path.startsWith('/admin/manajemen/kwitansi') ? 'page' : undefined}
            >
              <WalletCards />
              <span>{w('receiptsTitle')}</span>
              <NavigationFeedback />
            </Link>
          )}
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
