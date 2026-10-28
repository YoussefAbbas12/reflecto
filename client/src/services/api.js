// ──────────────────────────────────────────────────────────────
// Reflecto API Service Layer
// Handles: base requests, token management, silent refresh,
//          and all domain-specific service exports.
// ──────────────────────────────────────────────────────────────

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://back.reflecto.com.sa/api/v1'
).replace(/\/$/, '');

// ─── Token Helpers ───────────────────────────────────────────

const TOKEN_KEYS = {
  access: 'reflecto_access_token',
  refresh: 'reflecto_refresh_token',
  user: 'reflecto_user',
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.access);
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.refresh);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setTokens = ({ access_token, refresh_token, user }) => {
  if (access_token) localStorage.setItem(TOKEN_KEYS.access, access_token);
  if (refresh_token) localStorage.setItem(TOKEN_KEYS.refresh, refresh_token);
  if (user) localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(user));
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
  localStorage.removeItem(TOKEN_KEYS.user);
  // Also clear the legacy key used by the old AuthContext
  localStorage.removeItem('reflecto_auth');
};

// ─── Custom Error ────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ─── Core Request Engine ─────────────────────────────────────

/** Flag to avoid multiple simultaneous refresh attempts */
let isRefreshing = false;
/** Queue of requests waiting for a token refresh */
let refreshQueue = [];

/**
 * Process the queue of waiting requests after a refresh attempt.
 * @param {string|null} newToken – the fresh access token (null = refresh failed)
 */
const processRefreshQueue = (newToken) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (newToken) resolve(newToken);
    else reject(new ApiError(401, 'SESSION_EXPIRED', 'Session expired'));
  });
  refreshQueue = [];
};

/**
 * Attempt to refresh the access token silently.
 * @returns {Promise<string>} new access token
 */
const refreshAccessToken = async () => {
  const refresh_token = getRefreshToken();
  if (!refresh_token) {
    throw new ApiError(401, 'NO_REFRESH_TOKEN', 'No refresh token available');
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    clearTokens();
    throw new ApiError(401, 'REFRESH_FAILED', 'Token refresh failed');
  }

  const data = await res.json();
  setTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refresh_token,
    user: data.user,
  });

  return data.access_token;
};

/**
 * Low-level request function. Automatically attaches auth headers
 * and handles 401 → silent refresh → retry.
 *
 * @param {string} endpoint – relative path, e.g. "/me"
 * @param {RequestInit & { _retry?: boolean }} options
 * @returns {Promise<any>} parsed JSON body
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  const response = await fetch(url, config);

  // ── Handle 401 with silent refresh (skip for auth endpoints) ──
  const isAuthEndpoint = endpoint.startsWith('/auth/login') ||
                         endpoint.startsWith('/auth/verify') ||
                         endpoint.startsWith('/auth/refresh') ||
                         endpoint.startsWith('/auth/send-');

  if (response.status === 401 && !options._retry && !isAuthEndpoint) {
    if (isRefreshing) {
      // Another call is already refreshing — wait in line
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      return request(endpoint, { ...options, headers, _retry: true });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processRefreshQueue(newToken);
      headers['Authorization'] = `Bearer ${newToken}`;
      return request(endpoint, { ...options, headers, _retry: true });
    } catch (err) {
      processRefreshQueue(null);
      // Redirect to login
      clearTokens();
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hostname = window.location.hostname.toLowerCase();
        if (hostname.startsWith('admin.') || path.startsWith('/admin')) {
          window.location.href = 'https://seeda.reflecto.com.sa/#login';
        } else if (hostname.startsWith('technical.') || hostname.startsWith('tech.') || path.startsWith('/technician') || path.startsWith('/tech')) {
          window.location.href = 'https://seeda.reflecto.com.sa/#login';
        } else {
          window.location.href = '/login';
        }
      }
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  // ── Parse response ──
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error?.code || 'UNKNOWN',
      data?.error?.message || `API Error: ${response.status} ${response.statusText}`
    );
  }

  return data;
};

// ─── Convenience HTTP Methods ────────────────────────────────

const api = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  put(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
// Domain Services
// ═══════════════════════════════════════════════════════════════

// ─── 1. Auth ─────────────────────────────────────────────────

export const authService = {
  getMe() {
    return api.get('/me');
  },
  /** Send OTP code to a phone number */
  sendOTP(phone) {
    return api.post('/auth/otp/send', { phone });
  },

  verifyOTP(phone, code, create_if_missing, portal_type) {
    return api.post('/auth/otp/verify', { phone, code, create_if_missing, portal_type });
  },

  /** Login with phone or email and password */
  loginWithPassword(identifier, password, portal_type) {
    return api.post('/auth/login', { 
      phone: identifier, 
      email: identifier, 
      identifier, 
      password, 
      portal_type 
    });
  },

  /** Send OTP code for registration */
  sendSignupOTP(phone) {
    return api.post('/auth/signup/otp/send', { phone });
  },

  /** Verify OTP code for registration and get signup token */
  verifySignupOTP(phone, code) {
    return api.post('/auth/signup/otp/verify', { phone, code });
  },

  /** Complete registration with password, name, and email */
  completeSignup(signupToken, password, full_name, email) {
    return api.post('/auth/signup/complete', {
      signup_token: signupToken,
      password,
      full_name: full_name || undefined,
      email: email || undefined,
    });
  },

  /** Send OTP code for password reset */
  sendResetOTP(phone) {
    return api.post('/auth/reset/otp/send', { phone });
  },

  /** Verify OTP code for password reset and get reset token */
  verifyResetOTP(phone, code) {
    return api.post('/auth/reset/otp/verify', { phone, code });
  },

  /** Reset password with reset token */
  resetPassword(resetToken, password) {
    return api.post('/auth/reset/password', { reset_token: resetToken, password });
  },

  /** Refresh the access token */
  refreshToken() {
    return refreshAccessToken();
  },

  /** Logout — invalidates tokens on the server */
  logout() {
    return api.post('/auth/logout').finally(() => clearTokens());
  },
};

