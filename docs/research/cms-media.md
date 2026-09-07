# CMS media continuation — 7 September 2026

Existing routes and component namespace are retained. This is an incremental change to `/`, `/informasi/testimonial/[id]` and `/admin/cms/konten/[kind]`, not a completed homepage clone.

Live Tazkia inspection: hero has separate landscape and portrait images; desktop visibility changes at `lg` (1024px). Slides use opacity 0→1, scale 1.05→1, 1500ms ease-in-out. YouTube cards use portrait 9:16, 360×640px, radius 16px, cover image, title overlay. These observations were extracted from the rendered DOM with Playwright.

Jam Wisata references: `src/lib/cms/validation.ts` has `sortOrder` and YouTube ID extraction; `AdminSidebar.tsx` labels the testimonial module Video jamaah. Port these capabilities into existing tenant-scoped CMS, using strict host validation instead of substring hostname matching.

Data customization: do not publish Tazkia testimonials as Hammad testimonials. Use owner-supplied YouTube links/posters, initially draft. No external video network request before visitor chooses playback. Blue controls follow the user's palette requirement. This deliberately differs from the reference red YouTube badge and subscribe button.

Implementation: backward-compatible optional JSON fields mobileImage/videoUrl/sortOrder/revision. Both images must belong to tenant's CMS uploads. Save rejects stale entry revision. Ordered records drive CMS list and public rendering. No database schema changes or resets.
