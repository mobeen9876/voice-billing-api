const express = require('express');
const router  = express.Router();
const { createBill } = require('../controllers/billController');

// POST /api/bill — one shot billing
router.post('/', createBill);

module.exports = router;
