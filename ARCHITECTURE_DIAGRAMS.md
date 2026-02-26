# 🏗️ Pause AI - Frontend Architecture Diagram

## Complete System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PAUSE AI ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                          BROWSER / CLIENT SIDE                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      User Interface Layer                         │ │
│  │                                                                  │ │
│  │  ┌─────────────────────┬──────────────────────────────────────┐ │ │
│  │  │     Header          │       Video Player                   │ │ │
│  │  │  (Navigation)       │  ┌──────────────────────────────────┐ │ │
│  │  │                     │  │ Custom Controls                  │ │ │
│  │  │  - Home Link        │  │ - Play/Pause                     │ │ │
│  │  │  - About Link       │  │ - Seek Bar                       │ │ │
│  │  │  - Mobile Menu      │  │ - Time Display                   │ │ │
│  │  │                     │  │ - Ask Doubt Button → Pause       │ │ │
│  │  │                     │  │ - Auto-hide Controls             │ │ │
│  │  │                     │  └──────────────────────────────────┘ │ │
│  │  │                     │                                        │ │
│  │  └─────────────────────┴──────────────────────────────────────┘ │ │
│  │                                                                  │ │
│  │  ┌──────────────────────────┬──────────────────────────────────┐ │ │
│  │  │   Left/Top               │      Right/Bottom (Sidebar)      │ │ │
│  │  │   Video Content          │                                  │ │ │
│  │  │                          │  ┌─────────────────────────────┐ │ │
│  │  │                          │  │  DoubtCapture (when paused) │ │ │
│  │  │                          │  │  ┌─────────────────────────┐ │ │
│  │  │                          │  │  │ TEXT TAB:               │ │ │
│  │  │                          │  │  │ - Input field (500 char)│ │ │
│  │  │                          │  │  │ - Char counter         │ │ │
│  │  │                          │  │  │                         │ │ │
│  │  │                          │  │  │ VOICE TAB:              │ │ │
│  │  │                          │  │  │ - Mic button            │ │ │
│  │  │                          │  │  │ - Recording indicator   │ │ │
│  │  │                          │  │  │ - Re-record button      │ │ │
│  │  │                          │  │  │ - Submit button         │ │ │
│  │  │                          │  │  └─────────────────────────┘ │ │
│  │  │                          │  └─────────────────────────────┘ │ │
│  │  │                          │                                  │ │
│  │  │                          │  ┌─────────────────────────────┐ │ │
│  │  │                          │  │ DoubtResponse (after ask)   │ │ │
│  │  │                          │  │ ┌─────────────────────────┐ │ │
│  │  │                          │  │ │ Answer Text             │ │ │
│  │  │                          │  │ │ Confidence: 95% (HIGH)  │ │ │
│  │  │                          │  │ │ Processing Time: 2.3s   │ │ │
│  │  │                          │  │ │ [Play Audio] [Copy]     │ │ │
│  │  │                          │  │ │ [Sources] (expandable)  │ │ │
│  │  │                          │  │ └─────────────────────────┘ │ │
│  │  │                          │  └─────────────────────────────┘ │ │
│  │  │                          │                                  │ │
│  │  │                          │  ┌─────────────────────────────┐ │ │
│  │  │                          │  │ ChatHistory (idle state)    │ │ │
│  │  │                          │  │ ┌─────────────────────────┐ │ │
│  │  │                          │  │ │ Q1: How does...?        │ │ │
│  │  │                          │  │ │ A1: The answer is...    │ │ │
│  │  │                          │  │ │ Sources: [02:15] x 3    │ │ │
│  │  │                          │  │ │ ───────────────────────┤ │ │
│  │  │                          │  │ │ Q2: What is...?        │ │ │
│  │  │                          │  │ │ A2: It's...             │ │ │
│  │  │                          │  │ │ Sources: [05:30] x 2    │ │ │
│  │  │                          │  │ └─────────────────────────┘ │ │
│  │  │                          │  └─────────────────────────────┘ │ │
│  │  │                          │                                  │ │
│  │  └──────────────────────────┴──────────────────────────────────┘ │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                            ↑                                         │
│                            │ (Component State)                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Logic & State Layer                           │ │
│  │                                                                  │ │
│  │  ┌──────────────┬─────────────┬──────────────┬──────────────┐   │ │
│  │  │ useAudio     │ useToast    │ useMedia     │ useLocal     │   │ │
│  │  │ Recorder     │ Notificatn  │ Recording    │ Storage      │   │ │
│  │  │              │             │ Playback     │              │   │ │
│  │  └──────────────┴─────────────┴──────────────┴──────────────┘   │ │
│  │                            ↑                                     │ │
│  │                            │                                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                            ↑                                         │
│                            │ (API Calls)                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   Services & API Layer                           │ │
│  │                                                                  │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │                    Axios Client (api.js)                   │ │ │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │ │
│  │  │  │ Base URL: http://localhost:8000                      │  │ │ │
│  │  │  │ Timeout: 30 seconds                                  │  │ │ │
│  │  │  │ Response Interceptor: Error logging                  │  │ │ │
│  │  │  │ Request Headers: Content-Type, etc                   │  │ │ │
│  │  │  └──────────────────────────────────────────────────────┘  │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  │                            ↓                                     │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │                 Video Service (videoService.js)            │ │ │
│  │  │                                                            │ │ │
│  │  │  uploadVideo(url)           → POST /api/videos/upload    │ │ │
│  │  │  getVideoStatus(id)         → GET  /api/videos/{id}/stat │ │ │
│  │  │  getVideoDetails(id)        → GET  /api/videos/{id}      │ │ │
│  │  │  getVideoSegments(id)       → GET  /api/videos/{id}/seg  │ │ │
│  │  │  askQuestion(id, q, ctx)    → POST /api/doubts/ask      │ │ │
│  │  │  getChatHistory(id, l, o)   → GET  /api/videos/{id}/ch  │ │ │
│  │  │  searchContent(id, q, k)    → POST /api/search          │ │ │
│  │  │  checkHealth()              → GET  /api/health          │ │ │
│  │  │                                                            │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  │                            ↓                                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
                                    │ (HTTPS)
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ↓                                       ↓
        ┌──────────────┐                        ┌──────────────┐
        │              │                        │              │
        │   BACKEND    │                        │   BACKEND    │
        │     API      │                        │   SERVICES   │
        │              │                        │              │
        │  Video       │                        │  RAG + LLM   │
        │  Processing  │                        │  Inference   │
        │  Indexing    │                        │  Audio Gen   │
        │  Storage     │                        │              │
        │              │                        │              │
        └──────────────┘                        └──────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    ↓
                        ┌──────────────────────┐
                        │   DATABASES          │
                        │                      │
                        │  - PostgreSQL        │
                        │  - Vector DB         │
                        │    (FAISS/Pinecone)  │
                        │  - Cache (Redis)     │
                        │                      │
                        └──────────────────────┘
