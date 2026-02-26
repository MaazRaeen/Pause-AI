# Database Schema & Data Models - Pause AI

## Overview

Pause AI uses a hybrid data storage approach:
- **SQL Database** (optional): Store metadata, user data, chat history
- **Vector Database**: Store embeddings and enable similarity search
- **File Storage**: Store videos, audio, and temporary files

---

## Entity Relationship Diagram

```
User
├─ id (PK)
├─ email
├─ created_at
└─ videos[]

Video
├─ id (PK)
├─ user_id (FK)
├─ title
├─ description
├─ video_url
├─ duration
├─ status
├─ metadata (JSON)
├─ created_at
└─ segments[]

Segment
├─ id (PK)
├─ video_id (FK)
├─ text
├─ start_time
├─ end_time
├─ embedding_id
├─ sequence
└─ confidence

ChatMessage
├─ id (PK)
├─ video_id (FK)
├─ type (question|answer)
├─ content
├─ sources (JSON)
└─ created_at

Embedding (Vector DB)
├─ id (PK)
├─ video_id
├─ segment_id
├─ vector[384]
├─ metadata (JSON)
└─ created_at
```

---

## Data Model Schemas (Pydantic)

### User Schema
```python
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:00:00Z"
}
```

### Video Schema
```python
{
  "video_id": "vid_12345",
  "user_id": "user_5678",
  "title": "Machine Learning Basics",
  "description": "Introduction to machine learning concepts",
  "video_url": "https://example.com/video.mp4",
  "source_type": "url",  # "url" or "file"
  "status": "processing",  # "uploaded" | "processing" | "completed" | "failed"
  "duration_seconds": 3600,
  "file_size_bytes": 524288000,
  "metadata": {
    "fps": 30,
    "resolution": "1920x1080",
    "codec": "h264",
    "audio_codec": "aac",
    "language": "en",
    "upload_source": "web"
  },
  "quality_score": 0.95,
  "processing_errors": [],
  "segment_count": 45,
  "total_embedding_tokens": 12500,
  "vector_db_indexed": true,
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:15:00Z",
  "processing_started_at": "2026-02-26T10:00:30Z",
  "processing_completed_at": "2026-02-26T10:15:00Z"
}
```

### Segment Schema
```python
{
  "segment_id": "seg_001",
  "video_id": "vid_12345",
  "text": "Today we'll learn about neural networks and deep learning",
  "start_time": 120,  # seconds
  "end_time": 180,
  "duration": 60,
  "word_count": 15,
  "token_count": 22,
  "embedding_id": "emb_vid_12345_001",
  "sequence_number": 1,
  "confidence": 0.98,
  "language": "en",
  "entities": ["neural networks", "deep learning"],  # Optional NER
  "created_at": "2026-02-26T10:00:00Z"
}
```

### Chat Message Schema
```python
{
  "message_id": "msg_001",
  "video_id": "vid_12345",
  "user_id": "user_5678",
  "type": "question",  # or "answer"
  "content": "What are neural networks?",
  "role": "user",  # or "assistant"
  "embedding_id": "emb_question_001",
  "tokens_used": 8,
  "sources": [
    {
      "segment_id": "seg_012",
      "timestamp": 120,
      "text": "Neural networks are...",
      "relevance_score": 0.92,
      "distance": 0.08
    }
  ],
  "metadata": {
    "model_used": "gpt-3.5-turbo",
    "temperature": 0.7,
    "processing_time_ms": 1250,
    "tokens_used": {
      "prompt": 150,
      "completion": 80,
      "total": 230
    }
  },
  "created_at": "2026-02-26T10:05:00Z"
}
```

### Embedding Schema (Vector DB)
```python
{
  "embedding_id": "emb_vid_12345_001",
  "video_id": "vid_12345",
  "segment_id": "seg_001",
  "vector": [0.123, -0.456, 0.789, ...],  # 384 dimensions
  "text_preview": "Today we'll learn about...",
  "metadata": {
    "model_used": "all-MiniLM-L6-v2",
    "start_time": 120,
    "end_time": 180,
    "sequence": 1,
    "language": "en"
  },
  "created_at": "2026-02-26T10:00:00Z"
}
```

---

## Database Table Definitions (SQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  source_type VARCHAR(50),  -- 'url' or 'file'
  status VARCHAR(50) DEFAULT 'uploaded',  -- 'uploaded', 'processing', 'completed', 'failed'
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  metadata JSONB,
  processing_errors JSONB DEFAULT '[]',
  segment_count INTEGER DEFAULT 0,
  quality_score FLOAT,
  vector_db_indexed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at);
