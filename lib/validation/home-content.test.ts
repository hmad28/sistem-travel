import { describe, expect, it } from 'vitest';
import { homeDocumentSchema, homeTextSchema } from './home-content';
describe('homepage editorial document', () => {
  it('keeps draft changes separate from published content', () => {
    const result = homeDocumentSchema.parse({ revision: 3, draft: { heroTitle: 'New title' }, published: { heroTitle: 'Current title' } });
    expect(result.published.heroTitle).toBe('Current title');
    expect(result.draft.heroTitle).toBe('New title');
  });
  it('rejects unknown fields', () => {
    expect(homeTextSchema.safeParse({ organizationId: 'another-tenant' }).success).toBe(false);
  });
  it('rejects invalid revisions and oversized content', () => {
    expect(homeDocumentSchema.safeParse({ revision: -1, draft: {}, published: {} }).success).toBe(false);
    expect(homeTextSchema.safeParse({ heroTitle: 'x'.repeat(2001) }).success).toBe(false);
  });
});
