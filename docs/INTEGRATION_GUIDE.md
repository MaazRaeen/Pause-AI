# Pause AI - Implementation Integration Guide

## Complete Workflow Documentation

This guide covers how all components work together in the Pause AI system.

---

## 🔄 Complete Video Processing Workflow

### Step 1: User Uploads Video
**Frontend Action:**
```
User pastes video URL or uploads file
    → Validation (format, size)
    → Display upload progress
    → Send POST /api/videos/upload
```

**Backend Processing:**
```
Receive video_id + url/file
    → Validate input
    → Store metadata in DB
    → Add to processing queue
    → Return video_id + status
```

### Step 2: Video Download & Validation
**VideoProcessor Service:**
```
Download from URL (if URL source)
    → Validate video format (MP4, AVI, MOV, MKV, WebM)
    → Extract metadata (fps, resolution, duration, codec)
    → Store temporary file
    → Return video metadata
```

**Example Output:**
```json
{
  "duration": 3600,
  "fps": 30,
  "resolution": "1920x1080",
  "codec": "h264",
  "audio_codec": "aac"
}
```

### Step 3: Audio Extraction
**SpeechProcessor Service:**
```
Extract audio track from video file
    → Convert to standard format (WAV, 16kHz, mono)
    → Handle multiple audio streams
    → Validate audio quality
    → Save extracted audio
    → Return audio file path
```

### Step 4: Speech Recognition (Whisper)
**SpeechProcessor → Whisper API:**
```
Send audio file to OpenAI Whisper
    → Receive full transcription + timestamps
    → Return:
       - Full transcript text
       - Language detected
       - Segments with timings
       - Confidence scores
```

**Example Segment Response:**
```json
{
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 5.5,
      "text": "Today we'll learn about machine learning."
    },
    {
      "id": 1,
      "start": 5.5,
      "end": 12.3,
      "text": "Machine learning is a subset of artificial intelligence."
    }
  ],
  "language": "en"
}
```

### Step 5: Text Chunking & Processing
**RAG Pipeline:**
```
For each transcribed segment:
    1. Clean text (remove artifacts)
    2. Split using sliding window
       - Chunk size: 256 tokens
       - Overlap: 128 tokens (50%)
    3. Create chunk metadata:
       - Segment ID, timestamp
       - Word count, token count
    4. Prepare for embedding

Result: List of (text, metadata) pairs
```

### Step 6: Embedding Generation
**EmbeddingService:**
```
For each text chunk:
    1. Encode using Sentence Transformers
       Model: all-MiniLM-L6-v2
       Output: 384-dimensional vector
    2. Normalize embedding
    3. Create metadata:
       - video_id, segment_id
       - start_time, end_time
       - text preview
    4. Add to batch

Batch process 100+ embeddings at once
```

### Step 7: Vector DB Indexing
**VectorDBService:**
```
For FAISS (development):
    1. Create IVF index (if not exists)
    2. Add embeddings to index
    3. Build index (quantization)
    4. Save index to disk
    5. Save ID mapping (pickle)

For Pinecone (production):
    1. Connect to Pinecone index
    2. Upsert embeddings with metadata
    3. Wait for indexing complete
    4. Verify insertion count
```

### Step 8: Processing Complete
**Status Update:**
```
Database Update:
    - video.status = "completed"
    - video.segment_count = 45
    - video.vector_db_indexed = true
    - video.processing_completed_at = now()

Frontend Notification:
    - Poll /api/videos/{video_id}/status
    - Receive status: "completed"
    - Enable chat interface
```

---

## 💬 Complete Question Answering Workflow

### Step 1: User Asks Question
**Frontend:**
```
User types question in chat input
    → Send POST /api/doubts/ask
    → Payload:
       {
         "video_id": "vid_12345",
         "question": "What is machine learning?"
       }
    → Show loading spinner
    → Display question in chat
```

### Step 2: Question Embedding
**Backend - EmbeddingService:**
```
Receive question text
    1. Tokenize question
    2. Encode using same model as content
    3. Generate 384-dimensional vector
    4. Normalize embedding

Output: question_embedding (384-dim vector)
```

### Step 3: Context Retrieval (Vector Search)
**Backend - VectorDBService:**
```
Search with question_embedding:
    1. Query vector DB with top_k=5
    2. For FAISS:
       - Use IVF index for fast search
       - Calculate L2 distance
       - Sort by distance
    3. For Pinecone:
       - Query with cosine similarity
       - Apply video_id filter
       - Return top matches with scores
    
Output: [
    {segment_id, text, timestamp, similarity_score},
    {segment_id, text, timestamp, similarity_score},
    ...  (5 results)
]
```

