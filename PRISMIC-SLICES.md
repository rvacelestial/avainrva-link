# Prismic slice library — Type Builder field spec

This is the "recipe card" for each slice component already built in
`src/components/slices/`. Model each one in Prismic's dashboard (Custom
Types → your page type → the Slices field → Add a new slice, or reuse an
existing one), matching the fields below exactly by **API ID** (the name in
code, not the display label — display labels can say whatever you want).

General notes that apply to every slice below:

- **Non-repeatable zone** = one set of fields per slice (Prismic calls this
  `primary` under the hood — the code already expects that name, you don't
  type it anywhere).
- **Repeatable zone** = a field group that repeats row by row (`items` in
  code) — use this for anything you'd want to add/remove rows of (stats,
  testimonials, FAQ questions, tabs, gallery photos) without touching code.
- **Variations**: a few slices below have more than one — model them as
  separate Variations on the *same* slice (Prismic's variation picker), not
  as separate slices. That's what keeps your insert menu short even as the
  design grows (the "40 slices, many with variants" pattern from Prismic's
  own customers).
- Field **API IDs must match exactly** (case-sensitive, underscores not
  dashes) — that's the only part that has to be precise. Labels, the order
  fields appear in the dashboard, and grouping are entirely up to you.

---

## Hero — `hero`

Three variations, same field set on each (leave fields blank on `plain` that
it doesn't use — it just won't render them):

| Variation API ID | What it looks like |
|---|---|
| `split` (default) | Text left, photo right |
| `overlay` | Full-bleed photo, dark gradient, text at the bottom |
| `plain` | Full-bleed photo, no overlay, caption band below |

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `eyebrow` | Key Text | Small caps line above the heading |
| `heading` | Key Text | The full headline, e.g. "Your manic pixie dream girl." |
| `accent_phrase` | Key Text | Optional. Must be an exact substring of `heading` — that phrase gets the script-font/blush styling. Leave blank for a plain heading. |
| `body` | Key Text | Optional short paragraph (used on `split`/`overlay`, ignored on `plain`) |
| `image` | Image | Background/photo |

## Pull quote — `pull_quote`

One variation (`default`).

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `quote` | Rich Text | Italicize a word from the toolbar if you want emphasis, same as the "sans" in the original design |

## Text + photo split — `text_photo_split`

Two variations:
| Variation API ID | What it looks like |
|---|---|
| `default` | Text left, photo right |
| `reversed` | Photo left, text right (same fields, just flipped) |

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `heading` | Key Text | |
| `body` | Rich Text | |
| `drop_cap` | Boolean | On = first letter gets the large drop-cap treatment |
| `image` | Image | |

## Bio + quote — `bio_quote`

One variation (`default`). This is the "Meet Your Photographer"-style layout
— boxed pull-quote next to a photo.

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `eyebrow` | Key Text | e.g. "Hi, I'm" |
| `name` | Key Text | e.g. "Ava" |
| `quote` | Key Text | The boxed quote |
| `signature` | Key Text | Shown as "— {signature}" |
| `image` | Image | |

## Stats bar — `stats_bar`

One variation (`default`). No non-repeatable fields needed.

Repeatable zone — one row per stat:
| Field API ID | Type |
|---|---|
| `number` | Key Text |
| `label` | Key Text |

## Testimonials — `testimonials`

One variation (`default`). No non-repeatable fields needed.

Repeatable zone — one row per testimonial:
| Field API ID | Type |
|---|---|
| `photo` | Image |
| `name` | Key Text |
| `quote` | Key Text |

## Photo gallery — `photo_gallery`

One variation (`default`). No non-repeatable fields needed.

Repeatable zone — one row per photo:
| Field API ID | Type |
|---|---|
| `photo` | Image |

Clicking any photo opens a real lightbox. Add as many rows as you want.

## Blog cards — `blog_cards`

Two variations, matching the existing `BlogPosts.astro` component's two
display styles:
| Variation API ID | What it looks like |
|---|---|
| `card` (default) | Photo/tag/date/title/excerpt grid |
| `list` | Text-only list — title, date, "Read more" |

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `heading` | Key Text | Optional heading above the grid/list |
| `limit` | Number | How many recent posts to show (defaults to 3 if left blank) |

## Accordion — `accordion`

One variation (`default`). No non-repeatable fields needed.

Repeatable zone — one row per question:
| Field API ID | Type |
|---|---|
| `question` | Key Text |
| `answer` | Rich Text |

## Tabs — `tabs`

One variation (`default`). No non-repeatable fields needed.

Repeatable zone — one row per tab:
| Field API ID | Type |
|---|---|
| `label` | Key Text |
| `content` | Rich Text |

## Call to action — `call_to_action`

Three variations — this covers both of your new CTA ideas plus the original
band design:
| Variation API ID | What it looks like |
|---|---|
| `band` (default) | Original CTA band — solid gold/sunrise gradient, centered text |
| `split` | Your "50/50 split CTA" idea — text/button one side, photo the other |
| `image_background` | Your "CTA in a colored box over a background image/video" idea |

Non-repeatable zone:
| Field API ID | Type | Notes |
|---|---|---|
| `heading` | Key Text | |
| `body` | Key Text | |
| `button_label` | Key Text | |
| `button_link` | Link | Internal page or external URL |
| `image` | Image | Used by `split` and `image_background` |
| `background_video` | Link to Media | Optional, `image_background` only — a video file uploaded to Prismic's media library (or any hosted .mp4/.webm URL). Leave blank to just use `image` as a still photo instead. |

---

## Wiring a page up to use these

Once a "Page" (or similarly named) custom type has a **Slices** field
containing the slice types above, any page built from it renders with:

```astro
---
import { client } from "../lib/prismicio.ts";
import SliceZone from "../components/SliceZone.astro";

const page = await client.getByUID("page", Astro.params.uid);
---
<BaseLayout title={page.data.meta_title} fullBleed={true}>
  <SliceZone slices={page.data.slices} />
</BaseLayout>
```

`fullBleed` matters — it's a new option on `BaseLayout` (see its comments)
that turns off the 900px prose-width cap the hand-written pages (Me,
Contact, etc.) use, since these sections are designed to bleed edge-to-edge.
Leave `fullBleed` off (or omit it) for any page that isn't slice-driven.

This wiring hasn't been added to a real route yet — it's one file, written
whenever you're ready to actually move a page (or a new one) onto Prismic.
Nothing about the existing hand-written pages changes until that happens;
the slice library and the current site coexist fine in the meantime.
