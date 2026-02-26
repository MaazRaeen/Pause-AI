import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const VideoPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

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

  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Fetch video details and processing status
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setError(null);
        
        // Get video details
        const details = await getVideoDetails(videoId);
        setVideoDetails(details);

        // Check processing status
        const status = await getVideoStatus(videoId);
        setVideoProcessingStatus(status.status);
        setIsVideoReady(status.status === 'completed' || status.status === 'ready');

        // Load chat history
        await loadChatHistory();
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError(
          err.message || 'Failed to load video. Please try again.'
        );
      }
    };

    if (videoId) {
      fetchVideoData();

      // Poll for processing status updates
      const statusInterval = setInterval(async () => {
        try {
          const status = await getVideoStatus(videoId);
          setVideoProcessingStatus(status.status);
          
          if (status.status === 'completed' || status.status === 'ready') {
            setIsVideoReady(true);
            clearInterval(statusInterval);
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(statusInterval);
    }
  }, [videoId]);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoadingChat(true);
      const history = await getChatHistory(videoId, 50, 0);
      setChatHistory(history.chats || []);
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoadingChat(false);
    }
  }, [videoId]);

  // Handle video pause event
  const handleVideoTimestampPause = (timestamp) => {
    setCurrentTimestamp(timestamp);
    setIsPaused(true);
    setCurrentDoubt(null);
    setCurrentResponse(null);
  };

  // Handle doubt submission
  const handleDoubtSubmit = async (doubtData) => {
    try {
      setIsLoadingResponse(true);
      setError(null);

      // Add to local state for optimistic UI update
      const newDoubt = {
        ...doubtData,
        timestamp: currentTimestamp,
      };
      setCurrentDoubt(newDoubt);

      // Ask question to backend
      const response = await askQuestion(
        videoId,
        doubtData.content,
        5 // context window of 5 seconds
      );

      // Update current response
      setCurrentResponse({
        question: doubtData.content,
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources || [],
        processingTime: response.processing_time,
        audioUrl: response.audio_url,
      });

      // Reload chat history to include new question
      await loadChatHistory();
    } catch (err) {
      console.error('Error asking question:', err);
      setError(err.message || 'Failed to process your question. Please try again.');
      setIsPaused(true); // Keep paused if error occurs
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle playing audio response
  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio response.');
      });
    }
  };

  // Close doubt capture and resume video
  const handleCloseDoubtCapture = () => {
    setIsPaused(false);
    setCurrentDoubt(null);
  };

  // Go back to home
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
    <div className="video-page-container">
      <div className="video-page-header">
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleGoHome}
          title="Go back to home"
        >
          ← Back
        </button>
        <h1>
          {videoDetails?.title || 'Video Player'}
        </h1>
        <div className="status-badge">
          {videoProcessingStatus === 'completed' || videoProcessingStatus === 'ready' ? (
            <span className="badge badge-success">Ready</span>
          ) : (
            <span className="badge badge-processing">
              Processing... {videoProcessingStatus}
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
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      <div className="video-page-content">
        {/* Main video player section */}
        <div className="video-section">
          {!isVideoReady && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <p>Processing your video...</p>
              <span className="processing-hint">
                This usually takes a few minutes.
              </span>
            </div>
          )}
          
          <VideoPlayer
            videoUrl={videoDetails?.video_url}
            onTimestampPause={handleVideoTimestampPause}
            disabled={!isVideoReady}
          />
        </div>

        {/* Sidebar with responses and chat history */}
        <div className="sidebar">
          {/* Current doubt capture section */}
          {isPaused && (
            <div className="doubt-section">
              <div className="doubt-section-header">
                <h3>Ask Your Doubt</h3>
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
            </div>
          )}

          {/* Current response section */}
          {currentResponse && (
            <div className="response-section">
              <h3>Answer</h3>
              <DoubtResponse
                question={currentResponse.question}
                answer={currentResponse.answer}
                confidence={currentResponse.confidence}
                sources={currentResponse.sources}
                processingTime={currentResponse.processingTime}
                onPlayAudio={() => handlePlayAudio(currentResponse.audioUrl)}
              />
            </div>
          )}

          {/* Chat history toggle and display */}
          {!isPaused && !currentResponse && (
            <div className="chat-history-section">
              <button
                className="btn btn-primary"
                onClick={() => setShowChatHistory(!showChatHistory)}
              >
                {showChatHistory ? '✕ Hide' : '💬'} Chat History ({chatHistory.length})
              </button>

              {showChatHistory && (
                <div className="chat-history-list">
                  {isLoadingChat ? (
                    <LoadingSkeleton />
                  ) : chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <div key={index} className="chat-item">
                        <div className="chat-timestamp">
                          {Math.floor(chat.timestamp)}s
                        </div>
                        <div className="chat-content">
                          <p className="chat-question">
                            <strong>Q:</strong> {chat.question}
                          </p>
                          <p className="chat-answer">
                            <strong>A:</strong> {chat.answer}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-history">No questions asked yet.</p>
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
