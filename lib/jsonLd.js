// JSON.stringify doesn't escape '<', so a value containing the literal
// text "</script>" would close the script tag early and let whatever
// follows it run as HTML/script in the page. Every field that ends up in
// one of these blocks today is admin-authored (FAQ answers, bios, post
// titles) rather than public-submitted, but escaping costs nothing and
// means a future field that isn't admin-only doesn't quietly reopen this.
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// Shared by every subpage that wants a BreadcrumbList (about, workshop,
// blog, blog/[slug]) — items is [{ name, url }] from Home down to the
// current page, in order.
export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
