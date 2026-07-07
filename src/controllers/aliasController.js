const { saveAlias, getAllAliases, deleteAlias } = require('../services/aliasService');

async function listAliases(req, res) {
  try {
    const aliases = await getAllAliases();
    return res.json({ success: true, count: aliases.length, aliases });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addAlias(req, res) {
  try {
    const { alias, mapped_to, type } = req.body;
    if (!alias || !mapped_to || !type) {
      return res.status(400).json({
        success: false,
        message: '"alias", "mapped_to", and "type" are required. type: number | brand | category',
      });
    }
    const saved = await saveAlias(alias, mapped_to, type);
    return res.status(201).json({ success: true, alias: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function removeAlias(req, res) {
  try {
    const result = await deleteAlias(req.params.id);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listAliases, addAlias, removeAlias };