```

---

## Component Dependency Graph

```
                              App
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           ErrorBoundary     Header       Routes
                │             │             │
                │             │      ┌──────┴──────┐
                │             │      │             │
                │             │     Home        VideoPage
                │             │      │             │
                │             │      │      ┌──────┴──────────────┐
                │             │      │      │                    │
                │             │      │   VideoPlayer       Sidebar
                │             │      │      │                    │
                │             │   Upload   Play/Pause       ┌───┴──────┐
                │             │    Form   Seek/Control      │          │
                │             │           Ask Doubt    DoubtCapture  Chat
                │             │                             │      History
                │             │                          Text/Voice
                │             │                          Recording
                │             │                              │
                │             │                        DoubtResponse
                │             │                              │
                │             │                       Answer/Audio
                │             │                       Confidence
                │             │                       Sources
                │             │
            Toast          (shown
            Modal        from any)
```

---

## Data Flow Diagram

```
USER INPUT
    │
    ├─→ Video Upload
    │   ├─→ VideoPlayer uploads URL
    │   ├─→ Validate video URL
    │   └─→ Call videoService.uploadVideo()
    │       ├─→ POST to /api/videos/upload
    │       ├─→ Receive video_id
    │       └─→ Navigate to /video/{videoId}
    │
    └─→ Ask Question
        ├─→ User pauses video (timestamp captured)
        ├─→ DoubtCapture shows on pause
        ├─→ User enters text OR records voice
        ├─→ Validate input
        └─→ Call videoService.askQuestion()
            ├─→ POST to /api/doubts/ask
            ├─→ Send: video_id, question, timestamp, context_window
            ├─→ Backend processes (RAG + LLM)
            └─→ Receive response
                ├─→ Answer text
                ├─→ Confidence score
                ├─→ Processing time
                ├─→ Source segments with timestamps
                ├─→ Audio URL
                └─→ Display in DoubtResponse
                    ├─→ Show answer
                    ├─→ Show confidence with color
                    ├─→ Enable audio playback
                    ├─→ Show expandable sources
                    └─→ Update chat history
