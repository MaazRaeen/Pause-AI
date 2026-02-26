# AI Components Guide - Pause AI

## Overview

This document details the AI/ML components used in Pause AI and how they integrate together.

---

## 1. Whisper (Speech-to-Text)

### What is Whisper?
- OpenAI's automatic speech recognition (ASR) model
- Trained on 680,000 hours of multilingual audio
- Robust to accents, background noise, and technical language
- Supports 99 languages

### Why Use Whisper?
- High accuracy across various audio qualities
- Supports multilingual content
- Fast transcription (real-time capable)
- Free API or local deployment option

### Whisper Models
```
tiny   → English: 39M params   | Multi-lang: 39M params
base   → English: 74M params   | Multi-lang: 74M params
small  → English: 244M params  | Multi-lang: 244M params
medium → English: 769M params  | Multi-lang: 769M params
large  → English: 1550M params | Multi-lang: 1550M params
```

### Implementation Plan
```python
# pseudocode
from openai import OpenAI

def transcribe_video_audio(audio_path):
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Transcribe with timestamps and language detection
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=open(audio_path, "rb"),
        response_format="verbose_json",  # includes timestamps
        language="auto"  # auto-detect
    )
    
    return {
        "full_text": result.text,
        "language": result.language,
        "segments": result.segments  # with start/end times
    }
```

### Output Format
```json
{
  "text": "Full transcription...",
  "language": "en",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 5.5,
      "text": "Today we'll learn about machine learning.",
      "avg_logprob": -0.3,
      "compression_ratio": 1.2,
      "no_speech_prob": 0.001
    }
  ]
}
```

### Cost Estimate
- $0.006 per minute of audio
- For 1-hour video: ~$0.36
- Batch processing recommended

---

## 2. OpenCV (Computer Vision)

### What is OpenCV?
- Open Source Computer Vision Library
- Real-time video processing
- Image manipulation and analysis
- Visual feature extraction

### Use Cases in Pause AI
- Extract frames from video
- Validate video format/codec
- Get video metadata (fps, resolution, duration)
- Optional: Scene detection, visual highlight extraction

### Implementation Plan
```python
import cv2

def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    
    # Get metadata
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_sec = total_frames / fps
    
    # Extract key frames at intervals
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Extract every 5th frame or based on FPS
        frames.append({
            "timestamp": cap.get(cv2.CAP_PROP_POS_MSEC),
            "frame": frame
        })
    
    cap.release()
    return {
        "duration": duration_sec,
        "fps": fps,
        "resolution": (width, height),
        "frames": frames
    }
```

### Key Dependencies
- opencv-python
- numpy
- pillow

---

## 3. Sentence Transformers (Embeddings)

### What are Embeddings?
- Convert text to numerical vectors (e.g., 384-dimensional)
- Vectors represent semantic meaning
- Similar texts have similar vectors (high cosine similarity)
- Enable semantic search and similarity comparisons

### Why Sentence Transformers?
- Specifically designed for semantic similarity
- Pre-trained on large datasets
- Generates fixed-size embeddings
- Fast inference on CPU

### Recommended Models
```
Model                          | Dim | Speed | Quality | Mirror
─────────────────────────────────────────────────────────────────
all-MiniLM-L6-v2              | 384 | Fast  | Good    | 22M params
all-mpnet-base-v2             | 768 | Med   | Better  | 110M params
paraphrase-MiniLM-L6-v2       | 384 | Fast  | Good    | 22M params
all-distilroberta-v1          | 768 | Med   | Good    | 82M params
```

### Implementation Plan
```python
from sentence_transformers import SentenceTransformer
import numpy as np

# Initialize model once (loaded into memory)
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embeddings(texts: list) -> np.ndarray:
    """Generate embeddings for list of texts"""
    embeddings = model.encode(texts, convert_to_tensor=True)
    return embeddings

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two texts"""
    embeddings = model.encode([text1, text2])
    similarity = numpy.dot(embeddings[0], embeddings[1]) / (
        numpy.linalg.norm(embeddings[0]) * 
        numpy.linalg.norm(embeddings[1])
    )
    return similarity
```

### Key Properties
- Embedding dimension: 384 (all-MiniLM-L6-v2)
- Similarity range: -1 to 1 (cosine similarity)
- Processing: ~1000 texts/second on CPU
- Memory: ~300MB model size

---

## 4. Vector Databases (FAISS / Pinecone)

### What are Vector DBs?
- Specialized databases for storing embeddings
- Optimized for similarity search
- Support approximate nearest neighbor (ANN) search
- Handle high-dimensional vectors efficiently

### FAISS (Facebook AI Similarity Search)

#### Pros
- Local, in-memory database
- Fast ANN search (IVF, HNSW indices)
- No external dependencies
- Good for development/testing

#### Cons
- Limited query capabilities
- No persistence by default (must pickle)
- Single-machine (no scaling)

