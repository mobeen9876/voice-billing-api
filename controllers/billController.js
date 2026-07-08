/**
 * Bill Controller
 * POST /api/bill
 * One shot: text in → full saved invoice out
 */

const { parseInput }            = require('../services/parserService');
const { searchAllProducts, applyConfidenceEngine, createProduct } = require('../services/productService');
const { buildInvoice, saveInvoice } = require('../services/invoiceService');

async function createBill(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a "text" field.' });
    }

    // ── STEP 1: Parse text with OpenAI ──────────────────────────────────────
    const parsed = await parseInput(text);

    if (!parsed.length) {
      return res.status(400).json({ success: false, message: 'Could not extract any products from the text.' });
    }

    // ── STEP 2: Search products + confidence engine ──────────────────────────
    const searchResults = await searchAllProducts(parsed);
    const decisions     = applyConfidenceEngine(searchResults);

    // ── STEP 3: Resolve each product ─────────────────────────────────────────
    const invoiceItems   = [];
    const notFoundItems  = [];
    const clarifyItems   = [];

    for (const decision of decisions) {
      if (decision.decision === 'auto_selected') {
        // Product found with high confidence — use it
        invoiceItems.push({
          product_id:   decision.selected._id,
          product_name: decision.selected.name,
          quantity:     decision.input.quantity,
          price:        decision.selected.price,
        });

      } else if (decision.decision === 'clarify') {
        // Multiple matches — pick the best one automatically
        clarifyItems.push({
          input:        decision.input,
          auto_picked:  decision.alternatives[0],
          confidence:   decision.confidence,
        });
        invoiceItems.push({
          product_id:   decision.alternatives[0]._id,
          product_name: decision.alternatives[0].name,
          quantity:     decision.input.quantity,
          price:        decision.alternatives[0].price,
        });

      } else {
        // Not found — record it
        notFoundItems.push(decision.input);
      }
    }

    // ── STEP 4: Build + Save Invoice ─────────────────────────────────────────
    if (!invoiceItems.length) {
      return res.status(404).json({
        success: false,
        message: 'No products found in database. Please add products first.',
        not_found: notFoundItems,
      });
    }

    const invoiceData = buildInvoice(invoiceItems);
    const saved       = await saveInvoice(invoiceData);

    // ── STEP 5: Return full response ─────────────────────────────────────────
    return res.status(201).json({
      success:     true,
      raw_input:   text,
      invoice_no:  saved.invoice_no,
      invoice_id:  saved._id,
      items:       saved.items,
      subtotal:    saved.subtotal,
      total:       saved.total,
      status:      saved.status,
      warnings: {
        auto_picked:  clarifyItems.length  ? clarifyItems  : undefined,
        not_found:    notFoundItems.length ? notFoundItems : undefined,
      },
    });

  } catch (err) {
    console.error('createBill error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createBill };
