import 'server-only';
import { and, count, countDistinct, desc, eq, gte, sql } from 'drizzle-orm';
import { readDb } from '@/db/read';
import { websiteVisits as v } from '@/db/schema';
import { jakartaDay, jakartaDayStart } from '@/lib/validation/website-traffic';
import type { TrafficSnapshot } from './traffic-types';

export async function getTrafficSnapshot(organizationId:string):Promise<TrafficSnapshot> {
  const clock=await readDb.execute(sql`select now() as current_time`);
  const now=new Date(String(clock.rows[0].current_time)); const today=jakartaDayStart(now);
  const week=new Date(today.getTime()-6*86400000); const month=new Date(today.getTime()-29*86400000);
  const scope=eq(v.organizationId,organizationId);
  const day=sql<string>`(${v.createdAt} at time zone 'Asia/Jakarta')::date::text`;
  const views=count();
  const [summary,live,history,popularPages,devices,recent]=await Promise.all([
    readDb.select({
      visitorsToday:sql<number>`count(distinct case when ${v.createdAt} >= ${today.toISOString()}::timestamptz then ${v.visitorKey} end)::int`,
      visitors7Days:sql<number>`count(distinct case when ${v.createdAt} >= ${week.toISOString()}::timestamptz then ${v.visitorKey} end)::int`,
      visitors30Days:countDistinct(v.visitorKey),
      pageViewsToday:sql<number>`count(*) filter (where ${v.createdAt} >= ${today.toISOString()}::timestamptz)::int`,
    }).from(v).where(and(scope,gte(v.createdAt,month))),
    readDb.select({value:countDistinct(v.visitorKey)}).from(v).where(and(scope,gte(v.lastSeenAt,new Date(now.getTime()-300000)))),
    readDb.select({date:day,visitors:countDistinct(v.visitorKey)}).from(v).where(and(scope,gte(v.createdAt,month))).groupBy(day),
    readDb.select({path:v.path,views}).from(v).where(and(scope,gte(v.createdAt,today))).groupBy(v.path).orderBy(desc(views)).limit(5),
    readDb.select({device:v.device,visitors:countDistinct(v.visitorKey)}).from(v).where(and(scope,gte(v.createdAt,today))).groupBy(v.device),
    readDb.select({id:v.id,path:v.path,device:v.device,lastSeenAt:v.lastSeenAt,referrer:v.referrer}).from(v).where(and(scope,gte(v.createdAt,month))).orderBy(desc(v.lastSeenAt)).limit(8),
  ]);
  const daily=new Map(history.map(r=>[r.date,Number(r.visitors)]));
  return {...summary[0], liveVisitors:Number(live[0]?.value ?? 0), updatedAt:now.toISOString(),
    history:Array.from({length:30},(_,i)=>{const date=jakartaDay(new Date(month.getTime()+i*86400000));return {date,visitors:daily.get(date)??0};}),
    popularPages,devices,recentViews:recent.map(r=>({...r,lastSeenAt:r.lastSeenAt.toISOString()})),
  };
}
