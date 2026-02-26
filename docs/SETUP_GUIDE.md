# Setup Guide - Pause AI

## Prerequisites

- **OS:** macOS, Linux, or Windows (WSL2)
- **Python:** 3.10+ 
- **Node.js:** 18+
- **Git:** Latest version
- **API Keys:** OpenAI (for GPT), Pinecone (optional)

---

## Quick Start Checklist

- [ ] Clone repository and setup git
- [ ] Setup Python environment (virtual env)
- [ ] Install backend dependencies
- [ ] Configure environment variables
- [ ] Setup Node.js and React
- [ ] Install frontend dependencies
- [ ] Run backend server
- [ ] Run frontend dev server
- [ ] Test API connectivity

---

## Backend Setup

### 1. Python Environment

```bash
# Navigate to project root
cd /path/to/Pause\ AI

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. Install Backend Dependencies

```bash
cd backend

# Install all required packages
pip install -r requirements.txt

# Key packages to be installed:
# - FastAPI
# - uvicorn
# - openai
# - whisper
# - opencv-python
# - sentence-transformers
# - faiss-cpu or pinecone-client
# - pydantic
# - python-multipart
```

### 3. Backend Requirements File
**Path:** `backend/requirements.txt`

```
# Web Framework
FastAPI==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6

# AI/ML Components
openai==1.3.0
openai-whisper==20240314
opencv-python==4.8.1.78
sentence-transformers==2.2.2
torch==2.1.2
torch-vision==0.16.2

# Vector Databases
faiss-cpu==1.7.4
pinecone-client==3.0.0

# Data Processing
numpy==1.24.3
pandas==2.0.3
pydantic==2.5.0
python-dotenv==1.0.0

# Utilities
requests==2.31.0
pydub==0.25.1
asyncio==3.4.3
pydantic-settings==2.1.0

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.1
flake8==6.1.0
```

### 4. Configure Environment Variables

**Path:** `backend/.env`

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
WHISPER_MODEL=base  # options: tiny, base, small, medium, large

# Vector Database Configuration
# FAISS (local)
VECTOR_DB_TYPE=faiss
FAISS_INDEX_PATH=./data/faiss_index

# Pinecone (cloud - uncomment to use)
# VECTOR_DB_TYPE=pinecone
# PINECONE_API_KEY=your-key
# PINECONE_ENVIRONMENT=gcp-starter
# PINECONE_INDEX_NAME=pauseai

# Backend Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
MAX_VIDEO_SIZE_MB=500
MAX_UPLOAD_TIMEOUT_SECONDS=300

# File Storage
TEMP_STORAGE_PATH=./temp
PROCESSING_DATA_PATH=./data

# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/app.log

# Optional: Redis for caching
# REDIS_URL=redis://localhost:6379
# REDIS_CACHE_TTL=3600
```

### 5. Create Backend Directory Structure

```bash
cd backend

# Initialize Python package
touch app/__init__.py

# Create subdirectories
mkdir -p app/routes
mkdir -p app/services
mkdir -p app/models
mkdir -p app/utils
mkdir -p app/middleware
mkdir -p data
mkdir -p logs
mkdir -p temp

# Create __init__.py files
touch app/routes/__init__.py
touch app/services/__init__.py
touch app/models/__init__.py
touch app/utils/__init__.py
touch app/middleware/__init__.py
```

### 6. Verify Backend Setup

```bash
cd backend

# Check Python version
python --version  # Should be 3.10+

# Check virtual environment
which python  # Should show venv path

# Test package imports
python -c "import fastapi; import cv2; print('Imports OK')"

# Run backend tests (once implementation starts)
pytest
```

---

## Frontend Setup

### 1. Initialize React Project

```bash
# Navigate to frontend directory
cd frontend

# Option A: Create React App
npx create-react-app .

# Option B: Vite (faster alternative)
npm create vite@latest . -- --template react
```

### 2. Install Frontend Dependencies

```bash
cd frontend

npm install

# Install additional packages:
npm install axios
npm install react-router-dom
npm install tailwindcss
npm install zustand
npm install vite
npm install @vitejs/plugin-react
```

### 3. Frontend Package.json

**Path:** `frontend/package.json`

```json
{
  "name": "pause-ai",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.1",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.7",
    "eslint": "^8.52.0",
    "prettier": "^3.1.0"
  }
}
```

### 4. Configure Environment Variables

**Path:** `frontend/.env.local`

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CACHING=true
```

### 5. Create Frontend Directory Structure

```bash
cd frontend

# Create src directories
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/styles
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/store
mkdir -p public

# Create placeholder files
touch src/App.jsx
touch src/main.jsx
touch src/index.css
```

### 6. Verify Frontend Setup

```bash
cd frontend

# Check Node version
node --version  # Should be 18+

# Check npm packages
npm list

# Start dev server (test)
npm run dev
# Should start on http://localhost:5173 or http://localhost:3000
```

---

## Database Setup

### Using FAISS (Development)

```bash
# Create necessary directories
mkdir -p data/faiss

# FAISS is in-memory by default, no setup needed
# Index gets created on first save
```

### Using Pinecone (Production)

```bash
# 1. Sign up at pinecone.io
# 2. Create API key
# 3. Create index (name the same as config)
# 4. Update backend/.env with credentials

PINECONE_API_KEY=xxx
VECTOR_DB_TYPE=pinecone
```

---

## Running the Application

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev

# Expected output:
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

### Terminal 3: Test API

```bash
# Check backend health
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","version":"1.0.0"}
```

---

## Development Tools & Commands

### Code Quality

```bash
# Backend
cd backend
black app/  # Format code
flake8 app/  # Lint
pytest  # Run tests

# Frontend
cd frontend
npm run lint  # Lint React
npm run format  # Format with Prettier
```

### Git Workflow

```bash
# Initial setup
git config user.name "Your Name"
git config user.email "email@example.com"

# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "Feature: description"

# Push to origin
git push origin feature/feature-name

# Create pull request on GitHub
```

---

## Troubleshooting

### Python Issues
```bash
# Virtual env not activating?
python -m venv venv --upgrade-deps

# Package install fails?
pip install --upgrade pip setuptools wheel

# CUDA/GPU issues (skip for CPU)?
pip install torch torchvision --no-cache-dir
```

### Node Issues
```bash
# Node version mismatch?
nvm install 18
nvm use 18

# Port already in use?
lsof -i :3000  # or :5173
kill -9 <PID>
```

### API Connection Issues
```bash
# CORS errors?
# Check backend/.env CORS_ORIGINS matches frontend URL

# Connection refused?
# Verify backend is running and port correct

# Timeout issues?
# Increase REACT_APP_API_TIMEOUT in frontend/.env
```

---

## Next Steps

1. ✅ Backend skeleton setup (this guide)
2. ✅ Frontend skeleton setup (this guide)
3. → Implement API routes
4. → Build React components
5. → Integrate Whisper + OpenCV
6. → Setup Vector DB
7. → Implement RAG pipeline
8. → Testing
9. → Deployment

---

## Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **Whisper Docs:** https://github.com/openai/whisper
- **OpenCV Docs:** https://docs.opencv.org/
- **FAISS Docs:** https://github.com/facebookresearch/faiss

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review documentation files
3. Check GitHub issues
4. Create detailed bug report if needed

