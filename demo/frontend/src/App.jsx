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

  const [inputUrl, setInputUrl] = useState('');
  const [videoId, setVideoId] = useState('N3AkSS5hXMA'); // Default fallback video
  
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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
    if (inputUrl.trim()) {
      const extractedId = extractVideoId(inputUrl);
      if (extractedId) {
        setVideoId(extractedId);
      } else {
        alert('Invalid YouTube URL! We will load the default demo video instead.');
      }
    }
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="landing-page">
        {/* Background Decorative Elements */}
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>

        <div className="landing-container">
          
          {/* Hero Header & Problem/Solution */}
          <div className="hero-header slide-up-fade">
            <h1 className="hero-title animate-text-gradient">Pause AI</h1>
            <p className="hero-subtitle">
              Interactive video learning experience with instant AI assistance.
            </p>
            
            <div className="problem-solution-box holographic-glass hover-glow">
              <div className="problem">
                <strong className="text-red">Current Experience:</strong> Watching videos is passive and lacks interaction. Users cannot ask questions in real time.
              </div>
              <div className="solution">
                <strong className="text-green">With Pause AI:</strong> Pause AI turns videos into an interactive learning experience with instant AI assistance.
              </div>
            </div>

            <div className="cta-container">
              <input 
                type="text" 
                placeholder="Paste any YouTube video link here..." 
                className="video-url-input holographic-glass"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button className="giant-play-button bounce-in" onClick={handleStart} style={{ animationDelay: '0.2s', marginTop: '1rem' }}>
                <div className="play-icon"></div>
                <span>Try It Now</span>
              </button>
              <p className="cta-hint slide-up-fade" style={{ animationDelay: '0.3s' }}>If left empty, we auto-load an interactive demo video</p>
            </div>
          </div>

          {/* Key Features */}
          <div className="section-block pop-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="section-title">Key Features</h2>
            <div className="features-grid">
              <div className="feature-card holographic-glass hover-lift">
                <div className="feature-icon">✨</div>
                <h3>Real-time Q&A</h3>
                <p>Ask anything while watching. Instant answers related to the paused frame.</p>
              </div>
              <div className="feature-card holographic-glass hover-lift">
                <div className="feature-icon">⏱️</div>
                <h3>Timestamp Awareness</h3>
                <p>The AI perfectly understands the exact moment you are paused at.</p>
              </div>
              <div className="feature-card holographic-glass hover-lift">
                <div className="feature-icon">🔄</div>
                <h3>Multi-input Support</h3>
                <p>Works seamlessly with both YouTube API & uploaded generic videos.</p>
              </div>
              <div className="feature-card holographic-glass hover-lift">
                <div className="feature-icon">📝</div>
                <h3>Smart Summaries</h3>
                <p>Generate summaries for any segment and convert videos into structured notes.</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="section-block pop-in" style={{ animationDelay: '0.45s' }}>
            <h2 className="section-title">Use Cases</h2>
            <div className="features-grid">
              <div className="use-case-card holographic-glass hover-glow">
                <div className="feature-icon">📚</div>
                <h3>Students</h3>
                <p>Understand lectures instantly</p>
              </div>
              <div className="use-case-card holographic-glass hover-glow">
                <div className="feature-icon">💻</div>
                <h3>Developers</h3>
                <p>Learn coding tutorials faster</p>
              </div>
              <div className="use-case-card holographic-glass hover-glow">
                <div className="feature-icon">🎨</div>
                <h3>Creators</h3>
                <p>Analyze and break down content</p>
              </div>
              <div className="use-case-card holographic-glass hover-glow">
                <div className="feature-icon">🧑‍🏫</div>
                <h3>Teachers</h3>
                <p>Explain video-based topics effectively</p>
              </div>
            </div>
          </div>

          {/* User Journey Flow */}
          <div className="journey-flow section-block pop-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="section-title">How It Works</h2>
            <div className="journey-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Load Video</h4>
                <p>YouTube or upload</p>
              </div>
              <div className="step-arrow">➔</div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Play & Pause</h4>
                <p>At any moment</p>
              </div>
              <div className="step-arrow">➔</div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Ask a Question</h4>
                <p>Related to the paused frame</p>
              </div>
              <div className="step-arrow">➔</div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h4>AI Analyzes</h4>
                <p>Context and responds instantly</p>
              </div>
            </div>
          </div>

          {/* Tech Stack & Advanced Caps */}
          <div className="section-block pop-in" style={{ animationDelay: '0.55s' }}>
            <h2 className="section-title">Tech Stack & Advanced Capabilities</h2>
            <div className="overview-content holographic-glass hover-glow">
              <div className="tech-stack-tags">
                <span className="tech-tag">Frontend: React + TailwindCSS</span>
                <span className="tech-tag">Backend: Node.js / Express</span>
                <span className="tech-tag">AI Engine: OpenAI / Groq API</span>
                <span className="tech-tag">Integration: YouTube IFrame API</span>
              </div>
              
              <div className="advanced-caps">
                <h3>Advanced Features</h3>
                <ul className="capabilities-list">
                  <li>🎙 Voice-based questions (Speech-to-Text)</li>
                  <li>🧾 Subtitle extraction for better context</li>
                  <li>🧠 Context memory for continuous Q&A</li>
                  <li>📌 Bookmark important timestamps</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="cta-footer slide-up-fade" style={{ animationDelay: '0.6s' }}>
            <h2 className="section-title">Ready to Learn Faster?</h2>
            <div className="footer-actions">
              <button className="giant-play-button bounce-in" onClick={handleStart}>
                <div className="play-icon"></div>
                <span>Try Pause AI Now</span>
              </button>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="action-button secondary-btn hover-lift">
                ⭐ Star on GitHub
              </a>
              <button className="action-button secondary-btn hover-lift">
                💬 Share Feedback
              </button>
            </div>
          </div>
        </div>
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
