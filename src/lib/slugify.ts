/** Shared slugify — used by GoLiveFlow, DomainSearch, and homepage domain checker */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 63)
}
