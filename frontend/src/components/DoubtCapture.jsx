import { useState, useRef, useEffect } from 'react';
import './DoubtCapture.css';

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function DoubtCapture({ timestamp, onSubmit, isLoading = false }) {
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'voice'
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Update either the live transcript or append to textInput directly later
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      alert('Your browser does not support Speech Recognition. Please use Chrome.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript) {
        setTextInput(textInput ? textInput + ' ' + transcript : transcript);
        setTranscript('');
      }
    }
  };

  const handleSubmit = async () => {
    const finalContent = textInput.trim() || transcript.trim();
    if (finalContent) {
      onSubmit({
        type: 'text',
        content: finalContent,
        timestamp: timestamp,
      });
      setTextInput('');
      setTranscript('');
    }
  };

  const handleToggleMethod = () => {
    setInputMethod(inputMethod === 'text' ? 'voice' : 'text');
    if (isRecording) {
      stopRecording();
    }
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
          onClick={() => {
            if (isRecording) stopRecording();
            setInputMethod('text');
          }}
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
          <div className="voice-recording">
            {!isRecording ? (
              <>
                <p className="voice-instruction">
                  Click to start dictating your question:
                </p>
                <div className="current-text-preview">
                  {textInput ? `"${textInput}"` : ''}
                </div>
                <button
                  className="btn btn-primary btn-lg record-btn"
                  onClick={startRecording}
                  disabled={isLoading}
                >
                  🎤 Start Speaking
                </button>
              </>
            ) : (
              <>
                <div className="recording-indicator">
                  <span className="pulse"></span>
                  Listening...
                </div>
                <div className="live-transcript">
                  {transcript || "Speak now..."}
                </div>
                <button
                  className="btn btn-danger btn-lg record-btn"
                  onClick={stopRecording}
                >
                  ⏹ Stop Speaking
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="capture-actions">
        <button
          className="btn btn-outline"
          onClick={handleToggleMethod}
          disabled={isLoading || isRecording}
        >
          Switch back to {inputMethod === 'text' ? 'Voice' : 'Text'}
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (!textInput.trim() && !transcript.trim()) ||
            isRecording
          }
        >
          {isLoading ? '⏳ Simulated Pipeline...' : '📤 Submit Question'}
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