// ─── 2. Client Profile (authenticated client) ───────────────

export const meService = {
   /** Get full client profile: appointment, loyalty, warranty, stats */
   getProfile() {
     return api.get('/me');
   },

   /** Get client's payment history */
   getPayments() {
     return api.get('/me/payments');
   },

   /** Get client's vehicles */
   getVehicles() {
     return api.get('/me/vehicles');
   },

   /** Add a new vehicle for the client */
   addVehicle(data) {
     return api.post('/me/vehicles', data);
   },

   /** Redeem loyalty points (1000 / 2500 / 5000) */
   redeemPoints(points) {
     return api.post('/me/loyalty/redeem', { points });
   },

   /** Transfer / gift points to another user */
   transferPoints(to_phone, points) {
     return api.post('/me/loyalty/transfer', { to_phone, points });
   },

   /** Change user password */
   changePassword(currentPassword, newPassword) {
     return api.post('/me/change-password', {
       current_password: currentPassword,
       new_password: newPassword,
     });
   },

   /** Update employee code */
   updateEmployeeCode(employee_code) {
     return api.put('/me/employee-code', { employee_code });
   },
};

// ─── 3. Checkout / Payments ──────────────────────────────────

export const checkoutService = {
  /** Create a Tabby payment session */
  createTabby(payload) {
    return api.post('/checkout/tabby', payload);
  },

  /** Create a Tamara payment session */
  createTamara(payload) {
    return api.post('/checkout/tamara', payload);
  },

  /** Create a test checkout (no real payment) */
  createTest(payload) {
    return api.post('/checkout/test', payload);
  },

  /** Confirm payment completion */
  confirmPayment(payload) {
    return api.post('/checkout/confirm', payload);
  },

  /** Get all checkout records (admin only) */
  getAll() {
    return api.get('/checkout');
  },
};

// ─── 4. Public Endpoints ─────────────────────────────────────

export const servicesService = {
  /** Get all services */
  getAll(all = false) {
    return api.get(`/services${all ? '?all=true' : ''}`);
  },
  /** Get single service by ID */
  getById(id) {
    return api.get(`/services/${id}`);
  },
  /** Create a new service */
  create(data) {
    return api.post('/services', {
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
      price: data.price,
    });
  },
  /** Update a service */
  update(id, data) {
    return api.put(`/services/${id}`, {
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
      price: data.price,
      is_active: data.is_active,
    });
  },
  /** Delete a service */
  remove(id) {
    return api.delete(`/services/${id}`);
  },
};

