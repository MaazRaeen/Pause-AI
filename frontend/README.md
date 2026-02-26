# Pause AI - Frontend (React)

## Overview

Frontend UI for Pause AI using React. Provides user interface for video upload, real-time chat interface, and doubt resolution.

---

## Technology Stack

- **Framework:** React 18+
- **Build Tool:** Vite / Create React App
- **Styling:** CSS3 / Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** Context API / Zustand (optional)
- **Routing:** React Router DOM

---

## Project Structure

```
frontend/
├── public/                      # Static assets
│   └── index.html
│
├── src/
│   ├── components/              # React components
│   │   ├── Header.jsx
│   │   ├── VideoUpload.jsx      # Upload form
│   │   ├── ChatInterface.jsx    # Chat UI
│   │   ├── DoubtResolution.jsx  # Answer display
│   │   ├── LoadingSpinner.jsx
│   │   └── index.js
│   │
│   ├── pages/                   # Page components
│   │   ├── Home.jsx             # Landing page
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── VideoPlayer.jsx      # Video + chat
│   │   └── index.js
│   │
│   ├── services/                # API services
│   │   ├── api.js               # API client setup
│   │   ├── videoService.js      # Video endpoints
│   │   ├── doubtService.js      # Question endpoints
│   │   └── index.js
│   │
│   ├── styles/                  # CSS files
│   │   ├── index.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   └── variables.css
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   └── index.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── index.js
│   │
│   ├── store/                   # State management (if using Zustand)
│   │   ├── videoStore.js
│   │   ├── chatStore.js
│   │   └── index.js
│   │
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # Entry point (Vite)
│   └── index.js                 # Entry point (CRA)
│
├── .env.example                 # Environment template
├── package.json
├── vite.config.js (or) create-react-app config
└── README.md                    # This file
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your backend URL
```

### 3. Run Development Server

```bash
# Using Vite
npm run dev
# Navigate to http://localhost:5173

# Using Create React App
npm start
# Navigate to http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
```

---

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (Vite)
npm start            # Start dev server (CRA)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests (CRA)
npm test -- --watch  # Run tests in watch mode
```

---

## Key Components

### VideoUpload.jsx
- Video URL input field
- File upload with drag-drop
- Progress indicator
- Process status display

### ChatInterface.jsx
- Message display area
- Question input field
- Send button with loading state
- Real-time message updates
- Source/timestamp display

### VideoPlayer.jsx
- Video player (HLS/MP4)
- Timeline with segments
- Chat sidebar
- Video sync with transcription

### DoubtResolution.jsx
- Answer display
- Source citations
- Confidence indicator
- Helpful feedback buttons

---

## API Integration

### Creating API Service

**services/api.js:**
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 30000;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

export default apiClient;
```

### Usage Example

```javascript
// services/videoService.js
import apiClient from './api';

export const uploadVideo = async (videoUrl) => {
  const response = await apiClient.post('/videos/upload', {
    video_source: 'url',
    video_url: videoUrl,
  });
  return response.data;
};

// In component
const { data } = await uploadVideo(url);
const videoId = data.video_id;
```

---

## State Management

### Using Context API

```javascript
// Context setup
const VideoContext = createContext();

// Provider component
export function VideoProvider({ children }) {
  const [videos, setVideos] = useState([]);
  // ... logic
  return (
    <VideoContext.Provider value={...}>
      {children}
    </VideoContext.Provider>
  );
}
```

### Using Zustand (Alternative)

```javascript
import create from 'zustand';

const useVideoStore = create((set) => ({
  videos: [],
  addVideo: (video) => set((state) => ({
    videos: [...state.videos, video],
  })),
}));
```

---

## Styling

### CSS Variables (variables.css)

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --danger-color: #ef4444;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-light: #f9fafb;
  --bg-dark: #111827;
  --border-color: #e5e7eb;
}
```

### Tailwind CSS (if using)

```html
<!-- Use Tailwind classes -->
<div className="flex items-center justify-between p-4 bg-blue-50">
  <h1 className="text-2xl font-bold text-blue-900">Video Title</h1>
</div>
```

---

## Performance Optimization

- Lazy loading components: `React.lazy()`
- Code splitting with React Router
- Image optimization
- Memoization: `useMemo()`, `useCallback()`
- Virtual scrolling for long lists

---

## Environment Variables

```bash
# .env.local
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_ENABLE_CACHING=true
```

---

## Custom Hooks

### useApi.js
```javascript
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (...args) => {
    setLoading(true);
    try {
      const result = await apiFunction(...args);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, call };
}
```

---

## Routing

### App.jsx Setup

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:videoId" element={<VideoPlayer />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Development Guidelines

### Component Structure

```javascript
import { useState } from 'react';
import '../styles/components.css';

export function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);

  const handleClick = () => {
    // Handler logic
  };

  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

### Error Handling

```javascript
import { Component } from 'react';

class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong</h1>;
    }
    return this.props.children;
  }
}
```

---

## Troubleshooting

**API not connecting:**
- Check `.env.local` `REACT_APP_API_URL`
- Verify backend is running
- Check CORS settings in backend

**CSS not loading:**
- Verify CSS import paths
- Check CSS file exists in `src/styles/`

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

---

## Testing

### Using Jest & React Testing Library

```bash
npm test
```

### Example Test

```javascript
import { render, screen } from '@testing-library/react';
import VideoUpload from '../components/VideoUpload';

test('renders upload form', () => {
  render(<VideoUpload />);
  expect(screen.getByText(/upload/i)).toBeInTheDocument();
});
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Resources

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## Contributing

- Follow component structure guidelines
- Write clear component names
- Document complex logic
- Test components before committing

