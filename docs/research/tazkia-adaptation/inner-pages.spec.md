# Inner page component contract

Screenshot namespace: output/playwright/tazkia-inner-*.png. Browser inspection at desktop1440 and mobile390.
Shared imports: PublicShell({data,children}), CategoryHero({title,description,image}), async PackageCard({item}) from components/public/site-shell. Data: getPublicSite(), PublicSiteData, PublicPackage from lib/travel/public-site. Use Next Link and next-intl translations (both id/en). No new stack/dependencies.

## Programme landing
/haji and /umroh-plus: blue patterned split hero (48px desktop/36px mobile, body20); image right, white h1; soft wave bottom. Then actual programme cards, requirements and consultation. No invented history/team/licensing.

## Catalogue
/umroh, /wisata-halal, /umroh-starter-padang: hero then soft-gray listing area, 256px white filter sidebar + three cards at desktop; count and sort above; mobile stacked filters and single cards. Card image/title/date/duration/airline/price/detail. Input filter and sort must work. Type UMRAH/HAJJ/TOUR; Plus only names matching Plus; Padang only departureAirport matching Padang/PDG. Honest empty state when no packages. Source radii16–24px, blue text/button, orange accent, body16. No fake crossed-out prices or fabricated stock urgency.

## Details
/paket/[slug] canonical; source /umroh-detail,/haji-detail,/umroh-milad-detail query variants must resolve only actual id or slug and otherwise show useful not-found, not another package. Split hero; information left2/3 and price sidebar right1/3. Details from database: description, included/excluded lists, hotels, itinerary, requirements. Hide missing sections rather than fabricate. No raw JSON. Sidebar price/date/duration/contact; on mobile stacks. Contact CTA /kontak?paket=slug.

## Contact
/kontak: blue heading; actual contact/address left, labelled form right. No hardcoded WhatsApp number, office hours, map, or address. Form validates name/phone and prepares WhatsApp inquiry only if configured valid contact. If unconfigured, honest message and copy inquiry button; don't claim sent. Do not transmit any real user data during QA.

## FAQ/about
/faq: source category navigation and expanding answers; accessible details/summary, keyboard operable. Hammad-specific concise general process copy, not source pricing/legal promises. /tentang source404; provide short factual product/travel introduction without invented year/credentials/staff count. Link to packages/contact.

## Behaviors
Source catalog filters click-driven, FAQ click-driven, nav dropdown click/hover, no smooth-scroll library detected. Preserve native scrolling, no forced motion. Visible loading during actual route/data loading. All user copy localized, all controls44px or more. Screenshots must verify desktop/mobile. No pointless dead controls or links to #.
