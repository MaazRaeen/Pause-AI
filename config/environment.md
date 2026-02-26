# Environment Configuration - Pause AI

## Environment Files Overview

Each component (frontend, backend) has its own `.env` file for configuration.

---

## Backend Environment (.env)

**Location:** `backend/.env`

```bash
# ============================================
# PAUSE AI - Backend Configuration
# ============================================

# ---- Core Application Settings ----
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/app.log
ENVIRONMENT=development  # development, staging, production

# ---- OpenAI & Whisper Configuration ----
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
# Options: gpt-3.5-turbo, gpt-4, gpt-4-turbo
WHISPER_MODEL=base
# Options: tiny (39M), base (74M), small (244M), medium (769M), large (1550M)

# ---- Vector Database Configuration ----
# Choose ONE: faiss or pinecone
VECTOR_DB_TYPE=faiss

# FAISS Configuration (local development)
FAISS_INDEX_PATH=./data/faiss_index
FAISS_PERSIST_TO_DISK=True

# Pinecone Configuration (cloud - uncomment when using)
# PINECONE_API_KEY=your-pinecone-api-key
# PINECONE_ENVIRONMENT=gcp-starter
# PINECONE_INDEX_NAME=pauseai

# ---- File Storage Configuration ----
TEMP_STORAGE_PATH=./temp
PROCESSING_DATA_PATH=./data
MAX_VIDEO_SIZE_MB=500
MAX_UPLOAD_TIMEOUT_SECONDS=300
ALLOWED_VIDEO_FORMATS=mp4,avi,mov,mkv,webm

# ---- Database Configuration ----
# PostgreSQL (optional - for metadata storage)
# DATABASE_URL=postgresql://user:password@localhost:5432/pauseai

# Redis (optional - for caching)
# REDIS_URL=redis://localhost:6379
# REDIS_CACHE_TTL=3600

# ---- CORS Configuration ----
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:8000"]
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE"]
CORS_ALLOW_HEADERS=["*"]

# ---- Embedding Configuration ----
EMBEDDING_MODEL=all-MiniLM-L6-v2
# Options: all-MiniLM-L6-v2 (22M, 384-dim)
#          all-mpnet-base-v2 (110M, 768-dim)
#          paraphrase-MiniLM-L6-v2 (22M, 384-dim)

# ---- RAG Pipeline Configuration ----
RAG_TOP_K_RETRIEVAL=5
RAG_SIMILARITY_THRESHOLD=0.6
RAG_CHUNK_SIZE=256
RAG_CHUNK_OVERLAP=0.5
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=500

# ---- Audio Processing ----
AUDIO_SAMPLE_RATE=16000
AUDIO_MONO=True
WHISPER_LANGUAGE=auto  # or specific code: en, es, fr, etc.

# ---- Chunking Strategy ----
TEXT_CHUNK_SIZE=256  # tokens
TEXT_CHUNK_OVERLAP_RATIO=0.5
MIN_CHUNK_SIZE=50
MAX_CHUNK_SIZE=512

# ---- Cache Configuration ----
ENABLE_CACHING=True
CACHE_BACKEND=memory  # or redis
CACHE_TTL_SECONDS=3600

# ---- API Keys (External Services) ----
# Add other third-party API keys here as needed

# ---- Feature Flags ----
ENABLE_VIDEO_ANALYSIS=True
ENABLE_SCENE_DETECTION=False
ENABLE_QUERY_EXPANSION=False
ENABLE_RESULT_RERANKING=False

# ---- Development Settings (DEBUG MODE) ----
SHOW_QUERY_LOGS=False
SHOW_EMBEDDING_LOGS=False
SHOW_RAG_STEPS=False

# ---- Job Queue Configuration ----
# For async task processing (Celery)
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379
```

### Backend .env.example
**Location:** `backend/.env.example` (for git tracking)

Include the same template above with placeholder values to help team members setup their own `.env`.

---

## Frontend Environment (.env.local)

**Location:** `frontend/.env.local`

