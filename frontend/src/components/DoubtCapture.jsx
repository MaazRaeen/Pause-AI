import { useState } from 'react';
import { useAudioRecorder } from '../hooks/useMedia';
import './DoubtCapture.css';

function DoubtCapture({ timestamp, onSubmit, isLoading = false }) {
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'voice'
  const [textInput, setTextInput] = useState('');
  const { isRecording, audioBlob, startRecording, stopRecording, resetRecording } =
    useAudioRecorder();

  const handleSubmit = async () => {
    if (inputMethod === 'text') {
      if (textInput.trim()) {
        onSubmit({
          type: 'text',
          content: textInput,
          timestamp: timestamp,
        });
        setTextInput('');
      }
    } else if (inputMethod === 'voice') {
      if (audioBlob) {
        onSubmit({
          type: 'voice',
          content: audioBlob,
          timestamp: timestamp,
        });
        resetRecording();
      }
    }
  };

  const handleToggleMethod = () => {
    setInputMethod(inputMethod === 'text' ? 'voice' : 'text');
    setTextInput('');
    resetRecording();
  };

  return (
    <div className="doubt-capture-card card">
      <div className="doubt-capture-header">
        <h3>Ask Your Question</h3>
        <span className="timestamp-badge">{formatTime(timestamp)}</span>
      </div>

      <div className="input-method-tabs">
        <button
          className={`tab ${inputMethod === 'text' ? 'active' : ''}`}
          onClick={() => setInputMethod('text')}
        >
          ✍️ Text
        </button>
        <button
          className={`tab ${inputMethod === 'voice' ? 'active' : ''}`}
          onClick={() => setInputMethod('voice')}
        >
          🎤 Voice
        </button>
      </div>

      {inputMethod === 'text' ? (
        <div className="text-input-wrapper">
          <textarea
            className="doubt-input"
            placeholder="Type your question here... For example: 'What is machine learning?'"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="char-count">{textInput.length}/500</div>
        </div>
      ) : (
        <div className="voice-input-wrapper">
          {!audioBlob ? (
            <div className="voice-recording">
              {!isRecording ? (
                <>
                  <p className="voice-instruction">
                    Click the button below to start recording your question
                  </p>
                  <button
                    className="btn btn-primary btn-lg record-btn"
                    onClick={startRecording}
                    disabled={isLoading}
                  >
                    🎤 Start Recording
                  </button>
                </>
              ) : (
                <>
                  <div className="recording-indicator">
                    <span className="pulse"></span>
                    Recording...
                  </div>
                  <button
                    className="btn btn-danger btn-lg record-btn"
                    onClick={stopRecording}
                  >
                    ⏹ Stop Recording
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="voice-recorded">
              <p className="success-message">✓ Recording saved</p>
              <button
                className="btn btn-outline"
                onClick={resetRecording}
                disabled={isLoading}
              >
                🔄 Re-record
              </button>
            </div>
          )}
        </div>
      )}

      <div className="capture-actions">
        <button
          className="btn btn-outline"
          onClick={handleToggleMethod}
          disabled={isLoading || (inputMethod === 'voice' && isRecording)}
        >
          Switch to {inputMethod === 'text' ? 'Voice' : 'Text'}
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (inputMethod === 'text' && !textInput.trim()) ||
            (inputMethod === 'voice' && !audioBlob) ||
            isRecording
          }
        >
          {isLoading ? '⏳ Processing...' : '📤 Submit Question'}
        </button>
      </div>
    </div>
  );
}

function formatTime(timeInSeconds) {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default DoubtCapture;
