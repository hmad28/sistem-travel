'use client';
import { useId, useState } from 'react';
import { Activity, Eye, Loader2, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTraffic } from '@/lib/query/hooks/use-traffic';
import { Button } from '@/components/ui/button';
import s from './traffic-dashboard.module.css';

const number=new Intl.NumberFormat('id-ID');
const dateLabel=(date:string)=>new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',timeZone:'Asia/Jakarta'}).format(new Date(`${date}T00:00:00+07:00`));
export function TrafficDashboard({organizationId}:{organizationId:string}) {
  const t=useTranslations('traffic');
  const query=useTraffic(organizationId);
  const [range,setRange]=useState<7|30>(7);
  const gradient=useId();
  const data=query.data;
  if(!data)return <section className={s.board}><div className={s.heading}><h2>{t('title')}</h2></div><div className={s.placeholder} role="status">{query.isError?<><p>{t('error')}</p><Button onClick={()=>void query.refetch()}>{t('retry')}</Button></>:<><Loader2 className="animate-spin" /><p>{t('loading')}</p></>}</div></section>;
  const history=data.history.slice(-range);
  const actualMax=Math.max(0,...history.map(d=>d.visitors));
  const max=Math.max(2,Math.ceil(actualMax/2)*2);
  const points=history.map((d,i)=>({x:35+i/(history.length-1)*650,y:175-d.visitors/max*145,...d}));
  const line=points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  const pageLabel=(path:string)=>path==='/'?t('homepage'):path;
  return <section className={s.board} aria-label={t('title')}>
    <header className={s.heading}><div><h2>{t('title')}</h2><p>{t('description')}</p></div><Button variant="outline" onClick={()=>void query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching?'animate-spin':''} />{t('refresh')}</Button></header>
    {query.isError && <p className={s.error} role="alert">{t('stale')}</p>}
    <div className={s.metrics}>{(['liveVisitors','visitorsToday','visitors7Days','visitors30Days'] as const).map((key,i)=><article key={key} className={i===0?s.live:undefined}><span>{i===0&&<Activity size={18} />}{t(key)}</span><strong>{number.format(data[key])}</strong><p>{t(i===0?'liveNote':'uniqueNote')}</p></article>)}</div>
    <div className={s.details}>
      <section className={s.chart}><header><h3>{t('trend')}</h3><div className={s.ranges} aria-label={t('range')}>{([7,30] as const).map(n=><button key={n} type="button" aria-pressed={range===n} onClick={()=>setRange(n)}>{t('days',{count:n})}</button>)}</div></header>
        <svg viewBox="0 0 720 220" className={s.graph} role="img" aria-label={t('graph',{count:range,max:actualMax})}><defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#195acb" stopOpacity=".18" /><stop offset="1" stopColor="#195acb" stopOpacity=".02" /></linearGradient></defs>
          {[0,.5,1].map(r=><g key={r}><line x1="35" x2="685" y1={175-r*145} y2={175-r*145} stroke="#e2e8f0" /><text x="26" y={180-r*145} textAnchor="end">{Math.round(max*r)}</text></g>)}
          <path d={`${line} L 685 175 L 35 175 Z`} fill={`url(#${gradient})`} /><path d={line} fill="none" stroke="#195acb" strokeWidth="3" />
          {points.map((p,i)=><g key={p.date}><circle cx={p.x} cy={p.y} r="3" fill="#195acb"><title>{dateLabel(p.date)}: {p.visitors}</title></circle>{(i===0||i===points.length-1||i%(range===7?1:5)===0)&&<text x={p.x} y="205" textAnchor={i===0?'start':i===points.length-1?'end':'middle'}>{dateLabel(p.date)}</text>}</g>)}
        </svg>
        {!history.some(d=>d.visitors>0)&&<p className={s.empty}>{t('empty')}</p>}
        <details className={s.tableDetails}><summary>{t('dailyData')}</summary><table><thead><tr><th>{t('date')}</th><th>{t('visitors')}</th></tr></thead><tbody>{history.map(d=><tr key={d.date}><td>{dateLabel(d.date)}</td><td>{number.format(d.visitors)}</td></tr>)}</tbody></table></details>
      </section>
      <section className={s.pages}><h3>{t('popular')}</h3><p>{t('viewsToday',{count:data.pageViewsToday})}</p>{data.popularPages.length?<ol>{data.popularPages.map((p,i)=><li key={p.path}><span>{i+1}</span><strong>{pageLabel(p.path)}</strong><b>{number.format(p.views)}</b></li>)}</ol>:<div className={s.empty}><Eye /><p>{t('empty')}</p></div>}</section>
    </div>
    <section className={s.recent}><h3>{t('recent')}</h3><div>{data.recentViews.length?data.recentViews.map(v=><article key={v.id}>{v.device==='mobile'?<Smartphone />:v.device==='tablet'?<Tablet />:<Monitor />}<div><strong>{pageLabel(v.path)}</strong><p>{t(v.device as 'mobile')} · {new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(v.lastSeenAt))}</p><p>{v.referrer||t('direct')}</p></div></article>):<p className={s.empty}>{t('empty')}</p>}</div></section>
    <footer className={s.footer}><div><strong>{t('devices')}</strong>{data.devices.map(d=><span key={d.device}>{t(d.device as 'mobile')}: {number.format(d.visitors)}</span>)}</div><p>{t('updated',{time:new Intl.DateTimeFormat('id-ID',{timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(data.updatedAt))})}</p><p>{t('measurement')}</p></footer>
  </section>;
}
