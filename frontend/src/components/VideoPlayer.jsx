import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

function VideoPlayer({ videoUrl, onTimestampPause, onTimeUpdate }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
    onTimeUpdate?.(state.playedSeconds);
    if (!duration && playerRef.current) {
      setDuration(playerRef.current.getDuration() || 0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    if (playerRef.current) {
      playerRef.current.seekTo(percent);
    }
  };

  const handlePauseForDoubt = () => {
    setIsPlaying(false);
    onTimestampPause?.(currentTime);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="video-player-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="video-element-wrapper" onClick={handlePlayPause}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            youtube: {
              playerVars: { showinfo: 1, controls: 0 }
            }
          }}
        />
      </div>

      <div className={`video-controls ${showControls ? 'visible' : ''}`}>
        {/* Progress bar */}
        <div className="progress-bar-container" onClick={handleSeek}>
          <div
            className="progress-bar"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Bottom controls */}
        <div className="controls-bottom">
          <div className="controls-left">
            <button
              className="btn btn-control"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            className="btn btn-control btn-doubt"
            onClick={handlePauseForDoubt}
            title="Pause and ask doubt"
          >
            ❓ Ask Doubt
          </button>

          <div className="controls-right">
            <button className="btn btn-control" title="Fullscreen">
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
