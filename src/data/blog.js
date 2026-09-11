// Fetches Ava's blog posts — a separate site (escortrichmond.com, running Publii),
// never migrating onto this domain — at BUILD TIME only. This never runs in a
// visitor's browser; it runs once when `astro build` runs. The GitHub Actions
// workflow rebuilds weekly on a schedule (see .github/workflows/deploy.yml) since
// posting is sporadic, so cards/lists stay reasonably fresh without any backend.
//
// IMPORTANT caveat, confirmed against the real feed: it only holds the ~7 most
// recent posts (currently spans Nov 2025–Mar 2026). Referencing a specific post
// by URL only works while that post is still within the feed's window — once a
// post ages out, it can no longer be found this way. There's no fix for that
// from this side; it's a property of the feed itself.
const FEED_URL = "https://escortrichmond.com/feed.json";

function normalize(item) {
  return {
    id: item.id,
    url: item.url,
    title: item.title,
    summary: item.summary ?? null,
    image: item.image ?? null,
    tag: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : null,
    date: item.date_published
      ? new Date(item.date_published).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null,
  };
}

/**
 * Get blog posts to display.
 *
 * Default (no `urls`): the `limit` most recent posts, newest first.
 * With `urls`: exactly those posts, in the order given — for featuring a
 * specific post (or a hand-picked set) anywhere on the site, regardless of
 * whether it's the most recent thing published. Only works while the post
 * is still within the feed's ~7-post window (see note above); a URL that
 * isn't found is skipped with a build-time warning, not a crash.
 */
export async function getBlogPosts({ limit = 3, urls } = {}) {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Feed responded ${res.status}`);
    const feed = await res.json();
    const items = Array.isArray(feed.items) ? feed.items : [];

    if (urls && urls.length > 0) {
      const byUrl = new Map(items.map((item) => [item.url, item]));
      const found = [];
      for (const requestedUrl of urls) {
        const match = byUrl.get(requestedUrl);
        if (match) {
          found.push(normalize(match));
        } else {
          console.warn(
            `[blog] Requested post not found in feed (outside its ~7-post window, or the URL doesn't match exactly): ${requestedUrl}`
          );
        }
      }
      return found;
    }

    return items
      .slice()
      .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
      .slice(0, limit)
      .map(normalize);
  } catch (err) {
    // A build-time fetch failure (blog briefly down, network hiccup on the weekly
    // scheduled rebuild) should never take the rest of the site down with it —
    // log it and fall back to an empty list; callers show a simple message
    // and a direct link to the blog instead of a broken grid/list.
    console.warn(`[blog] Could not fetch ${FEED_URL}: ${err.message}`);
    return [];
  }
}
