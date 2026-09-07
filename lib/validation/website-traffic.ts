import { z } from 'zod';

export function isPublicPath(path: string) {
  return /^\/(?:umroh|umroh-plus|umroh-starter-padang|haji|wisata-halal|kontak|faq|tentang)?$/.test(path)
    || /^\/paket\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)
    || /^\/informasi\/(?:page|article|gallery|testimonial)\/[a-f0-9-]{36}$/.test(path);
}
export const trafficEventSchema=z.object({
  type:z.enum(['pageview','heartbeat']),
  eventId:z.uuid(),
  visitorId:z.uuid(),
  path:z.string().max(300).refine(isPublicPath),
  referrer:z.string().max(253).regex(/^(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)?$/).default(''),
});
export function jakartaDay(now=new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function jakartaDayStart(now=new Date()) { return new Date(`${jakartaDay(now)}T00:00:00+07:00`); }
export function trafficDevice(userAgent:string) {
  if(/tablet|ipad/i.test(userAgent))return 'tablet';
  if(/mobile|android|iphone/i.test(userAgent))return 'mobile';
  return 'desktop';
}
export function isHumanAgent(userAgent:string) {
  return userAgent.length>0 && !/bot|crawler|spider|headless|preview|facebookexternalhit|whatsapp|slurp/i.test(userAgent);
}
