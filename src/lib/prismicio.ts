// Prismic client setup — used exactly like src/data/blog.js's feed fetch:
// this only ever runs at BUILD TIME (inside `astro build`, in GitHub Actions),
// never in a visitor's browser. Prismic itself is fully hosted on Prismic's
// own infrastructure — nothing to install, nothing running on Namecheap.
//
// Your real Prismic repository ID, from the repo you created during setup.
// If a second (e.g. staging) repo is ever needed, swap this one line.
export const repositoryName = "b7egqvky";

import * as prismic from "@prismicio/client";

export const client = prismic.createClient(repositoryName, {
  fetchOptions: {
    // Prevents a scheduled rebuild from ever serving a stale CDN-cached
    // response for content that was just edited/published in Prismic.
    cache: "no-store",
  },
});

// Minimal hand-written slice shape (no Slice Machine / codegen in this
// project — you model slices directly in the Prismic dashboard, per
// PRISMIC-SLICES.md). This matches what the real API returns for any slice:
// `primary` holds the "Non-repeatable zone" fields, `items` holds the
// "Repeatable zone" fields (one array entry per repeated row).
export interface Slice<
  TSliceType extends string = string,
  TVariation extends string = string,
  TPrimary = Record<string, any>,
  TItem = Record<string, any>
> {
  id?: string;
  slice_type: TSliceType;
  slice_label: string | null;
  variation: TVariation;
  primary: TPrimary;
  items: TItem[];
}

export const { isFilled, asText, asHTML, asLink, asDate, asImageSrc } = prismic;
