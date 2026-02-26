# System Architecture - Pause AI

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  Video Upload | Chat Interface | Results Display | Navigation   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   BACKEND (FastAPI - Python)                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              API Layer (Routes)                         │   │
│  │  /videos | /doubts | /chat | /search | /health         │   │
│  └─────────────┬──────────────────────────────────────────┘   │
│                │                                                │
│  ┌─────────────▼────────────────────────────────────────────┐  │
│  │           Service Layer (Business Logic)                │  │
│  │                                                          │  │
│  │  ┌──────────────┬──────────────┬──────────────────────┐ │  │
│  │  │   Video      │   Speech     │   Embedding         │ │  │
│  │  │  Processor   │  Processor   │   Service           │ │  │
│  │  │  (OpenCV)    │  (Whisper)   │ (Sentence Trans.)   │ │  │
│  │  └──────────────┴──────────────┴──────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌──────────────┬──────────────┬──────────────────────┐ │  │
│  │  │  Vector DB   │   LLM        │   RAG Pipeline      │ │  │
│  │  │  Service     │   Service    │                     │ │  │
│  │  │(FAISS/Pine)  │(OpenAI/LLaMA)│ Query→Search→Gen   │ │  │
│  │  └──────────────┴──────────────┴──────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐    ┌─────▼──────┐   ┌────▼────────┐
    │ Vector │    │  External  │   │  File      │
    │   DB   │    │   LLM      │   │  Storage   │
    │(FAISS/ │    │  APIs      │   │ (Temp)     │
    │Pinecone)    │(OpenAI/    │   │            │
    │        │    │ Hugging F.)│   │            │
    └────────┘    └────────────┘   └────────────┘
```

---

## Component Interaction Flow

### Scenario 1: Video Processing Pipeline

```
Step 1: User uploads video link/file
   ↓
Step 2: Backend receives video_id, initiates processing queue
   ↓
Step 3: Video Processor (OpenCV)
   - Download from URL / receive file upload
   - Validate video format/codec
   - Extract metadata (duration, fps, resolution)
   - Save temporary copy
   ↓
Step 4: Audio Extraction
   - Extract audio track from video
   - Convert to WAV format (16kHz, mono)
   - Handle multi-audio streams
   ↓
Step 5: Speech-to-Text (Whisper)
   - Transcribe audio to text
   - Generate timestamps for each segment
   - Support multilingual transcription
   - Return full transcription + segments
   ↓
Step 6: Text Processing
   - Clean text (remove artifacts, normalize)
   - Segment text using sliding window (e.g., 256 tokens, 50% overlap)
   - Create segment metadata (start_time, end_time, segment_id)
   ↓
Step 7: Embedding Generation
   - For each text segment, generate embedding vector
   - Use Sentence Transformers (all-MiniLM-L6-v2 or similar)
   - Store embeddings with segment metadata
   ↓
Step 8: Vector DB Storage
   - Insert embeddings into FAISS/Pinecone
   - Create index for fast similarity search
   - Store mapping: embedding_id → segment_id → timestamp
   ↓
Step 9: Cleanup
   - Delete temporary video files
   - Update video status to "completed"
   - Notify frontend: processing complete
```

### Scenario 2: Question/Doubt Resolution

```
Step 1: User asks question via chat interface
   ↓
Step 2: Backend receives question + video_id
   ↓
Step 3: Question Embedding
   - Convert question to embedding vector
   - Use same model as content embeddings
   ↓
Step 4: Vector Similarity Search (RAG Retrieval)
   - Query FAISS/Pinecone with question embedding
   - Retrieve top-k similar content segments (default k=5)
   - Score based on cosine similarity
   ↓
Step 5: Context Preparation
   - Arrange retrieved segments in chronological order
   - Include segment timestamps
   - Prepare context prompt for LLM
   ↓
Step 6: RAG Prompt Engineering
   - Format: [System Prompt] + [Retrieved Context] + [Question]
   - System Prompt: "You are an expert who answers based on..."
   - Context: Include top-k segment texts with timestamps
   ↓
Step 7: LLM Generation
   - Send formatted prompt to LLM (OpenAI GPT-4 or similar)
   - Settings: temperature=0.7, max_tokens=500
   - Receive generated answer
   ↓
Step 8: Post-Processing
   - Add source citations (timestamps, segment IDs)
   - Format answer for display (markdown, code blocks, etc.)
   - Calculate confidence score
   ↓
Step 9: Response to Frontend
   - Return answer + confidence + sources + processing_time
   - Display in chat interface
   ↓
Step 10: Cache (Optional)
   - Cache question→answer mapping for repeated questions
   - Use Redis for fast retrieval
