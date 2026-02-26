# Pause AI - Frontend Implementation Guide

## Overview

This document details the complete React frontend implementation for Pause AI, following the system flow: **Video Upload → Pause at Timestamp → Voice/Text Input → Context Extraction → RAG + LLM Answer → Audio/Text Response**

## System Flow Implementation

### 1. **Home Page (`/`)**

**Purpose**: Landing page and video upload entry point

**User Flow**:
1. User arrives at home page
2. Sees hero section with features and how-it-works guide
3. Uploads video via URL
4. System validates and uploads video
5. Redirected to `/video/{videoId}` for viewing

**Key Components**:
- Hero section with call-to-action
- Video upload form with validation
- Features grid (6 key features)
- How-it-works 4-step visual guide
- Tech stack badges
- Upload progress indicator

**Implementation Details** (`src/pages/Home.jsx`):
```javascript
const handleUploadVideo = async () => {
  // Validate URL
  // Call videoService.uploadVideo()
  // Show loading state
  // Navigate to /video/{videoId} on success
  // Display error message on failure
}
```

---

### 2. **Video Playback Page (`/video/:videoId`)**

**Purpose**: Main video playback with integrated doubt capture

**User Flow**:
1. Load video details and processing status
2. Display video player while video is being processed
3. Once ready, allow user to pause and ask questions
4. Display responses in sidebar
5. Maintain chat history of all questions

**Components & Sections**:

#### **Video Player Section** (Left/Top)
```
┌─────────────────────────────────────┐
│   Custom Video Player               │
│   ┌──────────────────────────────┐  │
│   │        PAUSE AI VIDEO         │  │
│   └──────────────────────────────┘  │
│   Controls: Play | ⏸ Pause | Progress Bar │
│   [Ask Doubt Button]                │
└─────────────────────────────────────┘
```

- Custom controls (play, pause, seek)
- Progress bar with time display
- "Ask Doubt" button to pause at timestamp
- Processing overlay during video indexing

#### **Sidebar** (Right/Bottom on mobile)
```
┌──────────────────────┐
│  DOUBT CAPTURE       │  (When paused)
│  ┌─────────────────┐ │
│  │ Voice/Text Input│ │
│  │ [Submit Button] │ │
│  └─────────────────┘ │
├──────────────────────┤
│  RESPONSE            │  (After submission)
│  ┌─────────────────┐ │
│  │  AI Answer      │ │
│  │  Confidence: 95%│ │
│  │  [Play Audio]   │ │
│  │  [Sources] ▼    │ │
│  └─────────────────┘ │
├──────────────────────┤
│  CHAT HISTORY        │  (When not paused)
│  ┌─────────────────┐ │
│  │ Q1: How to...?  │ │
│  │ A1: Answer...   │ │
│  ├─────────────────┤ │
│  │ Q2: What is...? │ │
│  │ A2: Answer...   │ │
│  └─────────────────┘ │
└──────────────────────┘
```

**Implementation** (`src/pages/VideoPage.jsx`):
```javascript
// 1. Fetch video details
const [videoDetails, setVideoDetails] = useState(null);
const [isVideoReady, setIsVideoReady] = useState(false);

// 2. Monitor video processing status
useEffect(() => {
  const statusInterval = setInterval(async () => {
    const status = await getVideoStatus(videoId);
    if (status.status === 'completed') {
      setIsVideoReady(true);
    }
  }, 3000);
}, []);

// 3. Handle pause event from video player
const handleVideoTimestampPause = (timestamp) => {
  setCurrentTimestamp(timestamp);
  setIsPaused(true);
  // Show DoubtCapture component
}

// 4. Handle question submission
const handleDoubtSubmit = async (doubtData) => {
  // Call videoService.askQuestion()
  // Display response in DoubtResponse component
  // Reload chat history
}

// 5. Load chat history
const loadChatHistory = async () => {
  const history = await getChatHistory(videoId, 50, 0);
  setChatHistory(history.chats);
}
```