```

### Segments Table
```sql
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  text TEXT NOT NULL,
  start_time INTEGER NOT NULL,  -- seconds
  end_time INTEGER NOT NULL,
  duration INTEGER,
  word_count INTEGER,
  token_count INTEGER,
  embedding_id VARCHAR(255),
  sequence_number INTEGER NOT NULL,
  confidence FLOAT,
  language VARCHAR(10),
  entities TEXT[],  -- Array of entity strings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX idx_segments_video_id ON segments(video_id);
CREATE INDEX idx_segments_sequence ON segments(video_id, sequence_number);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'question' or 'answer'
  role VARCHAR(50) NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  embedding_id VARCHAR(255),
  tokens_used INTEGER,
  sources JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_video_id ON chat_messages(video_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### Events Table (for analytics)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  video_id UUID,
  event_type VARCHAR(100) NOT NULL,  -- 'video_upload', 'question_asked', etc.
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);
```

---

## Vector Database Schema (FAISS)

### FAISS Index Structure
```
Index Type: IVF (Inverted File Index)
├─ Indexing: 64 centroids (IVF64)
├─ Quantization: PQ (Product Quantization) with 8-byte codes
├─ Metric: L2 (Euclidean) or COSINE
├─ Dimension: 384 (sentence-transformers embedding dimension)
└─ Estimated capacity: 10M vectors (adjustable)

Vector Storage:
├─ Index file: faiss_index
├─ ID mapping: id_mapping.pkl (maps internal IDs to segment_id)
└─ Metadata: metadata.json (stores segment info)
```

### FAISS Query Performance
```
- Vector count: 100K
- Search time: ~50ms (top-5)
- Memory: ~400MB

- Vector count: 1M
- Search time: ~150ms (top-5)
- Memory: ~4GB

- Vector count: 10M
- Search time: ~500ms (top-5)
- Memory: ~40GB (approximate)
```

---

## Pinecone Index Configuration

### Pinecone Index Schema
```json
{
  "index_name": "pauseai-dev",
  "dimension": 384,
  "metric": "cosine",
  "pod_type": "p1",
  "environment": "gcp-starter",
  "metadata_config": {
    "indexed": ["video_id", "segment_id", "timestamp"]
  },
  "replicas": 1,
  "pods": 1
}
```

### Vector Metadata (Pinecone)
```python
{
  "id": "emb_vid_12345_001",
  "values": [0.123, -0.456, ...],  # 384-dim vector
  "metadata": {
    "video_id": "vid_12345",
    "segment_id": "seg_001",
    "timestamp": 120,
    "text": "Neural networks are...",
    "language": "en",
    "source": "segment"
  }
}
```

---

## Data Retention Policies

### User Data
- **Retention:** Until account deletion
- **Backup:** Daily incremental

### Video Data
- **Retention:** 90 days (configurable)
- **Purge:** Scheduled job runs weekly
- **Archive:** Optional S3 backup before deletion

### Embeddings
- **Retention:** Matches parent video
- **Recompute:** Possible from segment text
- **Storage:** ~5KB per vector

### Chat History
- **Retention:** 30 days (configurable)
- **Export:** User can download conversation
- **Anonymize:** Remove user PII before retention period

---

## Indexing Strategy

### Creating Indices
```python
# Video lookup
db.videos.create_index([("user_id", 1), ("created_at", -1)])

# Chat message search
db.chat_messages.create_index([("video_id", 1), ("created_at", -1)])

# Vector DB (FAISS)
# IVF index with centroids for fast search
```

### Query Optimization
```python
# Use indexed queries
videos = db.videos.find(
    {"user_id": user_id, "status": "completed"},
    projection={"_id": 1, "title": 1}
).sort("created_at", -1)

# Avoid full table scans
# Use vector DB for similarity, not full-text search
```

---

## Backup & Recovery

### Backup Strategy
```bash
# Database backup (daily)
pg_dump pauseai_db > backups/pauseai_$(date +%Y%m%d).sql

# Vector index backup (daily)
cp data/faiss_index backups/

# S3 upload
aws s3 cp backups/ s3://pauseai-backups/
```

### Recovery Procedure
```bash
# Restore database
psql pauseai_db < backups/pauseai_20260226.sql

# Restore FAISS index
cp backups/faiss_index data/

# Verify integrity
python verify_index.py
```

---

## Performance Considerations

### Scaling
- **Videos:** Partition by user_id for horizontal scaling
- **Embeddings:** Use FAISS sharding or Pinecone namespaces per user
- **Chat:** Archive old messages to cold storage

### Query Optimization
- Index frequently queried fields
- Use connection pooling
- Cache common queries (Redis)
- Batch operations where possible

### Storage Optimization
- Compress old video metadata
- Archive chat history monthly
- Cleanup temporary files daily
- Use S3 for large video files

