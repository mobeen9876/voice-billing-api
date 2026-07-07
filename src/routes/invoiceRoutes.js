const express = require('express');
const router = express.Router();
const {
  listInvoices,
  getInvoice,
  buildInvoicePreview,
  saveInvoiceHandler,
} = require('../controllers/invoiceController');

// GET  /api/invoices        - list all invoices
// GET  /api/invoices/:id    - get single invoice with items
// POST /api/invoices/build  - preview invoice (no save)
// POST /api/invoices/save   - save invoice

router.get('/', listInvoices);
router.post('/build', buildInvoicePreview);   // before /:id
router.post('/save', saveInvoiceHandler);
router.get('/:id', getInvoice);

module.exports = router;
