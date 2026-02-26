import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import DoubtCapture from '../components/DoubtCapture';
import DoubtResponse from '../components/DoubtResponse';
import { getVideoDetails, getVideoStatus, askQuestion, getChatHistory } from '../services/videoService';
import './VideoPage.css';

// Loading skeleton for video details
const LoadingSkeleton = () => (
  <div className="loading-skeleton">
    <div className="skeleton-avatar"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line short"></div>
  </div>
);

const MOCK_PIPELINE_STAGES = [
  { id: 'extract_context', label: 'Extracting Video Context & Transcript...' },
  { id: 'run_ocr', label: 'Running OCR on Key Frames...' },
  { id: 'vector_db', label: 'Querying Vector Database (RAG)...' },
  { id: 'llm_gen', label: 'Generating AI Response...' },
];

const VideoPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Video state
  const [videoDetails, setVideoDetails] = useState(null);
  const [videoProcessingStatus, setVideoProcessingStatus] = useState('loading');
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Doubt and response state
  const [isPaused, setIsPaused] = useState(false);
  const [currentDoubt, setCurrentDoubt] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [pipelineStageIndex, setPipelineStageIndex] = useState(-1);

  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setError(null);
        let decodedId = videoId ? decodeURIComponent(videoId) : 'default';
        const details = await getVideoDetails(decodedId);

        // Use the actual user-input URL from the router navigation state if present
        if (location.state?.videoUrl) {
          details.video_url = location.state.videoUrl;
          details.title = location.state.title || 'Dynamic Video Upload';
        }

        setVideoDetails(details);

        const status = await getVideoStatus(decodedId);
        setVideoProcessingStatus(status.status);
        setIsVideoReady(status.status === 'completed' || status.status === 'ready');

        await loadChatHistory();
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to load video. Please try again.');
      }
    };

    if (videoId) fetchVideoData();
  }, [videoId]);

  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoadingChat(true);
      const decodedId = decodeURIComponent(videoId);
      const history = await getChatHistory(decodedId, 50, 0);
      setChatHistory(history.chats || []);
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoadingChat(false);
    }
  }, [videoId]);

  const handleVideoTimestampPause = (timestamp) => {
    setCurrentTimestamp(timestamp);
    setIsPaused(true);
    setCurrentDoubt(null);
    setCurrentResponse(null);
    setPipelineStageIndex(-1);
  };

  const handleDoubtSubmit = async (doubtData) => {
    try {
      setIsLoadingResponse(true);
      setError(null);
      setPipelineStageIndex(0); // Start pipeline UI

      const newDoubt = {
        ...doubtData,
        timestamp: currentTimestamp,
      };
      setCurrentDoubt(newDoubt);

      // Simulate pipeline UI updating while waiting for backend
      const interval = setInterval(() => {
        setPipelineStageIndex(prev => {
          if (prev >= MOCK_PIPELINE_STAGES.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700); // Progress stage every 700ms

      const decodedId = decodeURIComponent(videoId);
      const response = await askQuestion(
        decodedId,
        doubtData.content,
        5
      );

      clearInterval(interval);

      setCurrentResponse({
        question: doubtData.content,
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources || [],
        processingTime: response.processing_time,
      });

      await loadChatHistory();
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Failed to process your question. Please try again.');
      setIsPaused(true);
    } finally {
      setIsLoadingResponse(false);
      setPipelineStageIndex(-1);
    }
  };

  const handleCloseDoubtCapture = () => {
    setIsPaused(false);
    setCurrentDoubt(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (error && !videoDetails) {
    return (
      <div className="video-page-error">
        <div className="error-content">
          <h1>⚠️ Error</h1>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-page-container fade-in">
      <div className="video-page-header glass-header">
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleGoHome}
          title="Go back to home"
        >
          ← Back
        </button>
        <h1>
          {videoDetails?.title || 'Interactive Video Player'}
        </h1>
        <div className="status-badge">
          {videoProcessingStatus === 'completed' || videoProcessingStatus === 'ready' ? (
            <span className="badge badge-success pulse-glow">🟢 AI Ready</span>
          ) : (
            <span className="badge badge-processing">
              Processing...
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button
            className="alert-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="video-page-content layout-glass">
        {/* Main video player section */}
        <div className="video-section">
          {!isVideoReady && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <p>Initializing AI Context...</p>
            </div>
          )}

          <VideoPlayer
            videoUrl={videoDetails?.video_url}
            onTimestampPause={handleVideoTimestampPause}
            disabled={!isVideoReady}
          />
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Current doubt capture section */}
          {isPaused && !currentResponse && (
            <div className="doubt-section slide-up">
              <div className="doubt-section-header">
                <h3>Pose a Question Contextually</h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCloseDoubtCapture}
                  title="Close doubt capture"
                >
                  ✕
                </button>
              </div>

              <DoubtCapture
                timestamp={currentTimestamp}
                onSubmit={handleDoubtSubmit}
                isLoading={isLoadingResponse}
              />

              {/* Animated Pipeline Stage UI */}
              {isLoadingResponse && pipelineStageIndex >= 0 && (
                <div className="pipeline-status-container">
                  <div className="pipeline-stage active-pulse">
                    <span className="pipeline-spinner" />
                    <span className="pipeline-text">
                      {MOCK_PIPELINE_STAGES[pipelineStageIndex]?.label}
                    </span>
                  </div>
                  <div className="pipeline-progress-bar">
                    <div
                      className="pipeline-progress-fill"
                      style={{ width: `${((pipelineStageIndex + 1) / MOCK_PIPELINE_STAGES.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current response section */}
          {currentResponse && (
            <div className="response-section slide-up">
              <h3>AI Explanation</h3>
              <DoubtResponse
                question={currentResponse.question}
                answer={currentResponse.answer}
                confidence={currentResponse.confidence}
                sources={currentResponse.sources}
                processingTime={currentResponse.processingTime}
              />
            </div>
          )}

          {/* Chat history toggle and display (minimal) */}
          {!isPaused && !currentResponse && (
            <div className="chat-history-section glass-card">
              <button
                className="btn btn-primary full-width"
                onClick={() => setShowChatHistory(!showChatHistory)}
              >
                {showChatHistory ? '✕ Close History' : '💬 View Previous Explanations'}
              </button>

              {showChatHistory && (
                <div className="chat-history-list">
                  {isLoadingChat ? (
                    <LoadingSkeleton />
                  ) : chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <div key={index} className="chat-item slide-up">
                        <div className="chat-timestamp">
                          {Math.floor(chat.timestamp)}s
                        </div>
                        <div className="chat-content">
                          <p className="chat-question"><strong>Q:</strong> {chat.question}</p>
                          <p className="chat-answer"><strong>A:</strong> {chat.answer}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-history text-muted">No interactions yet. Pause the video to ask a question!</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
