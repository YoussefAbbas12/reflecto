/**
 * OTP Store — in-memory بسيط للـ development
 * في الـ production استبدله بـ Redis
 *
 * Map structure: phone → { otp, expiresAt, attempts }
 */

const store = new Map();

// تنظيف تلقائي كل دقيقة
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (now > val.expiresAt) store.delete(key);
  }
}, 60_000);

function setOTP(phone, otp, ttlSeconds = 300) {
  store.set(phone, {
    otp,
    expiresAt: Date.now() + ttlSeconds * 1000,
    attempts: 0,
  });
}

function getOTP(phone) {
  const entry = store.get(phone);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return null;
  }
  return entry;
}

function incrementAttempts(phone) {
  const entry = store.get(phone);
  if (entry) entry.attempts += 1;
}

function deleteOTP(phone) {
  store.delete(phone);
}

// Rate limit: كام طلب OTP في الساعة لنفس الرقم
const rateMap = new Map();

/**
 * Returns true if the phone number IS rate-limited (should be blocked).
 * Returns false if the request is allowed to proceed.
 */
function checkRateLimit(phone, maxPerHour = 5) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const entry = rateMap.get(phone) || { count: 0, windowStart: now };

  // Reset window if an hour has passed
  if (now - entry.windowStart > windowMs) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  rateMap.set(phone, entry);

  // true = blocked, false = allowed
  return entry.count > maxPerHour;
}

module.exports = { setOTP, getOTP, incrementAttempts, deleteOTP, checkRateLimit };
