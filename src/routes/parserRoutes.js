const express = require('express');
const router = express.Router();
const { parseText } = require('../controllers/parserController');

// POST /api/parse
router.post('/', parseText);

module.exports = router;
