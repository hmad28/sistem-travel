import { describe, expect, it } from 'vitest';
import { contentEntrySchema, sortContent, youtubeId } from './travel-content';
const old = {
  id: '89c24b54-00b0-46e6-b36c-865b150a182f',
  title: 'Konten lama',
  body: '',
  image: '',
  link: '',
  published: false,
};
describe('CMS media', () => {
  it('reads existing records without migration', () => {
    expect(contentEntrySchema.parse(old)).toMatchObject({
      mobileImage: '',
      videoUrl: '',
      sortOrder: 0,
      revision: 0,
    });
  });
  it('supports watch, short and shared YouTube links', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=abcdefghijk',
      'https://youtu.be/abcdefghijk',
      'https://youtube.com/shorts/abcdefghijk',
    ])
      expect(youtubeId(url)).toBe('abcdefghijk');
  });
  it('rejects spoofed hosts, unsafe protocols and malformed IDs', () => {
    for (const url of [
      'https://youtube.com.evil.test/watch?v=abcdefghijk',
      'http://youtube.com/watch?v=abcdefghijk',
      'https://youtube.com@evil.test/watch?v=abcdefghijk',
      'https://youtu.be/abc',
      'javascript:alert(1)',
    ])
      expect(youtubeId(url)).toBeNull();
  });
  it('rejects fractional or negative ordering', () => {
    for (const sortOrder of [-1, 0.5])
      expect(contentEntrySchema.safeParse({ ...old, sortOrder }).success).toBe(false);
  });
  it('sorts without mutating the original array', () => {
    const a = contentEntrySchema.parse({ ...old, sortOrder: 10 });
    const b = contentEntrySchema.parse({ ...old, title: 'Kedua', sortOrder: 1 });
    const entries = [a, b];
    expect(sortContent(entries)).toEqual([b, a]);
    expect(entries).toEqual([a, b]);
  });
});
