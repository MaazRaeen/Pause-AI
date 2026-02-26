# API Documentation - Pause AI

## Base URL
```
Development: http://localhost:8000/api
Production: https://api.pauseai.com/api
```

---

## Authentication
*To be implemented: JWT tokens*

---

## Endpoints Overview

### Video Management

#### 1. Upload/Link Video
**Endpoint:** `POST /videos/upload`

**Purpose:** Accept video link or file upload

**Request:**
```json
{
  "video_source": "url",  // "url" or "file"
  "video_url": "https://example.com/video.mp4",
  "title": "Lecture on Machine Learning",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "video_id": "vid_12345",
  "status": "processing",
  "message": "Video uploaded successfully",
  "processing_eta": "120 seconds"
}
```

---

#### 2. Get Video Status
**Endpoint:** `GET /videos/{video_id}/status`

**Response:**
```json
{
  "video_id": "vid_12345",
  "status": "completed",
  "progress": 100,
  "transcription_ready": true,
  "created_at": "2026-02-26T10:00:00Z"
}
```

---

#### 3. Get Video Details
**Endpoint:** `GET /videos/{video_id}`

**Response:**
```json
{
  "video_id": "vid_12345",
  "title": "Lecture on Machine Learning",
  "duration": 3600,
  "transcription": "Full transcribed text...",
  "segments": [
    {
      "start_time": 0,
      "end_time": 120,
      "text": "Introduction to machine learning..."
    }
  ]
}
```

---

### Doubt Resolution / Chat

#### 4. Ask Question (Chat)
**Endpoint:** `POST /doubts/ask`

**Request:**
```json
{
  "video_id": "vid_12345",
  "question": "What is machine learning?",
  "context_window": 5  // number of similar chunks to retrieve
}
```

**Response:**
```json
{
  "question_id": "q_67890",
  "question": "What is machine learning?",
  "answer": "Machine learning is a subset of artificial intelligence...",
  "confidence": 0.95,
  "sources": [
    {
      "segment_id": "seg_001",
      "timestamp": "02:30",
      "relevant_text": "..."
    }
  ],
  "processing_time_ms": 1250
}
```

---

#### 5. Get Chat History
**Endpoint:** `GET /videos/{video_id}/chat-history`

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "video_id": "vid_12345",
  "messages": [
    {
      "id": "q_67890",
      "type": "question",
      "content": "What is machine learning?",
      "timestamp": "2026-02-26T10:05:00Z"
    },
    {
      "id": "a_67890",
      "type": "answer",
      "content": "Machine learning is...",
      "timestamp": "2026-02-26T10:05:02Z"
    }
  ],
  "total_count": 25
}
```

---

#### 6. Get Video Segments
**Endpoint:** `GET /videos/{video_id}/segments`

**Purpose:** Get all transcribed segments with timestamps

**Response:**
```json
{
  "video_id": "vid_12345",
  "total_segments": 45,
  "segments": [
    {
      "segment_id": "seg_001",
      "start_time": 0,
      "end_time": 60,
      "text": "Today we'll learn about...",
      "embedding_id": "emb_001"
    }
  ]
}
```

---

### Embeddings & Search

#### 7. Search Content
**Endpoint:** `POST /search`

**Request:**
```json
{
  "video_id": "vid_12345",
  "query": "neural networks",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "neural networks",
  "results": [
    {
      "segment_id": "seg_012",
      "text": "Neural networks are inspired by...",
      "similarity_score": 0.92,
      "timestamp": "05:30"
    }
  ]
}
```

---

### Health & Utility

#### 8. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-26T10:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {},
  "timestamp": "2026-02-26T10:00:00Z"
}
```

### Common Error Codes
- `INVALID_INPUT` - 400
- `VIDEO_NOT_FOUND` - 404
- `PROCESSING_FAILED` - 500
- `RATE_LIMITED` - 429
- `UNAUTHORIZED` - 401

---

## Rate Limiting

- **Free Tier:** 10 requests/minute
- **Premium Tier:** 100 requests/minute
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

Endpoints returning lists use offset-based pagination:

```
?offset=0&limit=20
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Response Time SLAs

- Video upload processing: < 5 minutes
- Question answering: < 2 seconds
- Segment retrieval: < 500ms

