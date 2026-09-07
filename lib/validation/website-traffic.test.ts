import { describe, expect, it } from 'vitest';
import { isPublicPath, jakartaDayStart, trafficEventSchema, isHumanAgent, trafficDevice } from './website-traffic';
describe('website traffic boundaries',()=>{
  it('excludes protected routes, queries and fragments',()=>{
    for(const path of ['/admin','/travel/jamaah','/api/traffic','/?phone=123','/umroh#private','//evil.test'])expect(isPublicPath(path)).toBe(false);
    for(const path of ['/','/umroh','/paket/umroh-reguler'])expect(isPublicPath(path)).toBe(true);
  });
  it('uses midnight Jakarta instead of UTC',()=>expect(jakartaDayStart(new Date('2026-09-07T18:00:00Z')).toISOString()).toBe('2026-09-07T17:00:00.000Z'));
  it('rejects invalid IDs',()=>expect(trafficEventSchema.safeParse({type:'pageview',eventId:'bad',visitorId:'bad',path:'/'}).success).toBe(false));
  it('filters crawler and headless requests',()=>{expect(isHumanAgent('Googlebot')).toBe(false);expect(isHumanAgent('HeadlessChrome')).toBe(false);expect(isHumanAgent('Mozilla/5.0 Chrome')).toBe(true);});
  it('distinguishes device types',()=>{expect(trafficDevice('iPad')).toBe('tablet');expect(trafficDevice('Android Mobile')).toBe('mobile');expect(trafficDevice('Windows')).toBe('desktop');});
});
