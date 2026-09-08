import { describe, expect, it } from 'vitest';
import { requestOrigin } from './request-origin';
describe('request origin', () => {
  it('follows different mapped domains without configuration', () => {
    for (const host of ['travel.example.id','umrah.example.id','preview.vercel.app']) expect(requestOrigin(new Headers({host}))).toBe(`https://${host}`);
  });
  it('preserves local development ports', () => expect(requestOrigin(new Headers({host:'localhost:3001'}))).toBe('http://localhost:3001'));
  it('ignores spoofed origin and forwarded host', () => expect(requestOrigin(new Headers({host:'travel.example.id',origin:'https://evil.example','x-forwarded-host':'evil.example','x-forwarded-proto':'http'}))).toBe('https://travel.example.id'));
  it('rejects malformed hosts', () => {
    for(const host of ['evil.example/path','user@evil.example','one.example,two.example','evil.example?query','evil.example#hash'])expect(()=>requestOrigin(new Headers({host}))).toThrow();
    expect(()=>requestOrigin(new Headers())).toThrow();
  });
});
