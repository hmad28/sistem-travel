# Tazkia reference adaptation

Requested source: https://www.tazkiatravel.com/ using https://github.com/JCodesMore/ai-website-cloner-template (MIT).
Existing app root: C:/Projects/sistem-manajemen-travel. User explicitly requested replacement of public home and simplified internal workspace; preserve auth/data/tenant model.

Destination paths: / replaces previous public home. Preserve source /umroh, /umroh-plus, /haji, /wisata-halal, /umroh-starter-padang, /kontak, /faq. /tentang reference is 404; provide a truthful brand introduction. Detail variants /umroh-detail, /haji-detail, /umroh-milad-detail adapt to actual packages and canonical /paket/[slug], never source IDs mapped arbitrarily.

Shared components: components/public/site-shell.tsx and public.module.css. Shared data: lib/travel/public-site.ts. Per-page CSS remains components/public/*.module.css. Screenshots in ignored output/playwright/tazkia*.png per project Playwright guidance. Existing auth/admin routes preserved; legacy technical administration URLs redirected to owner settings.

User customizations override cloner defaults: database stays real, no fake statistics or dead buttons, Hammad brand, Indonesian plain language, accessible 44px controls, no Tazkia logos/testimonials/legal assertions or branded photos. Local /images/makkah.jpg is the inspected Kaaba photo; /images/makkah-city.png reuses the inspected Makkah skyline image from the user's jamwisata-v2 project. An incorrectly identified stock image was removed during visual review. Font remains actual Plus Jakarta Sans / Manrope, requested attractive typography. Source design: blue/orange, not old green/gold.

Reference findings: sticky header100px, nav18px/600, consultation14px/700, source system-sans; hero48px/700 desktop36px mobile, blue gradient + orange highlights, hero image right, wave bottom; section titles36px, body16–20. Reference mistakes deliberately excluded: popup interruption, fake notification count, Haji USD/IDR mismatch, broken about link.
