import os
import whisper
import faiss
import numpy as np
import openai
from moviepy import VideoFileClip
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")

def process_video_and_query(video_path, query):
    """
    Complete pipeline demonstrating Advanced Mode for Pause AI.
    """
    audio_path = "audio.wav"
    
    print("---------------- STEP 1: Extract Audio ----------------")
    try:
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(audio_path)
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return

    print("\n---------------- STEP 2: Transcription ----------------")
    print("Loading Whisper model...")
    model = whisper.load_model("base")
    print("Transcribing audio...")
    result = model.transcribe(audio_path)
    text = result["text"]
    print(f"Extracted Text: {text[:200]}...")

    print("\n---------------- STEP 3: Chunking ----------------")
    def split_text(text, chunk_size=200):
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i+chunk_size]))
        return chunks

    chunks = split_text(text)
    print(f"Created {len(chunks)} chunks.")

    print("\n---------------- STEP 4: FAISS Index ----------------")
    print("Loading SentenceTransformer model...")
    embed_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Generating embeddings...")
    embeddings = embed_model.encode(chunks)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))
    print(f"Indexed {index.ntotal} vectors.")

    print("\n---------------- STEP 5: Query ----------------")
    print(f"Query: '{query}'")
    query_vec = embed_model.encode([query])
    k_neighbors= min(3, len(chunks))
    D, I = index.search(np.array(query_vec), k=k_neighbors)

    context = " ".join([chunks[i] for i in I[0]])
    print(f"\nRetrieved Context: {context}")

    print("\n---------------- STEP 6: LLM Answer ----------------")
    try:
        client = openai.OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user",
                "content": f"Context: {context}\nQuestion: {query}\nAnswer based only on context."
            }]
        )
        print("\n=== AI Answer ===")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating LLM answer: {e}")

if __name__ == "__main__":
    import sys
    print("=== Pause AI Advanced Demo ===")
    vid_path = input("Enter path to video file (e.g. video.mp4): ")
    q = input("Enter your question: ")
    if os.path.exists(vid_path):
        process_video_and_query(vid_path, q)
    else:
        print(f"File not found: {vid_path}")
