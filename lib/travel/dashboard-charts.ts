import 'server-only';
import { sql } from 'drizzle-orm';
import { readDb } from '@/db/read';
import { departures,invoices,payments,registrations,travelPackages } from '@/db/schema';
import { dashboardMonths,fillDashboardSeries } from './dashboard-series';
export async function getDashboardCharts(org:string){
  const now=new Date(),months=dashboardMonths(now),start=months[0]+'-01';
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const [money,people,seats]=await Promise.all([
    readDb.execute<{month:string;amount:string}>(sql`
      select to_char(p.paid_at at time zone 'UTC' at time zone 'Asia/Jakarta','YYYY-MM') as month,sum(p.amount)::text as amount
      from ${payments} p join ${invoices} i on i.id=p.invoice_id and i.organization_id=${org}
      where p.organization_id=${org} and p.status='VERIFIED' and i.status not in ('DRAFT','VOID') and i.voided_at is null
      and p.paid_at >= ${new Date(start+'T00:00:00+07:00')} and p.paid_at <= ${now}
      group by 1 order by 1
    `),
    readDb.execute<{month:string;amount:string}>(sql`
      select to_char(registration_date,'YYYY-MM') as month,count(*)::text as amount
      from ${registrations} where organization_id=${org}
      and registration_status not in ('DRAFT','CANCELLED','REFUNDED','REJECTED')
      and registration_date >= ${start}::date and registration_date <= ${today}::date group by 1 order by 1
    `),
    readDb.execute<{id:string;name:string;date:string;quota:number;booked:number}>(sql`
      select d.id,p.name,d.departure_date::text as date,d.quota,count(r.id)::int as booked
      from ${departures} d join ${travelPackages} p on p.id=d.package_id and p.organization_id=${org}
      left join ${registrations} r on r.departure_id=d.id and r.organization_id=${org}
        and r.registration_status in ('REGISTERED','VERIFIED','CONFIRMED','READY')
      where d.organization_id=${org} and d.departure_date >= ${today}::date
        and d.status in ('OPEN','FULL','CLOSED','PREPARATION')
      group by d.id,p.name order by d.departure_date,d.id limit 5
    `)
  ]);
  return {payments:fillDashboardSeries(months,money.rows),registrations:fillDashboardSeries(months,people.rows),departures:seats.rows};
}
