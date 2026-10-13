/**
 * Converts a MinIO image URL to a proxied URL on production (HTTPS) sites.
 *
 * Images stored in the DB as "http://84.247.131.188:9000/..."
 * would be blocked by the browser on an HTTPS page (mixed content).
 * This function routes them through /api/image-proxy so they're
 * served over HTTPS from Vercel.
 *
 * On localhost (HTTP), the direct MinIO URL is returned unchanged.
 */
export function proxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Only proxy plain HTTP URLs (MinIO) — leave relative paths, HTTPS, data URLs, etc. alone
  if (!url.startsWith("http://")) return url;

  // Client-side: check actual protocol of the current page
  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:") {
      return `/api/image-proxy?path=${encodeURIComponent(url)}`;
    }
    return url;
  }

  // Server-side: fall back to NEXT_PUBLIC_APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl.startsWith("https://")) {
    return `${appUrl}/api/image-proxy?path=${encodeURIComponent(url)}`;
  }

  return url;
}
