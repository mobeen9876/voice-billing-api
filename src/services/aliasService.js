/**
 * Alias Service — MongoDB version
 * Step 12: Learn from user
 */

const Alias = require('../models/Alias');

/**
 * Save or update alias
 */
async function saveAlias(alias, mappedTo, type) {
  return Alias.findOneAndUpdate(
    { alias: alias.toLowerCase().trim() },
    { alias: alias.toLowerCase().trim(), mapped_to: mappedTo.trim(), type },
    { upsert: true, new: true }
  );
}

/**
 * Get all aliases
 */
async function getAllAliases() {
  return Alias.find().sort({ type: 1, alias: 1 }).lean();
}

/**
 * Delete alias by ID
 */
async function deleteAlias(id) {
  await Alias.findByIdAndDelete(id);
  return { deleted: true };
}

module.exports = { saveAlias, getAllAliases, deleteAlias };
