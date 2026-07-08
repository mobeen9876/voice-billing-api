require('dotenv').config();
const express = require('express');
const path    = require('path');
const connectDB = require('./db/database');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix for invisible characters in URLs (Postman copy-paste issue)
app.use((req, res, next) => {
  req.url = req.url.replace(/[\u00A0\u0000-\u001F\u007F-\u009F]/g, '').trim();
  next();
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/bill',       require('./routes/billRoutes'));
app.use('/api/parse',      require('./routes/parserRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/invoices',   require('./routes/invoiceRoutes'));
app.use('/api/aliases',    require('./routes/aliasRoutes'));
app.use('/api/transcribe', require('./routes/transcribeRoutes'));

// ─── SERVE REACT FRONTEND ─────────────────────────────────────────────────────
const clientDist = path.join(__dirname, 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
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
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});
