// Browser-side helper for firing a Pixel event with an explicit eventID,
// so it can dedup against the matching server-side CAPI event (see
// lib/metaCapi.js) — Meta dedups two events sharing the same event_name +
// event_id within a short window, counting them once.
//
// A no-op whenever fbq isn't loaded (consent declined, or still on
// /admin) — in that case only the server-side CAPI event fires, and there
// is nothing to dedup against.
export function trackPixelEvent(eventName, params, eventId) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  window.fbq('track', eventName, params || {}, eventId ? { eventID: eventId } : undefined)
}
