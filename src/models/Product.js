const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    brand:    { type: String, default: null },
    model:    { type: String, default: null },
    category: { type: String, required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