---

### 3. **Video Player Component** (`src/components/VideoPlayer.jsx`)

**Purpose**: Custom HTML5 video player with pause-for-doubt functionality

**Features**:
- Play/pause controls
- Progress bar with seek capability
- Time display (current/duration)
- "Ask Doubt" button
- Auto-hide controls on idle playback
- Disabled state during processing

**Key Methods**:
```javascript
const handlePauseForDoubt = () => {
  videoRef.current.pause();
  setIsPlaying(false);
  onTimestampPause?.(currentTime); // Callback with timestamp
}

const handleSeek = (newTime) => {
  videoRef.current.currentTime = newTime;
}

const handlePlayPause = () => {
  if (videoRef.current.paused) {
    videoRef.current.play();
  } else {
    videoRef.current.pause();
  }
}
```

---

### 4. **Doubt Capture Component** (`src/components/DoubtCapture.jsx`)

**Purpose**: Capture user's question via voice or text input

**Two Input Methods**:

#### **Text Input**
```
┌─────────────────────────────────┐
│  📝 TEXT INPUT                  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Ask your doubt here...      │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│ Characters: 156/500             │
│ [Submit Button]                 │
└─────────────────────────────────┘
```

#### **Voice Input**
```
┌─────────────────────────────────┐
│  🎤 VOICE RECORDING             │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ● RECORDING... 00:12        │ │
│ │ (Red pulse indicator)        │ │
│ └─────────────────────────────┘ │
│ [Stop Recording] [Re-record]    │
│ [Submit Button]                 │
└─────────────────────────────────┘
```

**Key State**:
```javascript
const [inputMethod, setInputMethod] = useState('text');
const [textInput, setTextInput] = useState('');
const { isRecording, audioBlob, startRecording, stopRecording } = useAudioRecorder();

const handleSubmit = () => {
  if (inputMethod === 'text') {
    onSubmit({ type: 'text', content: textInput, timestamp });
  } else {
    onSubmit({ type: 'audio', content: audioBlob, timestamp });
  }
}
```

**Validation**:
- Text: 1-500 characters
- Audio: Minimum 1 second recording
- Prevents duplicate submissions

---

### 5. **Doubt Response Component** (`src/components/DoubtResponse.jsx`)

**Purpose**: Display AI-generated answer with confidence and sources

**Response Display**:
```
┌────────────────────────────────────────┐
│ ANSWER TO: "How does photosynthesis..." │
├────────────────────────────────────────┤
│                                         │
│ The process of photosynthesis...       │
│ [continued response text]               │
│                                         │
├────────────────────────────────────────┤
│ Confidence: ████████░ 95%   (HIGH)     │
│ Processing Time: 2.3s                   │
│                                         │
│ [Play Audio 🔊] [Copy 📋] [Helpful ✓] │
├────────────────────────────────────────┤
│ SOURCES (3)                             │
│ ┌─────────────────────────────────────┤
│ │ [02:15] - Photosynthesis Basics     │
│ │ Relevance: 98%                      │
│ │ "Photosynthesis is the process..."  │
│ └─────────────────────────────────────┤
│ ┌─────────────────────────────────────┤
│ │ [05:30] - Chlorophyll Role          │
│ │ Relevance: 92%                      │
│ │ "Chlorophyll absorbs light energy..."│
│ └─────────────────────────────────────┤
└────────────────────────────────────────┘
```

**Props**:
```javascript
{
  question: "How does photosynthesis work?",
  answer: "The process begins with...",
  confidence: 0.95,
  sources: [
    {
      timestamp: 135,
      relevance: 0.98,
      text: "Photosynthesis is..."
    },
    // ...
  ],
  processingTime: 2.3,
  onPlayAudio: () => {}
}
```

**Features**:
- Answer text display
- Confidence score with color (high/medium/low)
- Processing time metric
- Audio playback button
- Expandable sources with timestamps
- Helpful/Not helpful buttons
- Copy to clipboard

