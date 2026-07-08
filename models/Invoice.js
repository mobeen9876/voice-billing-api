const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, required: true },
  quantity:     { type: Number, required: true },
  price:        { type: Number, required: true },
  total:        { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoice_no: { type: String, required: true, unique: true },
    items:      [invoiceItemSchema],
    subtotal:   { type: Number, required: true },
    total:      { type: Number, required: true },
    status:     { type: String, default: 'saved' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
