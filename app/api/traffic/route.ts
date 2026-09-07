import { createHmac } from 'node:crypto';
import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { db } from '@/db';
import { organizations, websiteVisits } from '@/db/schema';
import { trafficEventSchema, isHumanAgent, trafficDevice } from '@/lib/validation/website-traffic';
import { checkRateLimit } from '@/lib/rate-limit';
import { jsonError } from '@/lib/api/response';

export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store'};
  const skip=()=>new Response(null,{status:204,headers});
  if(request.headers.get('origin') !== new URL(env.NEXT_PUBLIC_APP_URL).origin) return jsonError('Forbidden',403);
  if(request.headers.get('dnt')==='1' || request.headers.get('sec-gpc')==='1' || !isHumanAgent(request.headers.get('user-agent')??''))return skip();
  if(Number(request.headers.get('content-length')??0)>2048)return jsonError('Payload too large',413);
  try {
    const raw=await request.text();
    if(raw.length>2048)return jsonError('Payload too large',413);
    const parsed=trafficEventSchema.safeParse(JSON.parse(raw));
    if(!parsed.success)return jsonError('Invalid event',400);
    const event=parsed.data;
    // Same organization resolver as the current public website; never trust a tenant ID from the browser.
    const [org]=await db.select({id:organizations.id}).from(organizations).where(and(eq(organizations.slug,'hammad-tour'),eq(organizations.status,'ACTIVE'))).limit(1);
    if(!org)return skip();
    const visitorKey=createHmac('sha256',env.AUTH_SECRET).update(`${org.id}:${event.visitorId}`).digest('hex');
    const allowed=await checkRateLimit(`traffic:${visitorKey}`,{limit:60,windowMs:60000});
    if(!allowed.success)return jsonError('Too many events',429);
    if(event.type==='pageview') {
      await db.insert(websiteVisits).values({id:event.eventId,organizationId:org.id,visitorKey,path:event.path,device:trafficDevice(request.headers.get('user-agent')??''),referrer:event.referrer}).onConflictDoNothing();
    } else {
      await db.update(websiteVisits).set({lastSeenAt:sql`now()`}).where(and(eq(websiteVisits.id,event.eventId),eq(websiteVisits.organizationId,org.id),eq(websiteVisits.visitorKey,visitorKey),eq(websiteVisits.path,event.path),gte(websiteVisits.createdAt,sql`now() - interval '1 day'`)));
    }
    return skip();
  }catch(error){
    if(error instanceof SyntaxError)return jsonError('Invalid event',400);
    console.error('[TRAFFIC_RECORD_FAILED]',error instanceof Error?error.name:'UnknownError');
    return NextResponse.json({error:'Traffic unavailable'},{status:503,headers});
  }
}