---

### 6. **Chat History**

**Location**: Sidebar, visible when not paused

**Display Format**:
```
Q: How does photosynthesis work?
A: The process of photosynthesis involves...

[02:15] source reference

---

Q: What is chlorophyll?
A: Chlorophyll is a green pigment...

[05:30] source reference
```

**Features**:
- Reverse chronological order (latest first)
- Timestamp shown for each question
- Collapsible sources
- Quick access to referenced video segments

---

## Component Architecture

### Component Tree
```
App (Root)
├── ErrorBoundary (Global error handling)
├── Header (Navigation)
└── Routes
    ├── Home Page
    │   ├── Hero Section
    │   ├── Upload Form
    │   ├── Features Grid
    │   └── How-it-works Steps
    └── VideoPage
        ├── Video Player
        └── Sidebar
            ├── DoubtCapture (when paused)
            ├── DoubtResponse (when answered)
            └── ChatHistory (when idle)
```

### State Management

**Local State per Page**:
- Home: upload form state, loading, error
- VideoPage: video details, current timestamp, pause state, response, chat history

**Custom Hooks for Reusable Logic**:
- `useAudioRecorder()` - Voice recording
- `useAudioPlayer()` - Audio playback
- `useLocalStorage()` - Persistent storage
- `useToast()` - Notifications

---

## API Integration

### Request/Response Flow

#### 1. Video Upload
```
User → Frontend → Backend
POST /api/videos/upload
{
  video_url: "https://example.com/video.mp4"
}
↓
Response:
{
  video_id: "vid_12345",
  title: "Video Title",
  status: "queued"
}
Frontend → Navigate to /video/vid_12345
```

#### 2. Check Processing Status
```
Frontend → Backend (polled every 3s)
GET /api/videos/{videoId}/status
↓
Response:
{
  status: "processing" | "completed" | "ready",
  progress: 45
}
Show processing overlay until status === "completed"
```

#### 3. Get Video Details
```
Frontend → Backend
GET /api/videos/{videoId}
↓
Response:
{
  video_id: "vid_12345",
  title: "Video Title",
  duration: 1200,
  video_url: "...",
  created_at: "2024-01-15T10:30:00Z"
}
Set as videoDetails state
```

#### 4. Ask Question
```
User Input → Frontend → Backend
POST /api/doubts/ask
{
  video_id: "vid_12345",
  question: "How does XYZ work?",
  context_window: 5,  // seconds before/after timestamp
  timestamp: 120
}
↓
Response:
{
  question: "How does XYZ work?",
  answer: "The process involves...",
  confidence: 0.95,
  processing_time: 2.3,
  sources: [
    {
      timestamp: 115,
      relevance: 0.98,
      text: "Relevant segment..."
    }
  ],
  audio_url: "https://..."
}
Display in DoubtResponse component
```

#### 5. Get Chat History
```
Frontend → Backend
GET /api/videos/{videoId}/chat-history?limit=50&offset=0
↓
Response:
{
  chats: [
    {
      question: "Q1?",
      answer: "A1...",
      timestamp: 120,
      confidence: 0.95
    },
    // ...
  ]
}
Display in ChatHistory sidebar
```

---

## Error Handling Strategy

### Global Error Boundary
Catches any unhandled component errors:
```javascript
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

### API Error Handling
Each service function has try-catch:
```javascript
try {
  const response = await askQuestion(...);
  return response.data;
} catch (error) {
  const message = error.response?.data?.error || error.message;
  throw new Error(message);
}
```

### User Feedback
- Toast notifications for async operations
- Inline alerts for validation errors
- Processing indicators during loading
- Clear error messages with recovery steps

---

## Styling System

### CSS Variable Theming
```css
--primary-color: #3b82f6;        /* Main brand color */
--secondary-color: #8b5cf6;      /* Accent color */
--bg-white: #ffffff;
--bg-light: #f9fafb;
--text-primary: #1f2937;
--text-secondary: #6b7280;
--border-color: #e5e7eb;
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Responsive Breakpoints
- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px (sidebar below)
- Desktop: > 1024px (side-by-side layout)

