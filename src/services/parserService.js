/**
 * AI Retail Language Parser Service
 * Steps 3 & 4 — Uses OpenAI GPT to parse Hinglish retail text
 * Falls back to rule-based if OpenAI fails or key is missing
 */

const OpenAI = require('openai');
const Alias  = require('../models/Alias');

// ─── OPENAI CLIENT ────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── DEFAULT RULE-BASED MAPS (fallback) ───────────────────────────────────────
const DEFAULT_NUMBER_MAP = {
  ek: 1, ik: 1, one: 1,
  do: 2, two: 2,
  teen: 3, tin: 3, three: 3,
  char: 4, chaar: 4, four: 4,
  paanch: 5, panch: 5, five: 5,
  chhe: 6, six: 6,
  saat: 7, seven: 7,
  aath: 8, eight: 8,
  nau: 9, nine: 9,
  das: 10, ten: 10,
};

const DEFAULT_BRAND_MAP = {
  opp: 'Oppo', oppo: 'Oppo',
  sam: 'Samsung', samsung: 'Samsung', samsng: 'Samsung',
  mi: 'Xiaomi', xiaomi: 'Xiaomi',
  redmi: 'Redmi',
  vivo: 'Vivo', vvo: 'Vivo',
  realme: 'Realme', rlme: 'Realme',
  nokia: 'Nokia',
  apple: 'Apple', iphone: 'Apple',
  oneplus: 'OnePlus',
};

const DEFAULT_CATEGORY_MAP = {
  glass: 'Glass', glas: 'Glass', glss: 'Glass', tempered: 'Glass',
  screen: 'Screen',
  display: 'Display',
  charger: 'Charger', chargr: 'Charger', chrger: 'Charger',
  'type c': 'Type C Cable', 'type-c': 'Type C Cable', typec: 'Type C Cable',
  cable: 'Cable',
  cover: 'Cover', case: 'Cover',
  back: 'Back Cover', 'back cover': 'Back Cover',
  battery: 'Battery', batt: 'Battery',
  earphone: 'Earphone', headphone: 'Earphone',
  speaker: 'Speaker',
};

// ─── LOAD ALIASES FROM DB ─────────────────────────────────────────────────────
async function loadAliases() {
  const rows = await Alias.find().lean();

  const numberMap   = { ...DEFAULT_NUMBER_MAP };
  const brandMap    = { ...DEFAULT_BRAND_MAP };
  const categoryMap = { ...DEFAULT_CATEGORY_MAP };

  for (const row of rows) {
    const key = row.alias.toLowerCase();
    if (row.type === 'number')        numberMap[key]   = parseInt(row.mapped_to);
    else if (row.type === 'brand')    brandMap[key]    = row.mapped_to;
    else if (row.type === 'category') categoryMap[key] = row.mapped_to;
  }

  return { numberMap, brandMap, categoryMap };
}

// ─── OPENAI PARSER ────────────────────────────────────────────────────────────
/**
 * Use GPT to extract structured products from raw Hinglish text
 * Returns array of { brand, model, category, quantity }
 */
async function parseWithOpenAI(rawText) {
  const prompt = `
You are a retail billing assistant for a mobile phone accessories shop in India.
The user speaks in Hinglish (Hindi + English mix).

Extract all products from the input text and return a JSON array.
Each product must have: brand, model, category, quantity.

Rules:
- Hinglish numbers: Ek=1, Do=2, Teen=3, Char=4, Paanch=5
- If brand is unknown, set it to null
- If model is unknown, set it to null  
- category must be one of: Glass, Screen, Display, Charger, Type C Cable, Cable, Cover, Back Cover, Battery, Earphone, Speaker, or the actual product name if none match
- quantity must be a number (default 1 if not mentioned)
- Fix spelling mistakes (e.g. Opp = Oppo, Samsng = Samsung)

Input: "${rawText}"

Return ONLY a valid JSON array, no explanation. Example:
[{"brand":"Oppo","model":"A56","category":"Glass","quantity":3}]
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 300,
  });

  const content = response.choices[0].message.content.trim();

  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('OpenAI did not return valid JSON array');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed;
}

// ─── RULE-BASED PARSER (fallback) ─────────────────────────────────────────────
function parseSingleEntry(entry, numberMap, brandMap, categoryMap) {
  const words      = entry.trim().split(/\s+/);
  const entryLower = entry.toLowerCase();

  let quantity = 1;
  let brand    = null;
  let model    = null;
  let category = null;

  // Multi-word category check first
  for (const key of Object.keys(categoryMap).sort((a, b) => b.length - a.length)) {
    if (entryLower.includes(key)) {
      category = categoryMap[key];
      break;
    }
  }

  const usedIndexes = new Set();

  for (let i = 0; i < words.length; i++) {
    const word      = words[i];
    const wordLower = word.toLowerCase();

    if (numberMap[wordLower] !== undefined) {
      quantity = numberMap[wordLower]; usedIndexes.add(i); continue;
    }
    if (/^\d+$/.test(word)) {
      quantity = parseInt(word); usedIndexes.add(i); continue;
    }
    if (brandMap[wordLower]) {
      brand = brandMap[wordLower]; usedIndexes.add(i); continue;
    }
    if (categoryMap[wordLower] && !category) {
      category = categoryMap[wordLower]; usedIndexes.add(i); continue;
    }
    if (/^[A-Za-z]+\d+/.test(word) || /^\d+[A-Za-z]+/.test(word)) {
      if (!model) { model = word.toUpperCase(); usedIndexes.add(i); }
    }
  }

  if (!category) {
    for (let i = 0; i < words.length; i++) {
      if (!usedIndexes.has(i)) {
        const w = words[i].toLowerCase();
        if (categoryMap[w]) { category = categoryMap[w]; break; }
      }
    }
  }

  if (!category) category = entry.trim();

  return { brand, model, category, quantity };
}

async function parseWithRules(rawText) {
  const { numberMap, brandMap, categoryMap } = await loadAliases();
  const entries = rawText.split(',').map((e) => e.trim()).filter(Boolean);
  return entries.map((entry) => parseSingleEntry(entry, numberMap, brandMap, categoryMap));
}

// ─── MAIN PARSE FUNCTION ──────────────────────────────────────────────────────
/**
 * Try OpenAI first, fall back to rule-based if it fails
 */
async function parseInput(rawText) {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      console.log('🤖 Parsing with OpenAI...');
      const result = await parseWithOpenAI(rawText);
      console.log('✅ OpenAI parsed:', result);
      return result;
    } catch (err) {
      console.warn('⚠️  OpenAI failed, falling back to rule-based:', err.message);
    }
  }

  console.log('📋 Parsing with rule-based engine...');
  return parseWithRules(rawText);
}

module.exports = { parseInput };
