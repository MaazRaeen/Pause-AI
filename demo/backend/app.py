import os
from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS
from dotenv import load_dotenv
import openai

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")

def get_context(video_id, timestamp):
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
        context = []
        for t in transcript:
            # Get text around 10 seconds of the timestamp
            if abs(t.start - timestamp) < 10:
                context.append(t.text)
        return " ".join(context)
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return "No transcript context available."

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        video_id = data["videoId"]
        timestamp = data["timestamp"]
        question = data["question"]

        context = get_context(video_id, timestamp)
        
        if context == "No transcript context available.":
            return jsonify({"error": "Transcript could not be retrieved from YouTube for this video."}), 400

        prompt = f"Context: {context}\nQuestion: {question}\nAnswer based only on context."

        client = openai.OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        answer = response.choices[0].message.content

        return jsonify({"answer": answer, "context": context})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