export const pricingService = {
  /** Get pricing / packages */
  getAll(companyId = null) {
    const rawCompId = (typeof companyId === 'string' || typeof companyId === 'number') ? companyId : null;
    const user = getStoredUser();
    const targetCompId = rawCompId || user?.company_id || user?.company?.id || null;
    return api.get(`/pricing${targetCompId ? `?company_id=${encodeURIComponent(targetCompId)}` : ''}`);
  },
  /** Get single package by ID */
  getById(id) {
    return api.get(`/pricing/${id}`);
  },

  /** Update a pricing tier */
  update(id, data) {
    return api.put(`/pricing/${id}`, {
      name_en: data.name_en || data.name,
      name_ar: data.name_ar,
      tagline_en: data.tagline_en || data.description,
      tagline_ar: data.tagline_ar,
      price: data.price,
      warranty_years: data.warranty_years || data.warranty,
      features_en: data.features_en || data.features,
      features_ar: data.features_ar,
      service_id: data.service_id,
      client_id: data.client_id,
    });
  },
  /** Create a new pricing tier */
  create(data) {
    const slug = (data.name_en || data.name).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    return api.post('/pricing', {
      slug,
      name_en: data.name_en || data.name,
      name_ar: data.name_ar,
      tagline_en: data.tagline_en || data.description,
      tagline_ar: data.tagline_ar,
      price: data.price,
      warranty_years: data.warranty_years || data.warranty,
      features_en: data.features_en || data.features || [],
      features_ar: data.features_ar || [],
      is_popular: false,
      sort_order: 0,
      service_id: data.service_id,
      client_id: data.client_id,
    });
  },

  /** Delete a pricing tier */
  remove(id) {
    return api.delete(`/pricing/${id}`);
  },
};

export const contactService = {
  /** Submit a contact / booking form */
  submitForm(formData) {
    return api.post('/contact', formData);
  },
  /** Get contact requests (admin) */
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api.get(`/contact${query ? `?${query}` : ''}`);
  },
  /** Update request status */
  updateStatus(id, status) {
    return api.put(`/contact/${id}`, { status });
  },
};

// ─── Orders & Check List Service ─────────────────────────────

export const ordersService = {
  getAll(page = 1, status = 'all', search = '', branch = 'all') {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (branch && branch !== 'all') params.append('branch', branch);
    return api.get(`/orders?${params.toString()}`);
  },
  getById(id) {
    return api.get(`/orders/${id}`);
  },
  getNextWO() {
    return api.get('/orders/next-number');
  },
  create(data) {
    return api.post('/orders', data);
  },
  update(id, data) {
    return api.put(`/orders/${id}`, data);
  },
  remove(id) {
    return api.delete(`/orders/${id}`);
  },
  addPartialPayment(id, data) {
    return api.post(`/orders/${id}/partial-payment`, data);
  },
  activateWarranties(id) {
    return api.post(`/orders/${id}/activate-warranties`);
  },
  payRemaining(data) {
    return api.post('/orders/pay-remaining', data);
  },
};


// ─── 5. Admin ────────────────────────────────────────────────

export const adminService = {
  /** Admin overview stats */
  getOverview() {
    return api.get('/admin/overview');
  },

  /** Admin scheduling data for a specific date */
  getScheduling(date) {
    const query = date ? `?date=${date}` : '';
    return api.get(`/admin/scheduling${query}`);
  },
};

// ─── 6. Appointments ─────────────────────────────────────────

export const appointmentService = {
   /** List appointments, optionally filtered by status */
   getAll(status) {
     const query = status ? `?status=${status}` : '';
     return api.get(`/appointments${query}`);
   },

   /** Get single appointment by ID */
   getById(id) {
     return api.get(`/appointments/${id}`);
   },

   /** Create a new appointment */
   create(data) {
     return api.post('/appointments', data);
   },

   /** Update an appointment (status, progress, etc.) */
   update(id, data) {
     return api.put(`/appointments/${id}`, data);
   },

   /** Cancel an appointment */
   cancel(id) {
     return api.delete(`/appointments/${id}`);
   },

   /** Remove an appointment permanently */
   remove(id) {
     return api.delete(`/appointments/${id}`);
   },
};

// ─── 7. Clients (admin) ─────────────────────────────────────

