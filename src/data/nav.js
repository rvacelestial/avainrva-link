// Single source of truth for site navigation.
// Edit this list to add/remove/reorder pages — header nav and footer both read from it.
// `children` marks real sub-pages (shown indented, under their parent, in OffCanvasMenu).
// Footer.astro renders this same list flat and ignores `children` on purpose — the footer
// menu stays a short flat list, the full parent/child structure only shows in the drawer.
export const nav = [
  { label: "Home", href: "/" },
  {
    label: "You",
    href: "/you/",
    children: [{ label: "Client Guide", href: "/you/client-guide/" }],
  },
  { label: "Me", href: "/me/" },
  {
    label: "Us",
    href: "/us/",
    children: [{ label: "Date Ideas", href: "/us/date-ideas/" }],
  },
  {
    label: "Contact / Screening",
    href: "/contact/",
    children: [{ label: "FAQ / Policy", href: "/contact/faq-policy/" }],
  },
];

export const footerExtra = [
  { label: "Blog", href: "/me/#blog" },
];

export const social = [
  { label: "Threads", href: "https://www.threads.com/@acinrva" },
  { label: "X", href: "https://x.com/avainrva" },
  { label: "Wish List", href: "https://youpay.me/AvainRVA804/gift/1173351" },
];
