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
    section: 'UTAMA',
    href: '/admin',
    key: 'dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    section: 'OPERASIONAL',
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
    section: 'KONTEN & LAPORAN',
    href: '/admin/cms',
    key: 'website',
    icon: Globe2Icon,
  },
  {
    href: '/travel/laporan',
    key: 'reports',
    icon: FileBarChartIcon,
  },
  {
    section: 'PENGATURAN',
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
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-4">
        <BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-10" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{branding.name}</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[.12em] text-sidebar-foreground/50">Tour Operations</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4" aria-label="Menu utama">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const label = t(item.key);

          return (
            <div key={item.href}>
              {'section' in item && item.section && !collapsed ? <p className="mb-1 mt-4 px-3 text-[10px] font-extrabold tracking-[.16em] text-sidebar-foreground/40 first:mt-0">{item.section}</p> : null}
              <Link
              href={item.href}
              className={cn(
                'mb-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-semibold transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--sidebar-primary)]'
                  : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
            <p className="flex items-center gap-2 text-xs font-bold"><span className="size-2 rounded-full bg-emerald-500" /> Sistem siap digunakan</p>
            <p className="mt-1.5 text-[11px] leading-4 text-emerald-800">Data tersimpan otomatis dan aman.</p>
          </div>
        ) : (
          <div className="mx-auto size-2 rounded-full bg-sidebar-primary" />
        )}
      </div>
    </aside>
  );
}
