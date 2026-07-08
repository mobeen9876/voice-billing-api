import { useState, useRef } from 'react'
import styles from './VoiceInput.module.css'

function VoiceInput({ onInvoiceGenerated }) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      return
    }
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setText(data.text)
      } else {
        setError('Transcription failed: ' + data.message)
      }
    } catch {
      setError('Could not connect to server for transcription.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim()) { setError('Please record or type some text first.'); return }
    setError('')
    setIsGenerating(true)
    try {
      const res = await fetch('/api/bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.success) {
        if (onInvoiceGenerated) onInvoiceGenerated(data)
      } else {
        setError('Error: ' + data.message)
      }
    } catch {
      setError('Could not connect to server.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => { setText(''); setError('') }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>🎙️ Voice Billing AI</h2>

      <div className={styles.recordRow}>
        <button
          className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
          onClick={handleRecord}
          disabled={isTranscribing || isGenerating}
        >
          {isRecording ? <><span className={styles.recDot} /> Stop</> : <>▶ Record</>}
        </button>
        {isTranscribing && <span className={styles.statusText}>⏳ Transcribing...</span>}
      </div>

      <div className={styles.textRow}>
        <label className={styles.textLabel}>Text</label>
        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"'
            rows={3}
            disabled={isTranscribing || isGenerating}
          />
          <button className={styles.clearBtn} onClick={handleClear} disabled={isTranscribing || isGenerating}>
            Clear
          </button>
        </div>
      </div>

      {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={isTranscribing || isGenerating || !text.trim()}
      >
        {isGenerating ? '⏳ Generating...' : 'Generate Bill'}
      </button>
    </div>
  )
}

export default VoiceInput
