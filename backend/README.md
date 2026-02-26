# Pause AI - Backend (FastAPI)

## Overview

Backend implementation for Pause AI using FastAPI and Python. Handles video processing, speech transcription, embedding generation, and RAG-based question answering.

---

## Technology Stack

- **Framework:** FastAPI
- **Language:** Python 3.10+
- **Speech Recognition:** Whisper (OpenAI)
- **Computer Vision:** OpenCV
- **Embeddings:** Sentence Transformers
- **Vector DB:** FAISS (dev) / Pinecone (prod)
- **LLM:** OpenAI GPT-3.5-turbo / GPT-4

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration management
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── videos.py           # Video upload/management endpoints
│   │   ├── doubts.py           # Question/doubt endpoints
│   │   └── chat.py             # Chat history endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── video_processor.py          # Video processing (OpenCV)
│   │   ├── speech_processor.py         # Audio & Whisper integration
│   │   ├── embedding_service.py        # Embedding generation
│   │   ├── vector_db_service.py        # Vector DB operations
│   │   ├── llm_service.py              # LLM interaction
│   │   └── rag_pipeline.py             # RAG orchestration
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py          # Pydantic models
│   │   └── database_models.py  # SQLAlchemy models (optional)
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py           # Logging configuration
│   │   └── validators.py       # Input validation
│   │
│   └── middleware/
│       └── error_handler.py    # Global error handling
│
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── main.py                    # Application runner
└── README.md                  # This file
```

---

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Virtual environment
- API keys (OpenAI)

### 2. Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Run Server

```bash
# Via main.py
python main.py

# Or using uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at `http://localhost:8000`

---

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Video Management
- `POST /api/videos/upload` - Upload/link video
- `GET /api/videos/{video_id}` - Get video details
- `GET /api/videos/{video_id}/status` - Get processing status
- `GET /api/videos/{video_id}/segments` - Get video segments

### Doubts/Chat
- `POST /api/doubts/ask` - Ask a question
- `GET /api/videos/{video_id}/chat-history` - Get chat history
- `POST /api/search` - Search video content

---

## Configuration

### Environment Variables

See `config/environment.md` for complete configuration reference.

**Key variables:**
```
OPENAI_API_KEY=sk-...
WHISPER_MODEL=base
VECTOR_DB_TYPE=faiss
CORS_ORIGINS=["http://localhost:3000"]
```

---

## Development Guidelines

### Code Style
```bash
# Format code
black app/

# Lint code  
flake8 app/

# Type checking
mypy app/
```

### Testing
```bash
# Run tests
pytest

# With coverage
pytest --cov=app
```

### Logging
```python
from app.utils.logger import get_logger

logger = get_logger(__name__)
logger.info("Message")
```

---

## Service Modules

### VideoProcessor
Handles video download, validation, and frame extraction using OpenCV.

### SpeechProcessor
Extracts audio and transcribes using Whisper.

### EmbeddingService
Generates embeddings using Sentence Transformers.

### VectorDBService
Manages vector database operations (FAISS/Pinecone).

### LLMService
Interfaces with OpenAI GPT models.

### RAGPipeline
Orchestrates retrieval-augmented generation for question answering.

---

## Performance Tips

- Use FAISS for development (in-memory)
- Switch to Pinecone for production
- Enable caching for frequent queries
- Batch process embeddings
- Optimize chunk size for your use case

---

## Troubleshooting

**Port already in use:**
```bash
lsof -i :8000
kill -9 <PID>
```

**CORS errors:**
- Check `.env` CORS_ORIGINS matches frontend URL

**Out of memory:**
- Reduce FAISS index size
- Use Pinecone instead of local FAISS

---

## Next Steps

1. Implement route handlers
2. Create service implementations
3. Add database models
4. Write unit tests
5. Add API documentation

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Whisper Docs](https://github.com/openai/whisper)
- [OpenCV Docs](https://docs.opencv.org/)
- [FAISS Docs](https://github.com/facebookresearch/faiss)

---

## Contributing

- Follow code style guidelines
- Write tests for new features
- Update documentation
- Create pull requests

