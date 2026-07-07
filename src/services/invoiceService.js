/**
 * Invoice Service — MongoDB version
 * Steps 10 & 11
 */

const Invoice = require('../models/Invoice');

/**
 * Generate unique invoice number
 */
function generateInvoiceNo() {
  const date = new Date().toISOString().slice(0, 10);
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${date}-${rand}`;
}

/**
 * Step 10: Build invoice preview (not saved)
 */
function buildInvoice(items) {
  const lineItems = items.map((item) => ({
    product_id:   item.product_id,
    product_name: item.product_name,
    quantity:     item.quantity,
    price:        item.price,
    total:        item.quantity * item.price,
  }));

  const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0);

  return {
    invoice_no: generateInvoiceNo(),
    items: lineItems,
    subtotal,
    total: subtotal,
  };
}

/**
 * Step 11: Save invoice to MongoDB
 */
async function saveInvoice(invoiceData) {
  const invoice = await Invoice.create(invoiceData);
  return invoice;
}

/**
 * Get all invoices
 */
async function getAllInvoices() {
  return Invoice.find().sort({ createdAt: -1 }).lean();
}

/**
 * Get single invoice by ID
 */
async function getInvoiceById(id) {
  return Invoice.findById(id).lean();
}

module.exports = {
  buildInvoice,
  saveInvoice,
  getAllInvoices,
  getInvoiceById,
};