```

---

## Page Flow Diagram

```
START
  │
  ├─→ Home Page (/)
  │   │
  │   ├─ Hero Section
  │   │  └─ Displays features summary
  │   │
  │   ├─ Upload Form
  │   │  ├─ Input: Video URL
  │   │  ├─ Button: Upload Video
  │   │  ├─ Validation: Check URL format
  │   │  ├─ Loading: Show spinner
  │   │  └─ Success: Navigate to /video/{videoId}
  │   │
  │   ├─ Features Grid
  │   │  └─ Show 6 key features
  │   │
  │   ├─ How It Works
  │   │  ├─ Step 1: Upload
  │   │  ├─ Step 2: Pause
  │   │  ├─ Step 3: Ask
  │   │  └─ Step 4: Answer
  │   │
  │   └─ Tech Stack
  │      └─ Display technologies used
  │
  └─→ VideoPage (/video/:videoId)
      │
      ├─ Load Video Details
      │  ├─ GET /api/videos/{videoId}
      │  └─ Set video metadata
      │
      ├─ Monitor Processing Status
      │  ├─ GET /api/videos/{videoId}/status
      │  ├─ Poll every 3 seconds
      │  ├─ Show processing overlay
      │  └─ Hide when status === 'completed'
      │
      ├─ Video Section
      │  ├─ Display video player
      │  ├─ Controls (play, pause, seek)
      │  ├─ "Ask Doubt" button → pause video
      │  └─ Capture timestamp on pause
      │
      ├─ Sidebar Section (when paused)
      │  ├─ DoubtCapture component
      │  │  ├─ Text input OR Voice recording
      │  │  ├─ Validate input
      │  │  └─ Submit question
      │  │
      │  └─ After submission:
      │     ├─ Show loading spinner
      │     ├─ Call askQuestion()
      │     └─ Receive response
      │
      ├─ DoubtResponse (after question)
      │  ├─ Display answer text
      │  ├─ Show confidence score
      │  ├─ List sources with timestamps
      │  ├─ Audio playback option
      │  └─ Helpful/feedback buttons
      │
      └─ ChatHistory (when idle)
         ├─ Load getChatHistory()
         ├─ Display all previous Q&A
         ├─ Show timestamps and sources
         └─ User can ask more → loop back
```

---

## State Management Tree

```
App
├─ Router state (current page, params)
│  └─ /video/:videoId
│
Home Page
├─ uploadForm.url (string)
├─ uploadForm.isLoading (boolean)
├─ uploadForm.error (string)
├─ uploadForm.videoId (string)

VideoPage
├─ videoDetails
│  ├─ video_id
│  ├─ title
│  ├─ duration
│  └─ url
├─ videoProcessingStatus (string: loading, processing, completed)
├─ isVideoReady (boolean)
├─ currentTimestamp (number in seconds)
├─ isPaused (boolean)
├─ currentDoubt
│  ├─ type (text | audio)
│  ├─ content (string | Blob)
│  └─ timestamp
├─ isLoadingResponse (boolean)
├─ currentResponse
│  ├─ question
│  ├─ answer
│  ├─ confidence
│  ├─ sources[]
│  ├─ processingTime
│  └─ audioUrl
├─ chatHistory[]
│  ├─ question
│  ├─ answer
│  ├─ timestamp
│  ├─ confidence
│  └─ sources[]
├─ error (string | null)
└─ showChatHistory (boolean)

VideoPlayer
├─ isPlaying (boolean)
├─ currentTime (number)
├─ duration (number)
├─ showControls (boolean)
└─ controlsTimeout (ref)

DoubtCapture
├─ inputMethod (text | voice)
├─ textInput (string, max 500)
├─ isRecording (boolean)
├─ recordingTime (number)
└─ audioBlob (Blob | null)

DoubtResponse
├─ isPlayingAudio (boolean)
└─ expandedSources[] (expanded source indexes)

