/**
 * Helper to resolve company logo URLs for frontend display.
 * Handles base64 data URLs, absolute URLs, and relative backend paths (e.g. /assets/company/logo.png).
 */
export function getCompanyLogoUrl(url) {
  if (!url) return '';
  const strUrl = String(url).trim();
  if (!strUrl) return '';

  // Data URLs (base64) or absolute HTTP/HTTPS URLs
  if (strUrl.startsWith('data:') || strUrl.startsWith('http://') || strUrl.startsWith('https://')) {
    return strUrl;
  }

  // Format clean relative path
  const relativePath = strUrl.startsWith('/') ? strUrl : `/${strUrl}`;

  // Check current browser origin and environment
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const apiBase = (import.meta.env.VITE_API_URL || '').trim();

    // If page is loaded via HTTPS (e.g. https://reflecto.com.sa) but apiBase is http://localhost
    // Browser will block http://localhost due to Mixed Content. Use current location origin instead.
    if (isHttps && apiBase.startsWith('http://localhost')) {
      return relativePath;
    }

    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
      return `${backendOrigin}${relativePath}`;
    }
  }

  return relativePath;
}


