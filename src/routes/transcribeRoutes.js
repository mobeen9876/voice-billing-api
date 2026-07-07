const express = require('express');
const router = express.Router();
const { transcribeAudio } = require('../controllers/transcribeController');
const multer = require('multer');

// Store audio in memory (no disk writes needed)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/transcribe
router.post('/', upload.single('audio'), transcribeAudio);

module.exports = router;
