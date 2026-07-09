/**
 * Product Service — MongoDB version
 * Steps 6, 7, 8, 9
 */

const Product = require('../models/Product');

/**
 * Step 6: Search for a single product
 */
async function searchProduct({ brand, model, category }) {
  const query = {};

  if (category) query.category = { $regex: category, $options: 'i' };
  if (brand)    query.brand    = { $regex: brand,    $options: 'i' };
  if (model)    query.model    = { $regex: model,    $options: 'i' };

  const results = await Product.find(query).lean();

  return results.map((product) => ({
    product,
    confidence: calcConfidence(product, { brand, model, category }),
  }));
}

/**
 * Step 6 (Parallel): Search all products at once
 */
async function searchAllProducts(parsedProducts) {
  const results = await Promise.all(
    parsedProducts.map(async (item) => {
      const matches = await searchProduct(item);
      matches.sort((a, b) => b.confidence - a.confidence);
      return { input: item, matches: matches.slice(0, 5) };
    })
  );
  return results;
}

/**
 * Step 7: Confidence scoring
 */
function calcConfidence(product, input) {
  let score = 0;
  let total = 0;

  if (input.category) {
    total += 50;
    const prodCat = (product.category || '').toLowerCase();
    const inCat   = input.category.toLowerCase();
    if (prodCat === inCat) score += 50;
    else if (prodCat.includes(inCat) || inCat.includes(prodCat)) score += 35;
  }

  if (input.brand) {
    total += 30;
    const prodBrand = (product.brand || '').toLowerCase();
    const inBrand   = input.brand.toLowerCase();
    if (prodBrand === inBrand) score += 30;
    else if (prodBrand.includes(inBrand) || inBrand.includes(prodBrand)) score += 20;
  }

  if (input.model) {
    total += 20;
    const prodModel = (product.model || '').toLowerCase();
    const inModel   = input.model.toLowerCase();
    if (prodModel === inModel) score += 20;
    else if (prodModel.includes(inModel) || inModel.includes(prodModel)) score += 12;
  }

  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

/**
 * Step 7: Apply confidence engine decision
 */
function applyConfidenceEngine(searchResults) {
  return searchResults.map(({ input, matches }) => {
    const best = matches[0];

    if (!best || best.confidence === 0) {
      return { input, decision: 'not_found', confidence: 0, selected: null, alternatives: [] };
    }

    if (best.confidence >= 95) {
      return { input, decision: 'auto_selected', confidence: best.confidence, selected: best.product, alternatives: [] };
    }

    if (best.confidence >= 80) {
      return {
        input, decision: 'clarify', confidence: best.confidence, selected: null,
        alternatives: matches.map((m) => ({ ...m.product, confidence: m.confidence })),
      };
    }

    return {
      input, decision: 'not_found', confidence: best.confidence, selected: null,
      alternatives: matches.map((m) => ({ ...m.product, confidence: m.confidence })),
    };
  });
}

/**
 * Step 9: Create product
 */
async function createProduct({ brand, model, category, name, price }) {
  const productName = name || [brand, model, category].filter(Boolean).join(' ');
  const product = await Product.create({ brand, model, category, name: productName, price });
  return product;
}

/**
 * Step 9: Update price
 */
async function updateProductPrice(id, price) {
  return Product.findByIdAndUpdate(id, { price }, { new: true });
}

/**
 * Full product update (brand, model, category, name, price)
 */
async function updateProduct(id, { brand, model, category, name, price }) {
  const update = {};
  if (brand !== undefined) update.brand = brand;
  if (model !== undefined) update.model = model;
  if (category !== undefined) update.category = category;
  if (name !== undefined) update.name = name;
  if (price !== undefined) update.price = price;
  return Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

/**
 * Delete a product
 */
async function deleteProduct(id) {
  return Product.findByIdAndDelete(id);
}

/**
 * Get all products
 */
async function getAllProducts() {
  return Product.find().sort({ createdAt: -1 }).lean();
}

/**
 * Get product by ID
 */
async function getProductById(id) {
  return Product.findById(id).lean();
}

module.exports = {
  searchProduct,
  searchAllProducts,
  applyConfidenceEngine,
  createProduct,
  updateProductPrice,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};