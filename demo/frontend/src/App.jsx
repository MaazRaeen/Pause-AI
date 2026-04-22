import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [timestamp, setTimestamp] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const playerRef = useRef(null);

  // Example video ID that typically has captions
  const videoId = 'N3AkSS5hXMA';

  useEffect(() => {
    if (!hasStarted) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1, // Auto-play when they click start on hero
          controls: 1,
        },
        events: {
          onStateChange: (event) => {
            // State 2 is PAUSED
            if (event.data === 2) {
              setTimestamp(Math.floor(playerRef.current.getCurrentTime()));
              setIsPaused(true);
            } else if (event.data === 1) { // State 1 is PLAYING
              setIsPaused(false);
              setAnswer('');
              setContext('');
              setError('');
            }
          },
        },
      });
    };

    return () => {
      // Cleanup script tags if component unmounts
      const scripts = document.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]');
      scripts.forEach(script => script.remove());
    };
  }, [hasStarted, videoId]);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    setContext('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/ask', {
        videoId,
        timestamp,
        question,
      });
      setAnswer(res.data.answer);
      setContext(res.data.context);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch the answer. Make sure the Flask server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title animate-text-gradient">Pause AI</h1>
          <p className="hero-subtitle slide-up-fade">
            Supercharge your learning. Pause any video to extract context and uncover instant AI answers.
          </p>
          
          <button className="giant-play-button bounce-in" onClick={handleStart}>
            <div className="play-icon"></div>
            <span>Enter Experience</span>
          </button>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>
    );
  }

  return (
    <div className="app-container fade-in-up">
      <header className="header">
        <h1 className="animate-text-gradient">Pause AI</h1>
        <p>Interactive Video Context & Q&A</p>
      </header>

      <main className="layout">
        <section className="video-section">
          <div className="player-wrapper holographic-border">
            <div id="player"></div>
          </div>
        </section>

        <section className="interaction-panel holographic-glass">
          <div className="status-badge">
            <div className={`pulse ${isPaused ? 'paused' : ''}`}></div>
            {isPaused 
              ? `Video Paused explicitly at ${timestamp}s` 
              : 'Playing Video - Pause to ask questions!'}
          </div>

          <div className="input-group">
            <label htmlFor="question">What are you confused about?</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Can you explain that concept again?"
              disabled={!isPaused || loading}
              className={isPaused ? 'active-textarea' : ''}
            />
          </div>

          <button 
            className="action-button hover-lift"
            onClick={ask} 
            disabled={!isPaused || loading || !question.trim()}
          >
            {loading ? <span className="spinner"></span> : 'Generate Contextual Answer'}
          </button>

          {error && (
            <div className="response-card error-card pop-in">
              <p>{error}</p>
            </div>
          )}

          {answer && (
            <div className="response-card success-card pop-in">
              <h3>✨ AI Explanation</h3>
              <p>{answer}</p>
              
              {context && (
                <div className="context-box slide-down">
                  <h4>Transcript Evaluated:</h4>
                  <p>"{context}"</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
