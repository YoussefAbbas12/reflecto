const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  'https://reflecto.com.sa',
  'https://www.reflecto.com.sa',
  'https://admin.reflecto.com.sa',
  'https://technical.reflecto.com.sa',
  'https://seeda.reflecto.com.sa',
  'https://seeda.sa',
  'https://www.seeda.sa',
  'https://seeda.com.sa',
  'https://www.seeda.com.sa',
  'https://seeda.com',
  'https://www.seeda.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://admin.localhost:5173',
  'http://technical.localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...configuredOrigins,
]);

// ==================== Security ====================

app.use(helmet({ contentSecurityPolicy: false }));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.has(cleanOrigin) ||
      /^https?:\/\/([a-z0-9-]+\.)?reflecto\.com\.sa(:\d+)?$/i.test(cleanOrigin) ||
      /^http:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/i.test(cleanOrigin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(cleanOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==================== Rate Limiting ====================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// ==================== Body Parsing ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/assets', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../public/assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

// ==================== Health Check ====================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Reflecto API is running',
    timestamp: new Date().toISOString(),
  });
});

// ==================== Routes ====================

const apiRoutes = express.Router();

apiRoutes.use((req, res, next) => {
  if (req.method === 'GET' && /^\/(services|pricing)(\/|$)/.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
});

apiRoutes.get('/config', (req, res) => {
  res.json({
    success: true,
    test_mode: process.env.TEST_MODE === 'true',
    allow_debug_otp: process.env.ALLOW_DEBUG_OTP === 'true',
  });
});

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const clientsRoutes = require('./routes/clients.routes');
const companiesRoutes = require('./routes/companies.routes');
const contactRoutes = require('./routes/contact.routes');
const couponsRoutes = require('./routes/coupons.routes');
const meRoutes = require('./routes/me.routes');
const ordersRoutes = require('./routes/orders.routes');
const pricingRoutes = require('./routes/pricing.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const servicesRoutes = require('./routes/services.routes');
const technicianRoutes = require('./routes/technician.routes');

const rolesRoutes = require('./routes/roles.routes');

// Authentication
apiRoutes.use('/auth', authRoutes);

// Admin
apiRoutes.use('/admin', adminRoutes);

// AI
apiRoutes.use('/ai', aiRoutes);

// Appointments
apiRoutes.use('/appointments', appointmentsRoutes);

// Checkout / Payments
apiRoutes.use('/checkout', checkoutRoutes);

// Clients
apiRoutes.use('/clients', clientsRoutes);

// Companies
apiRoutes.use('/companies', companiesRoutes);

// Contact
apiRoutes.use('/contact', contactRoutes);

// Coupons
apiRoutes.use('/coupons', couponsRoutes);

// Current user
apiRoutes.use('/me', meRoutes);

// Orders
apiRoutes.use('/orders', ordersRoutes);

// Pricing
apiRoutes.use('/pricing', pricingRoutes);

// Reviews
apiRoutes.use('/reviews', reviewsRoutes);

// Roles & Permissions
apiRoutes.use('/roles', rolesRoutes);

// Services
apiRoutes.use('/services', servicesRoutes);

// Technician
apiRoutes.use('/technician', technicianRoutes);

// Support the current versioned client URL and the legacy unversioned URL.
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// ==================== 404 ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// ==================== Error Handler ====================

app.use((err, req, res, next) => {
  console.error('API Error:', err);

  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

module.exports = app;