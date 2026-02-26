import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 4000,
  action = null 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {action && (
          <button 
            className="toast-action" 
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      <button 
        className="toast-close" 
        onClick={onClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
