const {
  searchAllProducts,
  applyConfidenceEngine,
  createProduct,
  updateProductPrice,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require('../services/productService');
const { parseInput } = require('../services/parserService');

async function listProducts(req, res) {
  try {
    const products = await getAllProducts();
    return res.json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addProduct(req, res) {
  try {
    const { brand, model, category, name, price } = req.body;
    if (!category || !price) {
      return res.status(400).json({ success: false, message: '"category" and "price" are required.' });
    }
    const product = await createProduct({ brand, model, category, name, price: parseFloat(price) });
    return res.status(201).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updatePrice(req, res) {
  try {
    const { price } = req.body;
    if (!price) return res.status(400).json({ success: false, message: '"price" is required.' });
    const updated = await updateProductPrice(req.params.id, parseFloat(price));
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateProductFull(req, res) {
  try {
    const { brand, model, category, name, price } = req.body;
    const updated = await updateProduct(req.params.id, {
      brand, model, category, name,
      price: price !== undefined && price !== '' ? parseFloat(price) : undefined,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function removeProduct(req, res) {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function searchFromText(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: '"text" is required.' });

    const parsed        = await parseInput(text);
    const searchResults = await searchAllProducts(parsed);
    const decisions     = applyConfidenceEngine(searchResults);

    return res.json({ success: true, raw_input: text, results: decisions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listProducts, getProduct, addProduct, updatePrice, updateProductFull, removeProduct, searchFromText };