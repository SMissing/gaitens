/**
 * Staff-facing copy: name and venue only (never staff login codes).
 */
export function formatStaffNameAndVenue(
  name: string | null | undefined,
  site: string | null | undefined,
): string {
  const n = (name ?? '').trim() || 'Unknown'
  const s = (site ?? '').trim()
  return s ? `${n} · ${s}` : n
}