### Step 4: Context Formatting
**RAG Pipeline:**
```
Received: 5 retrieved segments
Processing:
    1. Sort by timestamp (chronological)
    2. Create context string:
       "[00:30] Segment 1 text..."
       "[02:45] Segment 2 text..."
       "[05:12] Segment 3 text..."
       "[07:20] Segment 4 text..."
       "[10:15] Segment 5 text..."
    3. Add system prompt
    4. Format full prompt for LLM

Final Prompt:
    System: "You are an expert answering questions..."
    Context: "[Retrieved content with timestamps]"
    Question: "What is machine learning?"
```

### Step 5: LLM Generation
**LLMService (OpenAI):**
```
Send to GPT-3.5-Turbo:
    1. API Call to OpenAI
    2. Parameters:
       - temperature: 0.7 (balanced)
       - max_tokens: 500
       - model: gpt-3.5-turbo
    3. Receive response
    4. Calculate tokens used
    
Output Answer:
    "Machine learning is a subset of artificial intelligence 
     that enables systems to learn from data... [00:30-02:45]"
```

### Step 6: Post-Processing & Citations
**RAG Pipeline:**
```
Generated answer received:
    1. Add source citations:
       - Extract segment references
       - Convert to timestamps
       - Add inline citations
    2. Calculate confidence:
       - Average similarity of sources
       - Confidence = avg_similarity
    3. Format for display:
       - Parse markdown
       - Clean up text
       - Add timestamps

Response to Frontend:
{
    "question_id": "q_001",
    "question": "What is machine learning?",
    "answer": "Machine learning is...",
    "confidence": 0.92,
    "sources": [
        {
            "segment_id": "seg_001",
            "timestamp": "00:30",
            "text": "..."
        }
    ],
    "processing_time_ms": 1250
}
```

### Step 7: Display Answer
**Frontend:**
```
Receive API response:
    1. Hide loading spinner
    2. Add answer to chat
    3. Display confidence score
    4. Show sources with timestamps
    5. Enable click-to-video-time
    6. Save to local storage
    7. Add to chat history
```

---

## 🔗 Component Integration Points

### Service Interactions
```
API Routes
    ├─ /video/upload
    │   └─ VideoProcessor → SpeechProcessor → EmbeddingService 
    │       → VectorDBService
    │
    ├─ /doubts/ask
    │   └─ RAG Pipeline
    │       ├─ EmbeddingService (embed question)
    │       ├─ VectorDBService (retrieve context)
    │       ├─ LLMService (generate answer)
    │       └─ Format response
    │
    └─ /search
        └─ EmbeddingService → VectorDBService → Return results
```

### Data Flow Connections
```
User Input (Frontend)
    ↓
API Request (FastAPI)
    ↓
Service Layer (Business Logic)
    ├─ AI Services (Whisper, Torch, etc.)
    ├─ Database Services
    └─ External APIs (OpenAI, Pinecone)
    ↓
Response (JSON)
    ↓
UI Update (React)
    ↓
User Sees Result (Browser)
```

---

## ⚙️ Configuration Integration

### Environment Dependencies
```
Backend .env:
    OPENAI_API_KEY → Used by LLMService
    WHISPER_MODEL → Controls audio quality
    VECTOR_DB_TYPE → Determines DB choice (FAISS/Pinecone)
    CORS_ORIGINS → Must match Frontend URL
    
Frontend .env:
    REACT_APP_API_URL → Must match Backend URL
    REACT_APP_API_TIMEOUT → Controls request timeout
```

### Service Dependencies
```
EmbeddingService:
    Depends on: SentenceTransformers library
    Uses: all-MiniLM-L6-v2 model
    Output dimension: 384
    
VectorDBService:
    FAISS: Depends on NumPy, local index file
    Pinecone: Depends on API key, cloud connection
    
LLMService:
    Depends on: OpenAI API key
    Model: GPT-3.5-Turbo or GPT-4
    Token pricing: Variable per model
```

---

## 📊 Data Transformation Pipeline

### Video → Segments → Embeddings → Vector DB
```
1. Video File (MPEG4, AVI, etc.)
2. Audio Extraction
   → WAV file (16kHz, mono)
3. Transcription
   → Text segments with timestamps
4. Text Chunking
   → [256 token chunks, 50% overlap]
5. Embedding Generation
   → [384-dim vectors]
6. Vector Indexing
   → FAISS/Pinecone Index
7. Storage
   → Queryable Vector DB
```

