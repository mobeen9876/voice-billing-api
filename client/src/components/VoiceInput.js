import React, { useState, useRef } from 'react';
import './VoiceInput.css';

function VoiceInput() {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ── START / STOP RECORDING ──────────────────────────────────────────────────
  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      setError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // Stop all mic tracks
          stream.getTracks().forEach((t) => t.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        setError('Microphone access denied. Please allow microphone permission.');
      }
    }
  };

  // ── SEND AUDIO TO WHISPER (backend) ────────────────────────────────────────
  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setText(data.text);
      } else {
        setError('Transcription failed: ' + data.message);
      }
    } catch (err) {
      setError('Could not connect to server for transcription.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // ── GENERATE BILL ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please record or type some text first.');
      return;
    }
    setError('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.success) {
        // TODO: pass invoice data to InvoiceTable component (next step)
        console.log('Invoice generated:', data);
        alert(`Invoice #${data.invoice_no} created! Total: ${data.total}`);
      } else {
        setError('Error: ' + data.message);
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── CLEAR ───────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setText('');
    setError('');
  };

  return (
    <div className="voice-input-card">
      <h2 className="voice-input-title">🎙️ Voice Billing AI</h2>

      {/* Record Button */}
      <div className="record-row">
        <button
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={handleRecord}
          disabled={isTranscribing || isGenerating}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <>
              <span className="rec-dot" /> Stop
            </>
          ) : (
            <>▶ Record</>
          )}
        </button>

        {isTranscribing && (
          <span className="status-text">⏳ Transcribing...</span>
        )}
      </div>

      {/* Text Area + Clear */}
      <div className="text-row">
        <label className="text-label">Text</label>
        <div className="textarea-wrapper">
          <textarea
            className="voice-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"'
            rows={3}
            disabled={isTranscribing || isGenerating}
          />
          <button className="clear-btn" onClick={handleClear} disabled={isTranscribing || isGenerating}>
            Clear
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="error-msg">⚠️ {error}</p>}

      {/* Generate Button */}
      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isTranscribing || isGenerating || !text.trim()}
      >
        {isGenerating ? '⏳ Generating...' : 'Generate Bill'}
      </button>
    </div>
  );
}

export default VoiceInput;
