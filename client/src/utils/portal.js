/**
 * Helper utility to detect which subdomain/portal the user is currently accessing.
 * - 'admin'     => admin.reflecto.com.sa or path starts with /admin
 * - 'technical' => technical.reflecto.com.sa or tech.reflecto.com.sa or path starts with /technical or /tech
 * - 'client'    => main site (reflecto.com.sa, www, localhost, etc.)
 */
export function getSubdomainPortal() {
  if (typeof window === 'undefined') return 'client';

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // Subdomain detection
  if (hostname.startsWith('admin.')) {
    return 'admin';
  }
  if (hostname.startsWith('technical.') || hostname.startsWith('tech.')) {
    return 'technical';
  }

  // Fallback for local development or sub-routes
  if (pathname.startsWith('/admin/login')) {
    return 'admin';
  }
  if (pathname.startsWith('/technical/login') || pathname.startsWith('/tech/login')) {
    return 'technical';
  }

  return 'client';
}