```bash
# ============================================
# PAUSE AI - Frontend Configuration
# ============================================

# ---- API Configuration ----
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000

# ---- Environment Settings ----
REACT_APP_ENV=development  # development, staging, production
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug  # debug, info, warn, error

# ---- Feature Flags ----
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CACHING=true
REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_CHAT_HISTORY_EXPORT=true

# ---- UI Configuration ----
REACT_APP_ITEMS_PER_PAGE=20
REACT_APP_ANIMATION_DURATION=300
REACT_APP_CHAT_MAX_HISTORY=50

# ---- Video Configuration ----
REACT_APP_MAX_VIDEO_UPLOAD_SIZE_MB=500
REACT_APP_VIDEO_PLAYER_AUTOPLAY=false
REACT_APP_VIDEO_PLAYER_CONTROLS=true
REACT_APP_VIDEO_PLAYBACK_RATE=1

# ---- Chat Configuration ----
REACT_APP_CHAT_SEND_BUTTON_TEXT=Send Question
REACT_APP_CHAT_PLACEHOLDER=Ask a question about the video...
REACT_APP_CHAT_AUTO_SCROLL=true

# Analytics (optional)
# REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# REACT_APP_SENTRY_DSN=https://...

# ---- CDN Configuration (optional) ----
# REACT_APP_CDN_URL=https://cdn.pauseai.com

# ---- Build Configuration ----
GENERATE_SOURCEMAP=true
```

### Frontend .env.example
**Location:** `frontend/.env.example`

```bash
# Copy this file to .env.local and fill in your values
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_ENABLE_CACHING=true
REACT_APP_MAX_VIDEO_UPLOAD_SIZE_MB=500
```

---

## Configuration Files

### backend/config.py

The Python code should read and validate these environment variables:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-3.5-turbo"
    whisper_model: str = "base"
    
    # Vector DB
    vector_db_type: str = "faiss"  # or "pinecone"
    faiss_index_path: str = "./data/faiss_index"
    
    # Pinecone (if using)
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    pinecone_index_name: str = ""
    
    # File storage
    temp_storage_path: str = "./temp"
    processing_data_path: str = "./data"
    max_video_size_mb: int = 500
    
    # CORS
    cors_origins: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

---

## Environment Setup Checklist

### Backend Setup
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Fill in `OPENAI_API_KEY`
- [ ] Choose Vector DB (FAISS for dev, Pinecone for prod)
- [ ] Set `CORS_ORIGINS` to match frontend URL
- [ ] Configure paths for temp storage
- [ ] Verify Python can read .env file

### Frontend Setup
- [ ] Copy `frontend/.env.example` to `frontend/.env.local`
- [ ] Set `REACT_APP_API_URL` to backend address
- [ ] Configure feature flags as needed
- [ ] Verify Node can read env variables

### Production Setup
- [ ] Use environment-specific .env files
- [ ] Load secrets from secure vault (AWS Secrets Manager, Azure Key Vault)
- [ ] Never commit .env files to git
- [ ] Use different keys for production
- [ ] Enable all feature flags for production
- [ ] Disable DEBUG mode
- [ ] Set appropriate timeouts and limits

---

## CI/CD Environment Variables

For GitHub Actions or other CI systems:

```yaml
# Example GitHub Actions secrets
OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}
DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Local Development Tips

1. **Create local .env file first:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Customize for your machine:**
   ```bash
   # Use local paths
   TEMP_STORAGE_PATH=~/pauseai/temp
   PROCESSING_DATA_PATH=~/pauseai/data
   ```

3. **Use different keys for testing:**
   - Don't use your main OpenAI API key for development
   - Create a separate organization/project for testing

4. **Keep secrets secure:**
   - Never commit .env files
   - Use `.gitignore` to exclude them
   - Share .env.example instead

5. **Hot reload configuration:**
   ```python
   # Use watchdog to reload config on .env changes
   # Or restart server after changing .env
   ```

---

## Production Considerations

- Use environment variables from platform (Heroku, AWS, Azure)
- Implement secret rotation
- Use separate keys for each environment
- Add audit logging for configuration changes
- Monitor for exposed API keys
- Use configuration management tools (Terraform, Helm)