#### Implementation Plan
```python
import faiss
import numpy as np
import pickle

def create_faiss_index(dimension=384):
    """Create FAISS index for embeddings"""
    # IVF index with 64 centroids and PQ with 8-byte codes
    quantizer = faiss.IndexFlatL2(dimension)
    index = faiss.IndexIVFPQ(quantizer, dimension, 64, 8)
    return index

def search_faiss(index, query_embedding, k=5):
    """Search for k nearest neighbors"""
    query_embedding = np.array([query_embedding], dtype=np.float32)
    distances, indices = index.search(query_embedding, k)
    return indices[0], distances[0]

def save_faiss_index(index, filepath):
    """Persist index to disk"""
    faiss.write_index(index, filepath)

def load_faiss_index(filepath):
    """Load index from disk"""
    return faiss.read_index(filepath)
```

### Pinecone (Cloud Vector DB)

#### Pros
- Managed service (no infrastructure)
- Highly scalable
- Real-time index updates
- Built-in pod storage
- Filter/metadata support

#### Cons
- Cloud dependency
- Pricing model
- API rate limits

#### Implementation Plan
```python
import pinecone

def initialize_pinecone(api_key, env, index_name):
    """Connect to Pinecone"""
    pinecone.init(api_key=api_key, environment=env)
    
    # Create index if not exists
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(
            name=index_name,
            dimension=384,
            metric="cosine"
        )
    
    return pinecone.Index(index_name)

def upsert_embeddings(index, video_id, embeddings, metadata):
    """Add/update embeddings"""
    vectors_to_insert = [
        (f"{video_id}_{i}", embedding, 
         {"video_id": video_id, "segment_id": meta["segment_id"],
          "timestamp": meta["timestamp"]})
        for i, (embedding, meta) in enumerate(zip(embeddings, metadata))
    ]
    index.upsert(vectors=vectors_to_insert)

def search_pinecone(index, query_embedding, k=5, video_id=None):
    """Search with optional filtering"""
    results = index.query(
        vector=query_embedding,
        top_k=k,
        filter={"video_id": video_id} if video_id else None,
        include_metadata=True
    )
    return results.matches
```

### Choice Logic
- **Development:** FAISS (local, fast setup)
- **Production:** Pinecone (scalable, managed)
- **Hybrid:** Use both (FAISS for cache, Pinecone for persistence)

---

## 5. Large Language Models (LLMs)

### Supported Models

#### OpenAI GPT Series
- **GPT-4** - Most capable, ~$0.03/1K tokens
- **GPT-3.5-Turbo** - Fast, cost-effective, ~$0.0005/1K tokens
- Best for: Production with quality assurance

#### Open Source (Hugging Face)
- **LLaMA 2** - Meta's open model
- **Mistral** - European, efficient
- **Qwen** - Chinese models
- Best for: Self-hosted, privacy-focused

#### Local Models
- **Ollama** - Local model runner
- **LM Studio** - User-friendly interface
- Best for: Development, offline scenarios

### Implementation Plan (OpenAI)
```python
from openai import OpenAI

def generate_answer(question, context, model="gpt-3.5-turbo"):
    """Generate answer using LLM with context"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """You are an educational assistant answering questions 
    based on video transcripts. Provide accurate, concise answers citing 
    specific timestamps when relevant."""
    
    user_message = f"""Context from video:
{context}

Question: {question}

Answer based on the context provided. If the answer is not in the context, 
say so clearly."""
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=500,
        top_p=0.95
    )
    
    return response.choices[0].message.content
```

### Prompt Engineering

#### System Prompt Template
```
You are an expert educational assistant specializing in [TOPIC].
Your role is to answer questions based on provided transcripts and context.

Guidelines:
1. Answer only based on provided context
2. Cite timestamps when mentioning content
3. Be concise and clear
4. If uncertain, acknowledge limitations
5. Format answers with proper sections
```

#### Context Format
```
TRANSCRIPT CONTEXT:
Timestamp [00:30-01:15]: "Introduction to neural networks..."
Timestamp [02:45-03:20]: "Types of neural networks include..."

QUESTION: What are neural networks?

ANSWER:
```

---

## 6. RAG (Retrieval-Augmented Generation)

### What is RAG?
- Combines retrieval + generation
- Retrieval step: Find relevant documents/segments (embedding similarity)
- Generation step: Use LLM with context to generate answer
- Reduces hallucination, grounds responses in data

### RAG Pipeline Flow
```
1. Question Input
   ↓
2. Embed Question (same model as content)
   ↓
3. Retrieve Top-K Similar Segments (vector DB search)
   ↓
4. Rank/Rerank Retrieved Results (optional)
   ↓
5. Format Context (arrange chronologically, add metadata)
   ↓
6. LLM Generation (question + context → answer)
   ↓
7. Post-processing (citations, formatting)
   ↓
8. Return Answer with Sources
```

