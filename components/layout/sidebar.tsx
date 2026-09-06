'use client';

import { usePathname } from 'next/navigation';
import {
  CalendarDaysIcon,
  FileBarChartIcon,
  Globe2Icon,
  LayoutDashboardIcon,
  PlaneTakeoffIcon,
  SettingsIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/brand';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { AppBranding } from '@/lib/branding/constants';

interface SidebarProps {
  collapsed: boolean;
  branding: AppBranding;
}

const navItems = [
  {
    href: '/dashboard',
    key: 'dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    href: '/travel/jamaah',
    key: 'pilgrims',
    icon: UsersRoundIcon,
  },
  {
    href: '/travel/keberangkatan',
    key: 'departures',
    icon: CalendarDaysIcon,
  },
  {
    href: '/travel/pembayaran',
    key: 'finance',
    icon: WalletCardsIcon,
  },
  {
    href: '/travel/operasional',
    key: 'operations',
    icon: PlaneTakeoffIcon,
  },
  {
    href: '/travel/website',
    key: 'website',
    icon: Globe2Icon,
  },
  {
    href: '/travel/laporan',
    key: 'reports',
    icon: FileBarChartIcon,
  },
  {
    href: '/administrations',
    key: 'administration',
    icon: SettingsIcon,
  },
] as const;

export default function Sidebar({ collapsed, branding }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-9" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{branding.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{t('sidebarTagline')}</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Menu utama">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const label = t(item.key);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-12 items-center gap-3 rounded-lg px-3 text-[15px] font-semibold transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/60 p-3">
            <p className="text-xs font-medium">{t('localFirstTitle')}</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/60">
              {t('localFirstDescription')}
            </p>
          </div>
        ) : (
          <div className="mx-auto size-2 rounded-full bg-sidebar-primary" />
        )}
      </div>
    </aside>
  );
}
