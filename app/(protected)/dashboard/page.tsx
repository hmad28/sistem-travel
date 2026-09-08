import { getTranslations } from 'next-intl/server';
import { UsersRound,CalendarDays,WalletCards,ArrowUpRight,Plus,FileCheck2,PackageOpen } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { getDashboardData } from '@/lib/travel/dashboard-data';
import { getDashboardCharts } from '@/lib/travel/dashboard-charts';
import { DashboardCharts } from '@/components/travel/dashboard-charts';
import { formatCompactIdr,formatIdr } from '@/lib/travel/format';
export default async function DashboardPage(){
  const {organizationId,organization,user}=await requireOrganizationContext();
  const t=await getTranslations('overviewCharts'),w=await getTranslations('travelSimple');
  if(!hasSessionPermission(user,'report','view',organizationId))return <p>{w('denied')}</p>;
  const [data,charts]=await Promise.all([getDashboardData(organizationId),getDashboardCharts(organizationId)]);
  const metrics=[
    {label:t('people'),value:String(data.pilgrims),detail:t('allTime'),icon:UsersRound},
    {label:t('departures'),value:String(data.activeDepartures),detail:t('allTime'),icon:CalendarDays},
    {label:t('total'),value:formatCompactIdr.format(data.finance.total),detail:formatIdr.format(data.finance.total),icon:WalletCards},
    {label:t('remaining'),value:formatCompactIdr.format(data.finance.outstanding),detail:formatIdr.format(data.finance.outstanding),icon:WalletCards}
  ];
  const tasks=[
    ...(hasSessionPermission(user,'finance','view',organizationId)?[{label:t('unpaid'),value:data.finance.unpaidPilgrims,href:'/travel/pembayaran',icon:WalletCards}]:[]),
    ...(hasSessionPermission(user,'pilgrim','view',organizationId)?[{label:t('documents'),value:data.documents.incomplete,href:'/travel/jamaah',icon:FileCheck2}]:[]),
    ...(hasSessionPermission(user,'inventory','view',organizationId)?[{label:t('stock'),value:data.lowStockItems,href:'/admin/manajemen/stok?status=low',icon:PackageOpen}]:[])
  ];
  return <PageShell title={t('title')} description={t('hint')} actions={hasSessionPermission(user,'pilgrim','create',organizationId)&&<Link href="/travel/jamaah/baru" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"><Plus className="size-5"/>{w('addPilgrim')}</Link>}>
    {organization.slug==='hammad-tour'&&<p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950">{w('demo')}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m=><div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5" key={m.label}><div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-600">{m.label}</p><m.icon className="size-5 shrink-0 text-blue-700"/></div><strong className="mt-5 block text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{m.value}</strong><p className="mt-2 text-base text-slate-500">{m.detail}</p></div>)}</section>
    <DashboardCharts data={charts} finance={data.finance}/>
    <section className="space-y-4"><h2 className="text-xl font-semibold">{t('attention')}</h2><div className="grid gap-4 lg:grid-cols-3">{tasks.map(task=><Link key={task.href} href={task.href} className="flex min-h-24 items-center gap-4 rounded-xl border bg-white p-5 hover:border-blue-400"><task.icon className="size-6 shrink-0 text-blue-700"/><div className="min-w-0 flex-1"><strong className="text-2xl tabular-nums">{task.value}</strong><p className="mt-1 text-slate-600">{task.label}</p></div><ArrowUpRight className="size-5 shrink-0 text-blue-700" aria-label={t('action')}/></Link>)}</div></section>
  </PageShell>;
}
