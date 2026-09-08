import os
import io
import time
import base64
import soundfile as sf
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from kokoro_onnx import Kokoro

# Initialize FastAPI app
app = FastAPI(
    title="Kokoro Local Neural Voice Server",
    description="High-performance local TTS server powered by Kokoro 82M ONNX",
    version="1.0.0"
)

# Enable CORS for local client and Express proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "kokoro-v1.0.onnx")
VOICES_PATH = os.path.join(MODELS_DIR, "voices-v1.0.bin")

# Global Kokoro instance
kokoro_instance = None
available_voices = []

def get_kokoro():
    global kokoro_instance, available_voices
    if kokoro_instance is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VOICES_PATH):
            raise RuntimeError(f"Kokoro model assets not found in {MODELS_DIR}. Run download_models.py first.")
        print(f"[Kokoro Server] Initializing model from {MODEL_PATH}...")
        start = time.time()
        kokoro_instance = Kokoro(MODEL_PATH, VOICES_PATH)
        available_voices = kokoro_instance.get_voices()
        print(f"[Kokoro Server] Model loaded with {len(available_voices)} voices in {time.time() - start:.2f}s!")
    return kokoro_instance

class SynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = "bf_emma"
    speed: Optional[float] = 1.0
    lang: Optional[str] = "en-gb"

class TurnRequest(BaseModel):
    patient_speech: str
    clinic_name: Optional[str] = "St. James Dental Practice"
    voice: Optional[str] = "bf_emma"
    speed: Optional[float] = 1.0

@app.on_event("startup")
def startup_event():
    try:
        get_kokoro()
    except Exception as e:
        print(f"[Kokoro Server] Startup warning: {e}")

@app.get("/health")
def health_check():
    global available_voices
    try:
        k = get_kokoro()
        return {
            "status": "online",
            "model": "kokoro-v1.0.onnx",
            "sample_rate": 24000,
            "voices_count": len(available_voices),
            "default_voice": "bf_emma",
            "device": "CPU / ONNX Runtime",
            "server_time": time.time()
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

@app.get("/voices")
def list_voices():
    global available_voices
    k = get_kokoro()
    return {
        "voices": available_voices,
        "recommended": [
            {"id": "bf_emma", "name": "Emma (British Female - Crisp Receptionist)", "lang": "en-gb"},
            {"id": "bf_isabella", "name": "Isabella (British Female - Warm Clinical)", "lang": "en-gb"},
            {"id": "af_sarah", "name": "Sarah (American Female - Professional)", "lang": "en-us"},
            {"id": "af_bella", "name": "Bella (American Female - Friendly)", "lang": "en-us"},
            {"id": "am_adam", "name": "Adam (American Male - Clear & Authoritative)", "lang": "en-us"}
        ]
    }

@app.post("/synthesize")
def synthesize_speech(req: SynthesizeRequest):
    k = get_kokoro()
    clean_text = req.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    voice = req.voice if req.voice in available_voices else "bf_emma"
    lang = req.lang or ("en-gb" if voice.startswith("bf_") or voice.startswith("bm_") else "en-us")

    try:
        start_t = time.time()
        samples, sample_rate = k.create(clean_text, voice=voice, speed=req.speed or 1.0, lang=lang)
        
        # Write to in-memory WAV buffer
        buf = io.BytesIO()
        sf.write(buf, samples, sample_rate, format="WAV")
        buf.seek(0)
        audio_bytes = buf.read()
        duration_sec = len(samples) / sample_rate

        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "X-Kokoro-Duration": f"{duration_sec:.2f}",
                "X-Kokoro-Voice": voice,
                "X-Kokoro-Latency": f"{time.time() - start_t:.3f}",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kokoro synthesis failed: {str(e)}")

@app.post("/synthesize/base64")
def synthesize_speech_base64(req: SynthesizeRequest):
    k = get_kokoro()
    clean_text = req.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    voice = req.voice if req.voice in available_voices else "bf_emma"
    lang = req.lang or ("en-gb" if voice.startswith("bf_") or voice.startswith("bm_") else "en-us")

    try:
        start_t = time.time()
        samples, sample_rate = k.create(clean_text, voice=voice, speed=req.speed or 1.0, lang=lang)
        
        buf = io.BytesIO()
        sf.write(buf, samples, sample_rate, format="WAV")
        buf.seek(0)
        audio_base64 = base64.b64encode(buf.read()).decode("utf-8")
        duration_sec = len(samples) / sample_rate

        return {
            "success": True,
            "audio_base64": f"data:audio/wav;base64,{audio_base64}",
            "sample_rate": sample_rate,
            "duration": round(duration_sec, 2),
            "latency_ms": round((time.time() - start_t) * 1000, 1),
            "voice": voice
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("[Kokoro Server] Starting on http://127.0.0.1:8880...")
    uvicorn.run(app, host="127.0.0.1", port=8880, log_level="info")
