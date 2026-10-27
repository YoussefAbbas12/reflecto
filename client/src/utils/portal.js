/**
 * Helper utility to detect which subdomain/portal the user is currently accessing.
 * - 'admin'     => admin.reflecto.com.sa, www.admin.reflecto.com.sa, admin.localhost
 * - 'technical' => technical.reflecto.com.sa, tech.reflecto.com.sa, technical.localhost
 * - 'client'    => main site (reflecto.com.sa, www.reflecto.com.sa, localhost, etc.)
 */
export function getSubdomainPortal() {
  if (typeof window === 'undefined') return 'client';

  const hostname = window.location.hostname.toLowerCase();

  // 1. Strict Admin Subdomain matching
  if (
    hostname.startsWith('admin.') ||
    hostname.startsWith('www.admin.') ||
    hostname.includes('.admin.') ||
    hostname === 'admin.localhost'
  ) {
    return 'admin';
  }

  // 2. Strict Technical Subdomain matching
  if (
    hostname.startsWith('technical.') ||
    hostname.startsWith('tech.') ||
    hostname.startsWith('www.technical.') ||
    hostname.startsWith('www.tech.') ||
    hostname.includes('.technical.') ||
    hostname.includes('.tech.') ||
    hostname === 'technical.localhost' ||
    hostname === 'tech.localhost'
  ) {
    return 'technical';
  }

  // 3. Localhost development explicit query override: ?portal=admin or ?portal=tech
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('portal');
    if (p === 'admin') return 'admin';
    if (p === 'technical' || p === 'tech') return 'technical';
  }

  return 'client';
}

