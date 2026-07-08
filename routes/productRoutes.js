const express = require('express');
const router = express.Router();
const {
  listProducts,
  getProduct,
  addProduct,
  updatePrice,
  searchFromText,
} = require('../controllers/productController');

// GET    /api/products         - list all
// POST   /api/products         - create product
// GET    /api/products/:id     - get one
// PUT    /api/products/:id/price - update price
// POST   /api/products/search  - search + confidence engine

router.get('/', listProducts);
router.post('/search', searchFromText);   // must be before /:id
router.post('/', addProduct);
router.get('/:id', getProduct);
router.put('/:id/price', updatePrice);

module.exports = router;