Toast
├─ toasts[] (Toast[])
│  ├─ id
│  ├─ message
│  ├─ type
│  ├─ duration
│  └─ action
```

---

## API Request/Response Flow

```
Frontend                          Backend
   │                                 │
   ├─→ POST /api/videos/upload ──────→│
   │   { "video_url": "..." }        │
   │                                 │
   │←─────────────────────────────────┤
   │   { "video_id": "vid_123",       │
   │     "status": "queued" }         │
   │                                 │
   ├─→ GET /api/videos/vid_123/status→│ (poll every 3s)
   │                                 │
   │←─────────────────────────────────┤
   │   { "status": "processing",      │
   │     "progress": 45 }             │
   │                                 │
   │ [repeat until status == 'ready']│
   │                                 │
   ├─→ GET /api/videos/vid_123 ──────→│
   │                                 │
   │←─────────────────────────────────┤
   │   { "video_id": "vid_123",       │
   │     "title": "...",              │
   │     "duration": 1200,            │
   │     "url": "..." }               │
   │                                 │
   ├─→ POST /api/doubts/ask ─────────→│
   │   { "video_id": "vid_123",       │
   │     "question": "How does...?",  │
   │     "timestamp": 120,            │
   │     "context_window": 5 }        │
   │                                 │
   │         [Backend Processing]    │
   │         - Extract context       │
   │         - RAG retrieval          │
   │         - LLM inference          │
   │         - Audio synthesis        │
   │                                 │
   │←─────────────────────────────────┤
   │   { "question": "How does...?",  │
   │     "answer": "The answer...",   │
   │     "confidence": 0.95,          │
   │     "processing_time": 2.3,      │
   │     "sources": [                 │
   │       {                          │
   │         "timestamp": 115,        │
   │         "relevance": 0.98,       │
   │         "text": "..."            │
   │       }                          │
   │     ],                           │
   │     "audio_url": ".../audio.mp3" │
   │   }                              │
   │                                 │
   ├─→ GET /api/videos/.../chat-hist→│
   │                                 │
   │←─────────────────────────────────┤
   │   { "chats": [                   │
   │       { "question": "...",       │
   │         "answer": "...",         │
   │         "timestamp": 120,        │
   │         "sources": [...] },      │
   │       ...                        │
   │     ]                            │
   │   }                              │
   │
```

---

## Real-Time Event Flow

```
User Actions              → Component State  → API Calls  → Backend
────────────────────────────────────────────────────────────────────

User clicks "Upload"      → isLoading=true
Enters video URL          → uploadForm.url="..."
Clicks upload button      → Call uploadVideo()  → POST /api/videos/upload
                                                  ← Receive video_id
                          → Navigate to /video/:videoId

Page refreshes            → Fetch videoDetails()  → GET /api/videos/:videoId
                          → Start polling status  → GET /api/videos/:videoId/status
                          (every 3 seconds)        (returns processing status)
                          → Show overlay until ready
                          → When ready, enable player

User plays video          → setIsPlaying(true)
                          → videoRef.play()
User pauses with button   → videoRef.pause()
                          → Capture currentTime
                          → setIsPaused(true) → Show DoubtCapture

User types question       → setTextInput("...")
                          → Show char counter
User clicks record        → startRecording()
                          → setIsRecording(true) → Show visual indicator
User stops recording      → stopRecording()
                          → setIsRecording(false)
                          → audioBlob captured

User clicks submit        → setIsLoadingResponse(true)
                          → Call askQuestion()   → POST /api/doubts/ask
                                                  (includes timestamp, context)
                                                  ← Receive response
                          → setCurrentResponse(...)
                          → setIsLoadingResponse(false)
                          → Hide DoubtCapture
                          → Show DoubtResponse
                          → Load chatHistory()  → GET /api/videos/.../chat-history
                                                  ← Receive updated chat
                          → setChatHistory(...)

User clicks play audio    → Create Audio object
                          → audio.play()
User clicks pause         → audio.pause()
User clicks source link   → Jump video to timestamp
                          → videoRef.currentTime = timestamp

User wants more Qs        → Go back to user pauses
```

---

## Error Handling Flow

```
API Request
    │
    ├─→ Network Error
    │   └─→ Catch in service layer
    │       ├─→ Log error
    │       ├─→ Extract error message
    │       └─→ Return to component
    │           └─→ Show toast notification
    │               └─→ Display user-friendly message
    │
    ├─→ HTTP Error (4xx, 5xx)
    │   └─→ Catch in interceptor
    │       ├─→ Check status code
    │       ├─→ Handle 401: Redirect to login
    │       ├─→ Handle 409: Conflict message
    │       ├─→ Handle 500: Server error message
    │       └─→ Return error to component
    │
    └─→ Component Error
        └─→ Catch in ErrorBoundary
            ├─→ Display fallback UI
            ├─→ Show error message
            ├─→ Provide recovery options
            │   ├─→ Try Again button
            │   └─→ Go Home button
            └─→ Log to error tracking service
```

---

## This is the complete functional architecture you now have!

All these components, services, hooks, and flows are implemented and ready to work with your backend.

**Architecture Status: ✅ COMPLETE & PRODUCTION-READY**

🚀 Ready to integrate with backend!