### Query → Answer
```
1. User Question (text)
2. Question Embedding
   → [384-dim vector]
3. Vector Similarity Search
   → [Top 5 segments with scores]
4. Context Preparation
   → Formatted text with timestamps
5. LLM Processing
   → Question + Context → Answer
6. Response Formatting
   → Answer + Sources + Confidence
7. Display
   → Chat UI with citations
```

---

## 🧪 Testing Integration

### What to Test at Each Stage
```
1. Video Processing
   ✓ Video download works
   ✓ Metadata extracted correctly
   ✓ Audio quality validated

2. Transcription
   ✓ Whisper returns valid segments
   ✓ Timestamps are accurate
   ✓ Handles multiple languages

3. Embeddings
   ✓ Tokenization correct
   ✓ Vector dimensions: 384
   ✓ Similarity scores reasonable

4. Vector Search
   ✓ FAISS/Pinecone queries work
   ✓ Top-k retrieval accurate
   ✓ Search latency < 200ms

5. RAG Pipeline
   ✓ Retrieved context relevant
   ✓ Answer generation works
   ✓ Citations accurate

6. API Integration
   ✓ Frontend can upload video
   ✓ Backend processes correctly
   ✓ Chat endpoint returns answers

7. UI Flow
   ✓ Upload shows progress
   ✓ Chat sends/receives messages
   ✓ Answers display with sources
```

---

## 🚀 Performance Optimization Points

### Processing Pipeline
```
Parallel Operations:
    - Video download (non-blocking)
    - Audio extraction (can be async)
    - Batch embedding generation
    - Concurrent API calls

Caching Strategies:
    - Cache embeddings (Redis)
    - Cache Q&A pairs for common questions
    - Cache FAISS indices
    - Last 50 chat messages in frontend

Optimization:
    - Chunk size: 256 tokens (tunable)
    - Embedding model: all-MiniLM-L6-v2 (fast)
    - Vector search: IVF indexing
    - LLM calls: Batch when possible
```

### Expected Latencies
```
Total Video Processing (1 hour):
├─ Download: 30-60 sec
├─ Transcription: 120-180 sec
├─ Embedding: 30-45 sec
├─ Indexing: 10-15 sec
└─ Total: 3-5 minutes

Question Answering:
├─ Embedding: 50-100 ms
├─ Vector Search: 50-150 ms
├─ LLM Generation: 1000-2000 ms
└─ Total: 1.2-2.5 seconds
```

---

## 📋 Deployment Integration Checklist

Before production deployment:
- [ ] All API endpoints tested
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Database migrations run
- [ ] API keys secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Frontend/Backend URLs match
- [ ] SSL certificates configured
- [ ] Monitoring/alerting set up

---

## 🔄 Common Integration Issues & Solutions

### API Connection Issues
```
Problem: CORS error
Solution: 
    1. Check backend CORS_ORIGINS in .env
    2. Verify frontend URL matches exactly
    3. Restart backend server

Problem: API not responding
Solution:
    1. Check backend is running
    2. Verify port is correct
    3. Check API_URL in frontend .env
    4. Test with curl: curl http://localhost:8000/api/health
```

### Embedding Issues
```
Problem: Embeddings not saving to vector DB
Solution:
    1. Check FAISS index path is writable
    2. Verify Pinecone credentials if using cloud
    3. Check dimensions match (384)
    4. Verify embeddings are normalized

Problem: Search returning bad results
Solution:
    1. Check similar_score threshold
    2. Verify retrieved segments are relevant
    3. Try few_shot examples for model
    4. Adjust RAG_TOP_K_RETRIEVAL
```

### LLM Issues
```
Problem: "Insufficient quota" error from OpenAI
Solution:
    1. Check API key is active
    2. Check account has credits
    3. Verify API key is not expired
    4. Check rate limits not exceeded

Problem: Answers are hallucinating
Solution:
    1. Add more context (increase TOP_K)
    2. Improve prompt engineering
    3. Lower temperature parameter
    4. Add negative examples
```

---

## 📚 Related Documentation

- **ARCHITECTURE.md** - System design diagrams
- **API_DOCUMENTATION.md** - Endpoint specifications
- **AI_COMPONENTS.md** - Technical details per component
- **DATABASE_SCHEMA.md** - Data models
- **SETUP_GUIDE.md** - Installation steps