---

## Key Features Walkthrough

### Feature 1: Voice Recording
```javascript
// In useAudioRecorder hook
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
}

const stopRecording = () => {
  mediaRecorder.stop();
  // Convert stream to audioBlob
}
```

### Feature 2: Video Pause at Timestamp
```javascript
// In VideoPlayer component
const handlePauseForDoubt = () => {
  const timestamp = videoRef.current.currentTime;
  onTimestampPause?.(timestamp); // Pass to parent
}
```

### Feature 3: Confidence Score Display
```javascript
// In DoubtResponse component
const getConfidenceColor = (score) => {
  if (score >= 0.8) return 'high';   // Green
  if (score >= 0.6) return 'medium'; // Yellow
  return 'low';                       // Red
}
```

### Feature 4: Audio Response Playback
```javascript
// In DoubtResponse component
const handlePlayAudio = (audioUrl) => {
  const audio = new Audio(audioUrl);
  audio.play();
}
```

---

## Performance Considerations

1. **Lazy Loading**: Pages loaded only when needed via React Router
2. **Memoization**: useCallback for event handlers
3. **Polling Optimization**: Stop polling once video is ready
4. **CSS Optimization**: CSS variables avoid recalculation
5. **Bundle Size**: Vite tree-shaking removes unused code

---

## Testing Checklist

- [ ] Upload video URL and redirect to VideoPage
- [ ] Video player loads with correct controls
- [ ] Click "Ask Doubt" pauses video
- [ ] Text input validates 1-500 characters
- [ ] Voice recording works and shows indicator
- [ ] Question submission shows loading state
- [ ] Response displays with confidence, sources, audio
- [ ] Chat history populates after multiple questions
- [ ] Error handling shows user-friendly messages
- [ ] Mobile layout stacks components properly
- [ ] Audio playback works on response

---

## Deployment

### Build
```bash
npm run build
# Output: dist/ folder ready for deployment
```

### Environment Variables
Create `.env.local`:
```env
VITE_API_BASE_URL=https://api.pauseai.com
VITE_API_TIMEOUT=30000
```

### Hosting
- Use any static hosting (Vercel, Netlify, AWS S3)
- Ensure CORS is enabled on backend for API calls

---

## Future Enhancements

1. **Offline Support**: Service workers for offline video playback
2. **Advanced Search**: Full-text search across video content
3. **Bookmarks**: Save important moments in videos
4. **Sharing**: Share specific Q&A pairs
5. **User Preferences**: Theme, language, notification settings
6. **Analytics**: Track question patterns and user engagement
7. **Collaborative Learning**: Comments and discussions
8. **Assessment**: Quiz generation from video content

---

## File Summary

| File | Purpose |
|------|---------|
| `App.jsx` | Root component with routing |
| `index.css` | Global styles and CSS variables |
| `App.css` | Utility classes and components |
| `Header.jsx` | Navigation header |
| `VideoPlayer.jsx` | Custom video player |
| `DoubtCapture.jsx` | Voice/text question input |
| `DoubtResponse.jsx` | AI response display |
| `ErrorBoundary.jsx` | Global error handling |
| `LoadingSpinner.jsx` | Loading indicator |
| `Toast.jsx` | Toast notifications |
| `Home.jsx` | Landing and upload page |
| `VideoPage.jsx` | Main video playback page |
| `api.js` | Axios client |
| `videoService.js` | API service functions |
| `useMedia.js` | Audio recording/playback hooks |
| `useToast.js` | Toast notification hook |
| `helpers.js` | Utility functions |

---

**Total Implementation: 25+ files, ~3500+ lines of code for complete React frontend**
