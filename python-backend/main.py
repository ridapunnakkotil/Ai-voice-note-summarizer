import os

# Make ffmpeg visible to Python/Whisper on this Windows machine
os.environ["PATH"] += os.pathsep + r"C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-essentials_build\bin"

import shutil
print("FFMPEG FOUND AT:", shutil.which("ffmpeg"))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import uuid
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base")


@app.get("/")
def home():
    return {"message": "Python backend is running"}


def split_sentences(text: str):
    parts = re.split(r'(?<=[.!?])\s+', text.strip())
    return [p.strip() for p in parts if p.strip()]


def clean_point(sentence: str):
    sentence = sentence.strip()
    sentence = sentence.rstrip(".!?")
    return sentence[:1].upper() + sentence[1:] if sentence else sentence


@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    file_path = None
    try:
        print("Received file:", audio.filename)

        file_ext = os.path.splitext(audio.filename)[1]
        file_path = f"temp_{uuid.uuid4().hex}{file_ext}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        print("Saved file to:", file_path)

        result = model.transcribe(file_path, fp16=False)
        transcript = result.get("text", "").strip()

        print("Transcript:", transcript)

        if not transcript:
            return {
                "transcript": "No transcript generated.",
                "summary": {
                    "summary": "No summary generated.",
                    "keyPoints": ["No key points found"],
                    "actionItems": ["No clear action items found"],
                },
            }

        sentences = split_sentences(transcript)

        # Better summary:
        # Use the first 2 meaningful sentences instead of just first 30 words
        summary_sentences = sentences[:2] if len(sentences) >= 2 else sentences[:1]
        short_summary = " ".join(summary_sentences).strip()

        # Better key points:
        # Use up to 4 cleaned sentences, but shorter and less repetitive
        key_points = []
        for s in sentences[:4]:
            point = clean_point(s)
            if point and point not in key_points:
                key_points.append(point)

        # Better action items:
        # Look for actual action-oriented phrases
        action_words = [
            "should", "need", "must", "todo", "follow up", "complete",
            "finish", "submit", "send", "review", "prepare", "plan",
            "schedule", "call", "email", "fix", "update"
        ]

        action_items = []
        for s in sentences:
            lower_s = s.lower()
            if any(word in lower_s for word in action_words):
                cleaned = clean_point(s)
                if cleaned and cleaned not in action_items:
                    action_items.append(cleaned)

        if not action_items:
            action_items = ["No clear action items found"]

        summary = {
            "summary": short_summary if short_summary else "No summary generated.",
            "keyPoints": key_points if key_points else ["No key points found"],
            "actionItems": action_items,
        }

        return {
            "transcript": transcript,
            "summary": summary,
        }

    except Exception as e:
        print("REAL ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                print("Cleanup error:", repr(cleanup_error))