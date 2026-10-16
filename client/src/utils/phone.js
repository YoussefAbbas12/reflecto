/**
 * Phone utility helpers for Saudi Arabia (+966) formatting.
 * Storage: raw digits without country code (e.g. "501234567")
 * Display: with +966 prefix (e.g. "+966 501234567")
 */

/**
 * Normalise a phone input to raw Saudi digits (no +966/966/0 prefix).
 * Safe to store in DB.
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/[\s\-().]+/g, '');
  // Remove +966 or 966 prefix
  if (cleaned.startsWith('+966')) cleaned = cleaned.slice(4);
  else if (cleaned.startsWith('966')) cleaned = cleaned.slice(3);
  // Remove leading zero
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return cleaned;
}

/**
 * Format stored phone (raw digits) with +966 prefix for display.
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const raw = cleanPhoneNumber(phone.toString());
  return `+966 ${raw}`;
}

/**
 * Build the full international phone number for API calls.
 * e.g. "501234567" → "+966501234567"
 */
export function buildFullPhone(rawDigits) {
  if (!rawDigits) return '';
  const cleaned = cleanPhoneNumber(rawDigits);
  return `+966${cleaned}`;
}