### Implementation Plan (Pseudo)
```python
class RAGPipeline:
    def __init__(self, embedding_model, vector_db, llm):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
        self.llm = llm
    
    def answer_question(self, video_id, question, k=5):
        # Step 1: Embed question
        question_embedding = self.embedding_model.encode(question)
        
        # Step 2: Retrieve context
        results = self.vector_db.search(
            query=question_embedding,
            k=k,
            filter={"video_id": video_id}
        )
        
        # Step 3: Format context
        context = self._format_context(results)
        
        # Step 4: Generate answer
        answer = self.llm.generate_answer(
            question=question,
            context=context,
            system_prompt=self.get_system_prompt()
        )
        
        # Step 5: Add citations
        answer_with_citations = self._add_citations(answer, results)
        
        return {
            "answer": answer_with_citations,
            "sources": results,
            "confidence": self._calculate_confidence(results),
            "processing_time_ms": elapsed_time
        }
    
    def _format_context(self, results):
        """Format retrieved segments into context string"""
        context_parts = []
        for result in sorted(results, key=lambda x: x['timestamp']):
            context_parts.append(
                f"[{result['timestamp']}] {result['text']}"
            )
        return "\n".join(context_parts)
    
    def _add_citations(self, answer, sources):
        """Add source citations to answer"""
        # Find which sources are referenced in answer
        # Add inline citations: "...according to [timestamp]"
        return formatted_answer
    
    def _calculate_confidence(self, results):
        """Calculate answer confidence from source similarity"""
        if not results:
            return 0.0
        avg_similarity = np.mean([r['similarity'] for r in results])
        return float(avg_similarity)
```

---

## 7. NLP Components

### Text Processing Pipeline
```
Raw Transcript
    ↓
1. Cleaning (remove duplicates, normalize whitespace)
    ↓
2. Tokenization (split into tokens)
    ↓
3. Sentence Segmentation (identify sentences)
    ↓
4. Chunking (create overlapping segments)
    ↓
5. Named Entity Recognition (optional)
    ↓
6. Embedding Generation
```

### Text Chunking Strategy
```
Strategy: Sliding Window
- Chunk size: 256 tokens (~200 words)
- Overlap: 50% (128 tokens)
- Preserves context across chunks

Example:
Segment 1: "The quick brown fox jumps over..."  [0 tokens-256 tokens]
Segment 2: "over the lazy dog runs away with..." [128 tokens-384 tokens]
Segment 3: "with the fox's tail flying high..."   [256 tokens-512 tokens]
```

### Implementation Libraries
- **nltk** - Tokenization, sentence segmentation
- **spacy** - NER, POS tagging
- **transformers** - Hugging Face models
- **langchain** - LLM orchestration

---

## 8. Integration Points

### System Dependencies
```python
├── Speech Processing
│   ├── Whisper (transcription)
│   └── pydub (audio conversion)
│
├── Computer Vision
│   ├── OpenCV (video processing)
│   └── ffmpeg (codec handling)
│
├── NLP & Embeddings
│   ├── Sentence Transformers (embeddings)
│   ├── spaCy (NLP)
│   └── nltk (text processing)
│
├── Vector Search
│   ├── FAISS (local) / Pinecone (cloud)
│   └── numpy (math)
│
├── LLM
│   ├── OpenAI API (GPT)
│   └── LangChain (orchestration)
│
└── Infrastructure
    ├── FastAPI (backend)
    ├── React (frontend)
    └── Redis (caching)
```

---

## 9. Performance Benchmarks

| Component | Speed | Memory | Notes |
|-----------|-------|--------|-------|
| Whisper (1h audio) | 5 min | 2GB | Depends on model size |
| Embedding Gen (1000 texts) | 2 sec | 500MB | all-MiniLM-L6-v2 |
| FAISS Search (1M vectors) | 50ms | 2GB | IVF index |
| Pinecone Search | 200ms | N/A | Cloud latency |
| GPT-3.5 Generation | 2 sec | N/A | API latency |
| Full QA Pipeline | 3-5 sec | 3GB | End-to-end |

---

## 10. Configuration & Tuning

### Hyperparameters to Consider
```python
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # 384-dim
CHUNK_SIZE = 256  # tokens
CHUNK_OVERLAP = 0.5  # 50%
TOP_K_RETRIEVAL = 5  # retrieve 5 segments
LLM_TEMPERATURE = 0.7  # creative but grounded
LLM_MAX_TOKENS = 500  # answer length limit
SIMILARITY_THRESHOLD = 0.6  # minimum relevance
```

### Quality Improvements
- Reranking: Use cross-encoder for better ranking
- Query Expansion: Generate multiple queries
- Prompt Engineering: Iterate on system prompts
- Caching: Store common Q&A pairs
- Feedback Loop: Learn from user ratings

