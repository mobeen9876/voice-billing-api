const { buildInvoice, saveInvoice, getAllInvoices, getInvoiceById } = require('../services/invoiceService');
const { getProductById } = require('../services/productService');

async function listInvoices(req, res) {
  try {
    const invoices = await getAllInvoices();
    return res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getInvoice(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.json({ success: true, invoice });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function buildInvoicePreview(req, res) {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '"items" array is required.' });
    }

    const resolvedItems = [];
    for (const item of items) {
      const product = await getProductById(item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found.` });
      }
      resolvedItems.push({ product_id: product._id, product_name: product.name, quantity: item.quantity, price: product.price });
    }

    const invoice = buildInvoice(resolvedItems);
    return res.json({ success: true, preview: invoice });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function saveInvoiceHandler(req, res) {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '"items" array is required.' });
    }

    const resolvedItems = [];
    for (const item of items) {
      const product = await getProductById(item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found.` });
      }
      resolvedItems.push({ product_id: product._id, product_name: product.name, quantity: item.quantity, price: product.price });
    }

    const invoiceData = buildInvoice(resolvedItems);
    const saved       = await saveInvoice(invoiceData);

    return res.status(201).json({ success: true, message: 'Invoice saved successfully.', invoice: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listInvoices, getInvoice, buildInvoicePreview, saveInvoiceHandler };
