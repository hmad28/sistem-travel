import { getLocale,getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { getDashboardCharts } from '@/lib/travel/dashboard-charts';
import { chartPercent } from '@/lib/travel/dashboard-series';
import { formatIdr,formatCompactIdr,formatIndonesianDate,parseDatabaseDate } from '@/lib/travel/format';
import s from './dashboard-charts.module.css';
type Series={month:string;value:number}[];
export async function DashboardCharts({data,finance}:{data:Awaited<ReturnType<typeof getDashboardCharts>>;finance:{paid:number;outstanding:number}}){
  const t=await getTranslations('overviewCharts'),locale=await getLocale();
  const month=(key:string)=>new Intl.DateTimeFormat(locale==='id'?'id-ID':'en',{month:'short',timeZone:'UTC'}).format(new Date(key+'-01T00:00:00Z'));
  const money=data.payments.reduce((sum,row)=>sum+row.value,0),people=data.registrations.reduce((sum,row)=>sum+row.value,0);
  const maxMoney=Math.max(1,...data.payments.map(r=>r.value)),maxPeople=Math.max(1,...data.registrations.map(r=>r.value));
  const percent=chartPercent(finance.paid,finance.paid+finance.outstanding);
  const points=data.registrations.map((r,i)=>`${20+i*112},${160-r.value/maxPeople*140}`).join(' ');
  const table=(rows:Series,currency:boolean)=><details className={s.table}><summary>{t('table')}</summary><table><thead><tr><th>{t('month')}</th><th>{t('value')}</th></tr></thead><tbody>{rows.map(r=><tr key={r.month}><td>{month(r.month)} {r.month.slice(0,4)}</td><td>{currency?formatIdr.format(r.value):r.value}</td></tr>)}</tbody></table></details>;
  return <div className={s.grid}>
    <section className={s.panel}><h2>{t('payments')}</h2><p className={s.hint}>{t('period')}</p><strong className={s.total}>{formatIdr.format(money)}</strong>
      <p className={s.scale}>0 — {formatCompactIdr.format(money===0?0:maxMoney)}</p><div className={s.bars} role="img" aria-label={t('payments')}>{data.payments.map(r=><div className={s.bar} key={r.month} style={{height:`${r.value/maxMoney*100}%`}} title={`${month(r.month)}: ${formatIdr.format(r.value)}`}/>)}</div><div className={s.months} aria-hidden="true">{data.payments.map(r=><span key={r.month}>{month(r.month)}</span>)}</div>
      <p className={s.hint}>{t('paymentsHint')}</p>{money===0&&<p className={s.empty}>{t('empty')}</p>}{table(data.payments,true)}
    </section>
    <section className={s.panel}><h2>{t('settlement')}</h2><p className={s.hint}>{t('allTime')}</p><div className={s.ringWrap}><div className={s.ring} role="img" aria-label={`${t('paid')}: ${Math.round(percent)}%`} style={{background:`conic-gradient(#195acb ${percent}%,#dce7f7 0)`}}><strong>{Math.round(percent)}%</strong></div><dl className={s.legend}><div><dt><span className={s.dot}/>{t('paid')}</dt><dd>{formatIdr.format(finance.paid)}</dd></div><div><dt><span className={`${s.dot} ${s.muted}`}/>{t('remaining')}</dt><dd>{formatIdr.format(finance.outstanding)}</dd></div></dl></div><p className={s.hint}>{t('settlementHint')}</p>{finance.paid+finance.outstanding===0&&<p className={s.empty}>{t('empty')}</p>}</section>
    <section className={s.panel}><h2>{t('registrations')}</h2><p className={s.hint}>{t('period')}</p><strong className={s.total}>{t('count',{count:people})}</strong>
      <p className={s.scale}>0 — {people===0?0:maxPeople}</p><svg className={s.line} viewBox="0 0 600 180" role="img" aria-label={t('registrations')} preserveAspectRatio="none">{[20,90,160].map(y=><line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#e8effa"/>)}<polygon points={`20,160 ${points} 580,160`} fill="#eaf1fc"/><polyline points={points} fill="none" stroke="#195acb" strokeWidth="3" vectorEffect="non-scaling-stroke"/>{data.registrations.map((r,i)=><circle key={r.month} cx={20+i*112} cy={160-r.value/maxPeople*140} r="4" fill="#195acb"><title>{month(r.month)}: {r.value}</title></circle>)}</svg>
      <div className={s.months} aria-hidden="true">{data.registrations.map(r=><span key={r.month}>{month(r.month)}</span>)}</div><p className={s.hint}>{t('registrationsHint')}</p>{people===0&&<p className={s.empty}>{t('empty')}</p>}{table(data.registrations,false)}
    </section>
    <section className={s.panel}><h2>{t('seats')}</h2><p className={s.hint}>{t('seatsHint')}</p><div className={s.departures}>{data.departures.length?data.departures.map(d=><Link key={d.id} href={`/admin/manajemen/keberangkatan/${d.id}`} className={s.departure}><strong>{d.name}</strong><small>{formatIndonesianDate.format(parseDatabaseDate(d.date))}</small><div className={s.track} aria-hidden="true"><span style={{width:`${chartPercent(d.booked,d.quota)}%`}}/></div><small>{t('seatCount',{booked:d.booked,quota:d.quota})} →</small></Link>):<p className={s.empty}>{t('empty')}</p>}</div></section>
  </div>;
}
