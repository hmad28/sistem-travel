import './load-env.mjs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { createNodeDb } from '../db/node';
import { organizations, websiteVisits } from '../db/schema';

const {db,pool}=createNodeDb();
const eventId=randomUUID();
let orgId='';
try {
  const [org]=await db.select({id:organizations.id}).from(organizations).where(eq(organizations.slug,'hammad-tour'));
  assert.ok(org);orgId=org.id;
  const event={eventId,visitorId:randomUUID(),path:'/',type:'pageview'};
  const send=(body:unknown,origin='http://localhost:3000')=>fetch('http://localhost:3000/api/traffic',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'User-Agent':'Mozilla/5.0 Chrome/140.0 Safari/537.36'},body:JSON.stringify(body)});
  assert.equal((await send(event,'https://invalid.example')).status,403);
  assert.equal((await send({...event,path:'/admin'})).status,400);
  assert.equal((await send(event)).status,204);
  assert.equal((await send(event)).status,204);
  assert.equal((await send({...event,type:'heartbeat'})).status,204);
  const records=await db.select().from(websiteVisits).where(and(eq(websiteVisits.id,eventId),eq(websiteVisits.organizationId,org.id)));
  assert.equal(records.length,1);
  assert.notEqual(records[0].visitorKey,event.visitorId);
  assert.ok(records[0].lastSeenAt>=records[0].createdAt);
  assert.equal((await fetch('http://localhost:3000/api/administrations/traffic')).status,401);
  console.log('PASS: origin, public paths, duplicate pageview, heartbeat, pseudonymous ID and protected statistics');
} finally {
  if(orgId)await db.delete(websiteVisits).where(and(eq(websiteVisits.id,eventId),eq(websiteVisits.organizationId,orgId)));
  await pool.end();
  console.log('Verification event removed; existing traffic untouched');
}
