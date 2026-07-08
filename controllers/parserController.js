const { parseInput } = require('../services/parserService');

async function parseText(req, res) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a "text" field.' });
    }

    const parsed = await parseInput(text);
    return res.json({ success: true, raw_input: text, parsed_count: parsed.length, products: parsed });
  } catch (err) {
    console.error('parseText error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { parseText };
