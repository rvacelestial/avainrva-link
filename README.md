# Ava Celeste site

Astro rebuild of avainrva.com, replacing the WordPress/Kadence build. Static output.

<<<<<<< HEAD
The GitHub repo (`rvacelestial` account) stays **private** — GitHub Pages only works
from a public repo on a free account, and a public repo would mean anyone who found it
could browse every file, including uploaded images and test/draft pages. Instead,
`.github/workflows/deploy.yml` builds the site in GitHub Actions and pushes the finished
`dist/` output to Namecheap hosting over SSH/rsync, so the actual domain serves the site
exactly as before, with the source and images never public. See that workflow file for
the one-time SSH key setup needed to turn this on for real.

## Structure

- `src/pages/` — one file (or folder, for a sub-page) per route. Adding a page is
  adding a file here; adding a sub-page is a folder one level deeper.
- `src/layouts/BaseLayout.astro` — shared head (favicons, fonts), header, footer. Takes a
  `fullBleed` prop for slice-driven pages (see the CMS section) — leave it off for ordinary
  prose pages.
- `src/components/` — `Header`, `Footer`, `ThemeToggle`, `ObfuscatedEmail`, `BlogPosts`,
  `ScrollReveal` (the fade-in-on-scroll used by the slice library), `SliceZone` (renders a
  Prismic page's slices — see the CMS section).
- `src/components/slices/` — the real Prismic slice library components (Hero, PullQuote,
  TextPhotoSplit, BioQuote, StatsBar, Testimonials, PhotoGallery, BlogCards, Accordion, Tabs,
  CallToAction). See `PRISMIC-SLICES.md` for the field spec.
- `src/lib/prismicio.ts` — the Prismic client (repo ID, fetch options, shared types).
- `src/data/nav.js` — single source of truth for the nav menu (header + footer both read from it).
- `src/styles/theme.css` — all design tokens: colors, fonts, the sunrise gradient, the
  grayscale-to-color photo hover effect, drop caps, light/dark theme variables.
- `public/` — favicons, `robots.txt`, self-hosted font file. Anything here is served as-is.

## Design tokens

Palette is Kadence global palette 1–9 (confirmed intentional; palette10–15 were unused
Kadence stock defaults and were dropped). Gold accent (`--color-accent-gold` in
`theme.css`) is finalized to a muted antique gold (`#c9a24b`) — every gold-colored element
on the site reads from that one variable, so changing it later is still a one-line edit.

Type scale is reconstructed from Ava's real Kadence clamp settings (360px–1920px viewport),
not guessed — see the component style sheet (v4) for the working `clamp()` values. Important:
H1/H4/H5 use the serif heading font (Bodoni Moda); H2/H3/H6 deliberately use the sans body
font (Peridot), with H3 italic — this is a real contrast system carried over from the old
site, not an oversight to "fix" by making everything serif.

Fonts: Adobe Fonts kit `wfk2vcj` (Bodoni Moda Variable for headers, Peridot PE Variable
for body/menu, Lindsey Signature for accent/script) loaded via `<link>` in
`BaseLayout.astro` — the kit ID is meant to be public, safe in a public repo. Summer
Pisces is self-hosted from `public/fonts/summer-pisces.woff2`.

Light/dark: `theme.css` defines both palettes as CSS custom properties; `ThemeToggle.astro`
lets a visitor override the system preference, remembered in their browser's
`localStorage` (per-visitor, never sent anywhere).

## Content status

- **Real, migrated copy:** Home (`/`), Me (`/me/`), Contact/Screening (`/contact/`),
  Deposit Instructions (`/deposit/`).
- **Placeholder pages, structure only:** You (`/you/`), Client Guide
  (`/you/client-guide/`), Us (`/us/`), Date Ideas (`/us/date-ideas/`), FAQ/Policy
  (`/contact/faq-policy/`).
- Contact page's screening email is confirmed and live: `screening@avainrva.com`
  (Protonmail via Cloudflare — MX/SPF/DMARC verified working), wired through
  `ObfuscatedEmail.astro` on `/contact/`.

## Anti-scraping / anti-AI

- `public/robots.txt` is your existing file, carried over as-is, plus an added
  `ia_archiver` / `archive.org_bot` disallow block — the old site's `.htaccess` blocked
  the Wayback Machine via an Apache rewrite rule. That rule had no equivalent on GitHub
  Pages (which doesn't process `.htaccess` at all), so robots.txt was the fallback. Now
  that the site deploys to Namecheap — real Apache hosting — the original `.htaccess`
  rule can likely be restored directly for a tighter block; worth revisiting once we're
  actually deploying there. robots.txt stays in place either way as a second layer,
  though archive.org doesn't always honor it — for an airtight block, archive.org also
  has a manual exclusion request process outside of this site.
- Footer includes the Anti-AI Statement text verbatim.
- Email addresses use `ObfuscatedEmail.astro` (click-to-reveal, assembled client-side)
  instead of WordPress's `[hide_email]` shortcode — no plugin needed.

## SEO (not yet done — revisit when focusing on SEO)

- Basic structural schema (WebSite, BreadcrumbList, BlogPosting) — low-effort, comes free
  from whichever component base ends up wired in (Astro Rocket / Keel both generate this).
- **TODO:** add `Person` schema for the "Ava Celeste" stage persona (public name + public
  info only, no address/phone) — a legitimate low-risk way to help search engines recognize
  the persona as a named entity.
- **Deliberately not doing:** `LocalBusiness` schema / Google Business Profile — Google's
  policies exclude adult/escort services from local-business listings; attempting it (even
  under the stage persona, even with no real address) risks a manual action against the
  whole site rather than helping. Skip entirely.
- **Deliberately not doing:** `llms.txt` — has no effect on search ranking/indexing (Google
  doesn't use it for that), it's aimed at AI chatbots/agents doing live retrieval or
  training, i.e. the exact thing the Anti-AI Statement and robots.txt disallow rules are
  already opting out of. Adding it would contradict that stance for zero SEO benefit.

## Link behavior (site-wide rule)

Every external link (blog citations, social embed cards, anything off-site) opens in a new
tab: `target="_blank" rel="noopener noreferrer"`. Every internal link (nav, cross-page
references like "see the Client Guide") stays same-page/same-tab, no target attribute.
When components get ported from style sheets into real `.astro` files, this needs to be
applied consistently rather than re-decided per component.

## Component library

Most of what's described below as "not yet ported into real `.astro` components" now *is*
real — as the Prismic slice library in `src/components/slices/` (see the CMS section above
and `PRISMIC-SLICES.md`). What follows is kept as the design history/rationale for that
library; treat "still just a style sheet" callouts below as superseded wherever a slice
covers that component now.

<details>
<summary>Design history (click to expand)</summary>

Working from Astro Rocket (MIT, Tailwind v4) as the base component set, reskinned to this
site's tokens, with visual/pattern borrows from a few other references (Lexington Themes'
Hemingway/Northbound for typography and palette-with-transparency feel — visual reference
only, never their code; Statichunt's Astro Horizon for the testimonial checkerboard and
bio+quote layout). Progress so far, as standalone HTML style sheets (not yet ported into
real `.astro` components):

- v1–v2: hero (3 variants: split / full-bleed+overlay / full-bleed no overlay), pull quote,
  text+photo split (+ alternating/reversed variant), bio+quote split, stats bar (a strong
  match for the "Physically" list on `/me/`), testimonial checkerboard grid, photo strip
  with a working click-to-enlarge lightbox, blog card grid, accordion, tabs, CTA band.
- v3: accordion rebuilt (div-based, not native `<details>`) so open/close gets a slight
  bounce (overshoot easing), plus a restrained scroll-reveal (fade + slight rise) on
  every block, skipped entirely under `prefers-reduced-motion`.
- v4: full type scale replaced with the real clamp() values reconstructed from Ava's old
  Kadence typography settings (see Design tokens above) instead of guessed sizes.
- v5: social-embed cards for X / Threads / Instagram, two variants each (text-only, and
  image-inclusive) — plain letterform icons (not the real trademarked logos) in each
  platform's brand color, styled with the site's own card language (square corners,
  same borders/type) rather than a pixel-exact platform copy. Text-only is the intended
  default (near-zero weight vs. real image bytes); image variant reserved for posts where
  the photo/video is the actual point. "View on [platform]" links already follow the
  external-link rule above.
- **Queued next / not yet designed:** a consistent icon set is needed for a wider range of
  platform links beyond the initial three socials — adult-industry platforms and wishlist
  services are coming. Whatever icon system gets picked for those should also cover
  X/Threads/Instagram so the whole set reads as one deliberate style, not ad hoc per-platform
  icons bolted on over time.
- **Real (ported into `.astro`):** Footer — restructured into three full-width bands (dark
  logo sliver, light band with tagline/columns/copyright, black band with the AI statement
  and directories), replacing the earlier inset-card layout; includes a back-to-top button
  (fixed bottom-right, charcoal background, cream chevron, appears after scrolling ~400px,
  respects `prefers-reduced-motion`).
- **Real (ported into `.astro`): `BlogPosts.astro`** — a reusable component, drop it on any
  page. Two variants: `variant="card"` (photo/tag/date/title/excerpt/gold link, matching the
  v1–v4 mockup) and `variant="list"` (an elegant text-only list — title, date, "Read more →",
  thin hairlines between rows, no tag/excerpt/photo). Props: `limit` (latest N posts, default
  3) or `urls` (an array of exact post URLs, in that order — for featuring a specific post
  anywhere regardless of publish date). Currently used on `/me/#blog` as
  `<BlogPosts variant="card" limit={3} />`. Backed by `src/data/blog.js`, which fetches
  `escortrichmond.com/feed.json` at **build time only** (never in the visitor's browser).
  A fetch failure, or a `urls` entry not found in the feed, is logged and skipped rather than
  breaking the build. **Caveat confirmed against the real feed: it only holds the ~7 most
  recent posts** — referencing a post by URL only works while it's still within that window.
  The GitHub Actions workflow now also rebuilds weekly (Monday 06:00 UTC, `schedule:` trigger
  added alongside the existing push trigger) so cards/lists pick up new posts on their own.

</details>

## Newsletters (not yet discussed)

Two separate newsletters to plan: the main site's newsletter (footer signup form already
exists as a placeholder in `Footer.astro`) and a separate blog-update letter (for
escortrichmond.com, the Publii blog on its own domain). You've self-hosted
[Sendy](https://sendy.co/) on AWS before and would use it again, but needs help with setup —
she can't configure it herself. Sendy is a paid one-time-license PHP app you run on your own
server (SES for sending), not a SaaS signup — this needs its own dedicated setup session:
provisioning (likely a small EC2 instance or Lightsail + SES), DNS/domain verification for
deliverability, and then wiring the two signup forms (main site + blog) to it.

## CMS — Prismic (chosen; slice library built, not yet wired to a real page)

Sitepins and Keystatic were both evaluated and ruled out along the way (Sitepins' admin UI
never worked reliably enough to test; Keystatic's insert-component system works but is a
plain-text/rich-text editing experience, not the visual slice picker you wanted). **Prismic
won**: it's fully hosted (nothing installed on Namecheap or anywhere else — see
`src/lib/prismicio.ts`), the Astro build only calls its API at build time (same pattern as
the existing blog-feed fetch), and it gives a real visual page builder — add, remove, and
reorder pre-built sections on any page, no plain textboxes.

Your real Prismic repository ID is `b7egqvky`. The actual component library — 11 slice
types, several with multiple variations, covering everything from the original design phase
(hero, pull quote, text+photo split, bio+quote, stats bar, testimonials, photo gallery with
lightbox, blog cards, accordion, tabs) plus two new CTA layouts you asked for (a 50/50 split
CTA, and a CTA in a colored box over a background image/video) — is built as real `.astro`
components in `src/components/slices/`, rendered by `src/components/SliceZone.astro`. See
**`PRISMIC-SLICES.md`** for the exact field spec to model each slice in Prismic's own Type
Builder (you do this yourself in your dashboard — there's no API access to create it
remotely). Verified end-to-end with a temporary mock-data test page (screenshotted, then
deleted) before this note was written: every variation renders correctly off the real design
tokens, and the interactive ones (tabs, accordion, gallery lightbox) actually work.

Not yet done: no real page fetches from Prismic yet, since you haven't modeled the slices in
her dashboard yet. `PRISMIC-SLICES.md` has the one-file wiring snippet for whenever a page is
ready to move over. Existing hand-written pages (Home, Me, Contact, Deposit) are untouched
and keep working exactly as before in the meantime — the slice library and today's site
coexist fine.

## Password protection (not yet wired in)

Plan is [Staticrypt](https://github.com/robinmoisson/staticrypt) as a post-build step:
it AES-encrypts the built HTML so the content is genuinely unreadable without the
password, not just hidden. Two sections planned: the Deposit page, and a future
screened-client archive area (with a photo watermark overlay + right-click/drag
disabled — not the grayscale/hover effect used elsewhere on the site).

## Build & deploy

```
npm install
npm run dev      # local preview
npm run build    # outputs to dist/
```

`.github/workflows/deploy.yml` builds the site on every push to `main` (plus a weekly
schedule, for the blog feed) and uploads `dist/` straight to Namecheap over SSH/rsync.
It needs five repo secrets set once in Settings → Secrets and variables → Actions
(`NAMECHEAP_SSH_KEY`, `NAMECHEAP_HOST`, `NAMECHEAP_USER`, `NAMECHEAP_SSH_PORT`,
`NAMECHEAP_TARGET_PATH`) — see the comments in the workflow file for exactly what each
one is and where it comes from. Staticrypt isn't wired into this workflow yet — see the
TODO comment in the workflow file for where it'll go once the archive section exists.
=======
>>>>>>> cf3e8207b2ac7a272b2f71f5c86db89c8fa6e3ae