```

---

## Module Breakdown

### 1. **Video Processor Module**
```
video_processor.py
├── download_video(url) → video_path
├── validate_video(video_path) → metadata
├── extract_frames(video_path, fps) → frames[]
├── get_video_metadata() → {duration, fps, codec, resolution}
└── cleanup_temp_files()
```

**Dependencies:**
- OpenCV (cv2)
- ffmpeg-python
- requests

---

### 2. **Speech Processor Module**
```
speech_processor.py
├── extract_audio(video_path) → audio_path
├── convert_audio_format(audio_path, target_format) → new_path
├── transcribe_audio(audio_path) → {full_text, segments[]}
│   └── segments: {text, start_time, end_time, confidence}
├── handle_multilingual_audio() → language_code
└── validate_audio_quality()
```

**Dependencies:**
- OpenAI Whisper
- pydub
- numpy

---

### 3. **Embedding Service**
```
embedding_service.py
├── generate_embedding(text) → vector[384]
├── batch_generate_embeddings(texts[]) → vectors[]
├── get_embedding_model() → model_instance
├── embedding_dimension() → 384
└── similarity_score(vec1, vec2) → float
```

**Dependencies:**
- sentence-transformers
- torch
- numpy
- scikit-learn

---

### 4. **Vector DB Service**
```
vector_db_service.py
├── initialize_index(dimension) → index
├── add_embeddings(embeddings[], metadata[]) → result
├── search(query_embedding, k) → [similar_items]
├── update_embedding(embedding_id, new_vector) → result
├── delete_embeddings(embedding_ids[]) → result
└── get_index_stats() → {num_items, dimensions}
```

**Dependencies (FAISS):**
- faiss-cpu
- pickle (for persistence)

**Dependencies (Pinecone):**
- pinecone-client

---

### 5. **LLM Service**
```
llm_service.py
├── generate_answer(prompt, max_tokens) → answer
├── get_model_info() → {name, version, capabilities}
├── set_model_temperature(temp) → result
├── validate_api_key() → bool
└── estimate_token_usage(text) → token_count
```

**Dependencies:**
- openai
- langchain (optional)
- tiktoken

---

### 6. **RAG Pipeline**
```
rag_pipeline.py
├── retrieve_context(question_embedding, k) → documents[]
├── format_prompt(system_prompt, context, question) → prompt_str
├── generate_answer_with_context(question, context) → answer_str
├── rank_results(results, relevance_scores) → ranked_results
└── add_citations(answer, sources) → formatted_answer
```

**Orchestrates:** embedding_service + vector_db_service + llm_service

---

### 7. **Frontend Components**

#### Main Routes
```
App.jsx
├── / → Home.jsx (Landing page)
├── /upload → VideoUpload.jsx (Upload interface)
├── /video/:videoId → VideoPlayer.jsx (Video + Chat)
└── /dashboard → Dashboard.jsx (User's videos)
```

#### Core Components
```
VideoUpload.jsx
├── URL input field
├── File upload drag-drop
├── Progress indicator
└── Processing status

ChatInterface.jsx
├── Message history display
├── Question input field
├── Send button
├── Real-time message updates
└── Timestamp/source display

VideoPlayer.jsx
├── Video player (HLS/MP4)
├── Segment timeline
├── Chat sidebar
└── Sync video position with transcription
```

---

## Data Models

### Video Entity
```python
{
  "video_id": "vid_xxxx",
  "title": "String",
  "description": "String",
  "video_url": "https://...",
  "source_type": "url|file",
  "status": "uploaded|processing|completed|failed",
  "duration": 3600,
  "metadata": {
    "fps": 30,
    "resolution": "1920x1080",
    "codec": "h264"
  },
  "transcription": "Full text...",
  "segment_count": 45,
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "user_id": "user_xxxx"
}
```

### Segment Entity
```python
{
  "segment_id": "seg_xxxx",
  "video_id": "vid_xxxx",
  "text": "Segment text...",
  "start_time": 120,
  "end_time": 180,
  "embedding_id": "emb_xxxx",
  "confidence": 0.98,
  "sequence": 5
}
```

### Chat Message Entity
```python
{
  "message_id": "msg_xxxx",
  "video_id": "vid_xxxx",
  "type": "question|answer",
  "content": "Message text",
  "sources": [
    {
      "segment_id": "seg_xxxx",
      "timestamp": 120,
      "relevance": 0.92
    }
  ],
  "created_at": "ISO timestamp"
}
```

---

## Processing Queue & Async Tasks

```
Celery/APScheduler Configuration
├── Task: process_video_transcription
│   └── Priority: HIGH | Timeout: 5 minutes
├── Task: generate_embeddings
│   └── Priority: HIGH | Timeout: 3 minutes
├── Task: index_to_vector_db
│   └── Priority: MEDIUM | Timeout: 2 minutes
└── Task: cleanup_old_temp_files
    └── Priority: LOW | Timeout: 30 seconds, Cron: daily
```

---

## Error Handling & Resilience

- **Retry Logic:** 3 retries with exponential backoff for failed tasks
- **Circuit Breaker:** For external API calls (OpenAI, Pinecone)
- **Fallback:** Cache previous answers if LLM service unavailable
- **Logging:** Structured logging with correlation IDs
- **Monitoring:** Health check endpoints, metric collection

---

## Security Considerations

- API key management via environment variables
- CORS configuration for frontend domain
- Input validation and sanitization
- Rate limiting per user/IP
- Temporary file cleanup
- No sensitive data in logs

