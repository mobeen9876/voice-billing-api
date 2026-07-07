require('dotenv').config();
const express = require('express');
const connectDB = require('./src/db/database');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix for invisible characters in URLs (Postman copy-paste issue)
app.use((req, res, next) => {
  req.url = req.url.replace(/[\u00A0\u0000-\u001F\u007F-\u009F]/g, '').trim();
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/bill',     require('./src/routes/billRoutes'));
app.use('/api/parse',    require('./src/routes/parserRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/aliases',  require('./src/routes/aliasRoutes'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🎙️ Voice Billing API is running!',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      parse:    'POST /api/parse',
      products: 'GET|POST /api/products',
      search:   'POST /api/products/search',
      invoices: 'GET|POST /api/invoices',
      aliases:  'GET|POST /api/aliases',
    },
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Close the other process and try again.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});
