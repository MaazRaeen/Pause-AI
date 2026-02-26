import { useState } from 'react';
import { useAudioPlayer } from '../hooks/useMedia';
import './DoubtResponse.css';

function DoubtResponse({
  question,
  answer,
  confidence,
  sources,
  processingTime,
  onPlayAudio,
  isLoadingAudio = false,
}) {
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();
  const [showSources, setShowSources] = useState(false);
  const [respondentType, setRespondentType] = useState('text'); // 'text' or 'audio'

  const handlePlayResponse = () => {
    if (answer) {
      // In production, this would convert answer text to speech
      // For now, we'll just show it as implemented
      if (isPlaying) {
        stopAudio();
      } else {
        // Call backend for TTS or use Web Speech API
        if (onPlayAudio) {
          onPlayAudio(answer);
        }
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
            ⚡ {processingTime ? `${processingTime}ms` : 'Calculating...'}
          </span>
        </div>
      </div>

      <div className="response-type-selector">
        <button
          className={`response-btn ${respondentType === 'text' ? 'active' : ''}`}
          onClick={() => setRespondentType('text')}
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
              disabled={!answer || isLoadingAudio}
            >
              {isLoadingAudio ? (
                <>
                  <span className="spinner-mini"></span> Preparing Audio...
                </>
              ) : isPlaying ? (
                <>⏸ Pause</>
              ) : (
                <>▶ Play Audio Response</>
              )}
            </button>
            <p className="audio-info">Click to listen to the AI-generated response</p>
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
            📍 Sources ({sources.length})
          </button>

          {showSources && (
            <div className="sources-list">
              {sources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <span className="source-timestamp">
                      ⏱️ {formatTime(source.timestamp)}
                    </span>
                    <span className="source-relevance">
                      Match: {(source.relevance_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="source-text">{source.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="response-actions">
        <button className="btn btn-outline">👍 Helpful</button>
        <button className="btn btn-outline">👎 Not Helpful</button>
        <button className="btn btn-outline">📋 Copy Answer</button>
      </div>
    </div>
  );
}

export default DoubtResponse;