export const clientService = {
  /** List clients with pagination, optional role filter, branch filter, and search */
  getAll(page = 1, role = 'all', search = '', branch = 'all') {
    let limitStr = '';
    if (typeof page === 'object' && page !== null) {
      const opts = page;
      page = opts.page || 1;
      role = opts.role || 'all';
      search = opts.search || '';
      branch = opts.branch || 'all';
      if (opts.limit) limitStr = `&limit=${opts.limit}`;
    }
    let url = `/clients?page=${page}&role=${role}${limitStr}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (branch && branch !== 'all') url += `&branch=${encodeURIComponent(branch)}`;
    return api.get(url);
  },

  /** Search clients by name or phone with optional role filter */
  search(query, role = '') {
    let url = `/clients/search?q=${encodeURIComponent(query)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    return api.get(url);
  },

  /** Get a single client by ID */
  getById(id) {
    return api.get(`/clients/${id}`);
  },

  /** Create a client */
  create(data) {
    return api.post('/clients', data);
  },

  /** Update a client */
  update(id, data) {
    return api.put(`/clients/${id}`, data);
  },

  /** Delete a client */
  remove(id) {
    return api.delete(`/clients/${id}`);
  },
  delete(id) {
    return api.delete(`/clients/${id}`);
  },

  /** Force reset password to default (00000) */
  resetPassword(id) {
    return api.post(`/clients/${id}/reset-password`);
  },
  forceResetPassword(id) {
    return api.post(`/clients/${id}/reset-password`);
  },

  /** Award or deduct loyalty points manually */
  awardPoints(id, points, action = 'add', description = '') {
    return api.post(`/clients/${id}/award-points`, { points, action, description });
  },
  updatePoints(id, points, action = 'add', description = '') {
    return api.post(`/clients/${id}/award-points`, { points, action, description });
  },

  /** Activate all pending warranties for a client */
  activateWarranties(id) {
    return api.post(`/clients/${id}/activate-warranties`);
  },

  /** Get list of technicians */
  getTechnicians() {
    return api.get('/clients/technicians');
  },

  /** Get list of available company logos from /assets/company */
  getCompanyIcons() {
    return api.get('/clients/company-icons');
  },

  /** Upload a new company logo (base64) */
  uploadCompanyIcon(filename, base64) {
    return api.post('/clients/company-icons/upload', { filename, base64 });
  },
};

// ─── Technician Service ────────────────────────────────────

export const technicianService = {
  getAssignedOrders() {
    return api.get('/technician/work-orders');
  },
  updateServiceProgress(orderId, payload) {
    return api.put(`/technician/work-orders/${orderId}/progress`, payload);
  },
  getHistory() {
    return api.get('/technician/history');
  },
  getCommissions() {
    return api.get('/technician/commissions');
  },
  getTechnicianCommissionsByAdmin(id) {
    return api.get(`/technician/technicians/${id}/commissions`);
  },
};

// ─── 8. Coupons ──────────────────────────────────────────────

export const couponService = {
  /** List all coupons */
  getAll() {
    return api.get('/coupons');
  },

  /** Create a new coupon */
  create(data) {
    return api.post('/coupons', data);
  },

  /** Validate & apply a coupon code */
  apply(code, original_price) {
    return api.post('/coupons/apply', { code, original_price });
  },

  /** Delete a coupon completely */
  remove(id) {
    return api.delete(`/coupons/${id}`);
  },
};


export const configService = {
  /** Get backend system config (e.g. test_mode) */
  getConfig() {
    return api.get('/config').catch(() => ({ test_mode: false }));
  },
};

// ─── 9. Companies / Corporate ────────────────────────────────

export const companyService = {
  getAll() {
    return api.get('/companies');
  },
  getById(id) {
    return api.get(`/companies/${id}`);
  },
  create(data) {
    return api.post('/companies', data);
  },
  update(id, data) {
    return api.put(`/companies/${id}`, data);
  },
  remove(id) {
    return api.delete(`/companies/${id}`);
  },
  delete(id) {
    return api.delete(`/companies/${id}`);
  },
};

// ─── 10. Reviews ─────────────────────────────────────────────

export const reviewsService = {
  /** Submit service review */
  submitReview(payload) {
    return api.post('/reviews/submit', payload);
  },

  /** Get client's own reviews */
  getMyReviews() {
    return api.get('/reviews/my-reviews');
  },

  /** Get admin review stats & list */
  getAdminReviews(params = {}) {
    const query = new URLSearchParams();
    if (params.branch && params.branch !== 'all') query.append('branch', params.branch);
    if (params.period && params.period !== 'all') query.append('period', params.period);
    const queryString = query.toString();
    return api.get(`/reviews/admin${queryString ? `?${queryString}` : ''}`);
  },
};

export const roleService = {
  getAll() {
    return api.get('/roles');
  },
  create(data) {
    return api.post('/roles', data);
  },
  update(id, data) {
    return api.put(`/roles/${id}`, data);
  },
  remove(id) {
    return api.delete(`/roles/${id}`);
  },
  updateUserPermissions(userId, data) {
    return api.put(`/roles/user/${userId}`, data);
  },
};

export default api;