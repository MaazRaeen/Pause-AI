import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/videoService';
import './Home.css';

function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoIdToOpen, setVideoIdToOpen] = useState('');
  const navigate = useNavigate();

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await uploadVideo(videoUrl);
      console.log('Video uploaded:', response);
      
      // Navigate to video page with the video ID
      navigate(`/video/${response.video_id}`, {
        state: { videoUrl: videoUrl, ...response },
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload video. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickLoad = () => {
    if (videoIdToOpen.trim()) {
      navigate(`/video/${videoIdToOpen}`);
      setVideoIdToOpen('');
    }
  };

  return (
    <main className="home-container">
      <div className="home-content">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">⏸️ Pause AI</h1>
          <p className="hero-subtitle">
            Real-time AI explanations for any video. Pause, ask, and understand.
          </p>
          <p className="hero-description">
            Upload any educational video and get instant AI-powered explanations for your doubts
            using advanced speech recognition, embeddings, and large language models.
          </p>
        </section>

        {/* Main Upload Section */}
        <section className="upload-section card">
          <h2>📹 Get Started</h2>
          <p className="section-subtitle">
            Paste your video URL below and start asking questions
          </p>

          <form onSubmit={handleVideoSubmit} className="upload-form">
            <div className="input-group">
              <label htmlFor="videoUrl">Video URL</label>
              <input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isLoading}
                className="video-input"
              />
              <small className="input-hint">
                Supported: YouTube, Vimeo, direct MP4, WebM, MOV links
              </small>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || !videoUrl.trim()}
            >
              {isLoading ? '⏳ Processing...' : '🚀 Load Video'}
            </button>
          </form>

          {/* Loading Progress */}
          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Uploading your video and analyzing content...</p>
              <div className="progress-info">
                <small>This may take a few minutes for the first time</small>
              </div>
            </div>
          )}
        </section>

        {/* OR Divider */}
        <div className="or-divider">
          <span>or</span>
        </div>

        {/* Quick Load Section */}
        <section className="quick-load-section card">
          <h3>🔍 Load Previous Video</h3>
          <div className="input-group">
            <label htmlFor="videoId">Enter Video ID</label>
            <div className="input-with-button">
              <input
                id="videoId"
                type="text"
                placeholder="e.g., vid_12345"
                value={videoIdToOpen}
                onChange={(e) => setVideoIdToOpen(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleQuickLoad}
                disabled={!videoIdToOpen.trim()}
              >
                Load
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>✨ Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3>Voice Input</h3>
              <p>Ask questions using your voice. Advanced speech recognition converts speech to text.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI Explanations</h3>
              <p>Get instant, contextual explanations powered by advanced language models.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3>Audio Response</h3>
              <p>Listen to AI-generated explanations with text-to-speech technology.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Source Citations</h3>
              <p>Get exact timestamps showing where answers come from in the video.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Processing</h3>
              <p>Pause at any moment and get instant answers without delays.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Context</h3>
              <p>AI understands context from surrounding video segments for better answers.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h2>🔄 How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Upload Video</h4>
              <p>Paste your video URL</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Pause & Ask</h4>
              <p>Pause at any moment</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Voice or Text</h4>
              <p>Ask your question</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Get Answer</h4>
              <p>Read or listen to AI</p>
            </div>
          </div>
        </section>

        {/* Tech Stack Info */}
        <section className="tech-stack">
          <h3>🚀 Powered By</h3>
          <div className="tech-badges">
            <span className="tech-badge">OpenAI Whisper</span>
            <span className="tech-badge">Sentence Transformers</span>
            <span className="tech-badge">FAISS/Pinecone</span>
            <span className="tech-badge">GPT-3.5 Turbo</span>
            <span className="tech-badge">RAG Pipeline</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
