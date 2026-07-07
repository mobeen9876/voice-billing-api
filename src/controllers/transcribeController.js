const OpenAI = require('openai');
const { toFile } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file received.' });
    }

    // ── STEP 1: Audio → Text (Transcription) ─────────────────────────────────
    const audioFile = await toFile(req.file.buffer, 'recording.webm', {
      type: req.file.mimetype || 'audio/webm',
    });

    const transcription = await openai.audio.transcriptions.create({
      file:            audioFile,
      model:           'whisper-1',
      response_format: 'text',
    });

    console.log('Transcription (raw):', transcription);

    // ── STEP 2: Urdu Script → Roman Urdu (Normalization) ──────────────────────
    const conversion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a POS transcription assistant for a mobile phone retail shop.
Convert any Urdu script into Roman Urdu.

Rules:
- Never output Urdu script.
- Use only English letters.
- Convert Urdu number words to digits (teen->3, do->2, ek->1, char->4, paanch->5).
- Keep brand names in English (Oppo, Samsung, Vivo, Realme, Infinix).
- Keep mobile model names exactly as spoken.
- Keep quantities as digits.
- Do not explain anything.
- Return ONLY the converted text.

Examples:
"تین اوپو اے 56 کا گلاس" → "3 Oppo A56 ka glass"
"دو چارجر ایک ٹائپ سی کیبل" → "2 charger 1 Type C cable"
"Teen Oppo A56 Glass" → "3 Oppo A56 Glass"`,
        },
        {
          role: 'user',
          content: transcription,
        },
      ],
    });

    const normalizedText = conversion.choices[0].message.content.trim();
    console.log('Transcription (normalized):', normalizedText);

    return res.json({ success: true, text: normalizedText, raw: transcription });

  } catch (err) {
    console.error('transcribeAudio error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { transcribeAudio };
