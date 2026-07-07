const express = require('express');
const router = express.Router();
const { listAliases, addAlias, removeAlias } = require('../controllers/aliasController');

// GET    /api/aliases       - list all aliases
// POST   /api/aliases       - add alias
// DELETE /api/aliases/:id   - remove alias

router.get('/', listAliases);
router.post('/', addAlias);
router.delete('/:id', removeAlias);

module.exports = router;
