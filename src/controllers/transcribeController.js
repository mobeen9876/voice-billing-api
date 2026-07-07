const OpenAI = require('openai');
const { toFile } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file received.' });
    }

    // Convert buffer to a File-like object Whisper accepts
    const audioFile = await toFile(req.file.buffer, 'recording.webm', {
      type: req.file.mimetype || 'audio/webm',
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ur',        // Urdu — handles mixed Urdu/English retail language
      response_format: 'text',
    });

    return res.json({ success: true, text: transcription });
  } catch (err) {
    console.error('transcribeAudio error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { transcribeAudio };
