const mongoose = require('mongoose');

const aliasSchema = new mongoose.Schema(
  {
    alias:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    mapped_to: { type: String, required: true, trim: true },
    type:      { type: String, required: true, enum: ['number', 'brand', 'category'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alias', aliasSchema);
