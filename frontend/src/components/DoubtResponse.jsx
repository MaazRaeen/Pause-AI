import { useState, useEffect, useRef } from 'react';
import './DoubtResponse.css';

function DoubtResponse({
  question,
  answer,
  confidence,
  sources,
  processingTime,
}) {
  const [showSources, setShowSources] = useState(false);
  const [respondentType, setRespondentType] = useState('text'); // 'text' or 'audio'
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Stop playing if component unmounts
  useEffect(() => {
    return () => {
      if (synthRef.current && isPlaying) {
        synthRef.current.cancel();
      }
    };
  }, [isPlaying]);

  const handlePlayResponse = () => {
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      if (answer && synthRef.current) {
        // Cancel any ongoing speech first
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(answer);

        // Pick a nice sounding voice if available
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-US')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
          console.error("SpeechSynthesis error", e);
          setIsPlaying(false);
        };

        synthRef.current.speak(utterance);
      }
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'high';
    if (conf >= 0.6) return 'medium';
    return 'low';
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="doubt-response-card card">
      <div className="response-header">
        <h3 className="question-text">❓ {question}</h3>
        <div className="response-meta">
          <span className={`confidence-badge conf-${getConfidenceColor(confidence)}`}>
            Confidence: {(confidence * 100).toFixed(1)}%
          </span>
          <span className="processing-time">
            ⚡ {processingTime ? `${processingTime}s` : 'Calculating...'}
          </span>
        </div>
      </div>

      <div className="response-type-selector">
        <button
          className={`response-btn ${respondentType === 'text' ? 'active' : ''}`}
          onClick={() => {
            if (isPlaying) handlePlayResponse(); // stop if playing
            setRespondentType('text');
          }}
        >
          📝 Read Answer
        </button>
        <button
          className={`response-btn ${respondentType === 'audio' ? 'active' : ''}`}
          onClick={() => setRespondentType('audio')}
        >
          🔊 Listen Answer
        </button>
      </div>

      {respondentType === 'text' ? (
        <div className="answer-text-container">
          <div className="answer-content">
            <p>{answer}</p>
          </div>
        </div>
      ) : (
        <div className="answer-audio-container">
          <div className="audio-player">
            <button
              className={`btn btn-primary btn-lg play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayResponse}
              disabled={!answer}
            >
              {isPlaying ? (
                <>⏹ Pause</>
              ) : (
                <>▶ Play Native AI Voice</>
              )}
            </button>
            <p className="audio-info">Click to listen to the browser-generated native TTS</p>
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="sources-section">
          <button
            className="sources-toggle"
            onClick={() => setShowSources(!showSources)}
          >
            <span className="toggle-icon">{showSources ? '▼' : '▶'}</span>
            📍 Context Sources ({sources.length})
          </button>

          {showSources && (
            <div className="sources-list">
              {sources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <span className="source-timestamp">
                      ⏱️ {formatTime(source.timestamp)}
                    </span>
                    <span className="source-relevance badge">
                      {source.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="source-text">{source.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="response-actions">
        <button className="btn btn-outline" title="Looks good!">👍 Helpful</button>
        <button className="btn btn-outline" title="Needs improvement">👎 Not Helpful</button>
        <button
          className="btn btn-outline"
          onClick={() => navigator.clipboard.writeText(answer)}
        >
          📋 Copy Answer
        </button>
      </div>
    </div>
  );
}

export default DoubtResponse;
