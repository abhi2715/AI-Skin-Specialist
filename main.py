"""
AI Skin Specialist — FastAPI Backend
Serves the React frontend and provides the /api/analyze endpoint.
"""

import os
import uuid
import tempfile
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from brain_of_the_doctor import brain_of_the_doctor
from voice_of_the_doctor import convert_text_to_doctor_audio
from voice_of_the_patient import transcribe_patient_voice

BASE_DIR = Path(__file__).resolve().parent
AUDIO_OUT_DIR = Path("/tmp/audio_output")
try:
    AUDIO_OUT_DIR.mkdir(exist_ok=True, parents=True)
except Exception:
    pass # In case of permissions issues on local vs vercel

app = FastAPI(title="AI Skin Specialist")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(
    audio: UploadFile = File(...),
    image: UploadFile = File(None),
    video: UploadFile = File(None),
):
    """Process voice + image/video and return doctor consultation."""
    if not image and not video:
        raise HTTPException(status_code=400, detail="Please upload a skin image or video.")

    # ── Save uploaded files to temp paths ──
    audio_path = None
    image_path = None
    video_path = None

    try:
        # Audio (required)
        audio_suffix = Path(audio.filename or "audio.webm").suffix or ".webm"
        audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=audio_suffix)
        audio_tmp.write(await audio.read())
        audio_tmp.close()
        audio_path = audio_tmp.name

        # Image (optional)
        if image and image.filename:
            img_suffix = Path(image.filename).suffix or ".png"
            img_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=img_suffix)
            img_tmp.write(await image.read())
            img_tmp.close()
            image_path = img_tmp.name

        # Video (optional)
        if video and video.filename:
            vid_suffix = Path(video.filename).suffix or ".mp4"
            vid_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=vid_suffix)
            vid_tmp.write(await video.read())
            vid_tmp.close()
            video_path = vid_tmp.name

        # ── Pipeline ──
        try:
            # 1. Transcribe patient voice
            patient_text = transcribe_patient_voice(audio_path)

            # 2. Get doctor's guidance (vision model)
            doctor_text = brain_of_the_doctor(
                patient_text=patient_text,
                image_filepath=image_path,
                video_filepath=video_path,
            )

            # 3. Generate doctor voice audio
            audio_filename = f"doctor_{uuid.uuid4().hex[:8]}.mp3"
            audio_out_path = AUDIO_OUT_DIR / audio_filename
            convert_text_to_doctor_audio(doctor_text, output_filepath=audio_out_path)
            
            import base64
            with open(audio_out_path, "rb") as f:
                audio_base64 = base64.b64encode(f.read()).decode("utf-8")
            
            audio_data_uri = f"data:audio/mp3;base64,{audio_base64}"
            
        except Exception as e:
            error_message = str(e)
            if "api_key" in error_message.lower() or "unauthorized" in error_message.lower() or "missing" in error_message.lower():
                raise HTTPException(status_code=401, detail="API Key is missing or invalid in Vercel Settings.")
            raise HTTPException(status_code=500, detail=f"AI Processing Error: {error_message}")

        return JSONResponse(
            {
                "transcript": patient_text,
                "guidance": doctor_text,
                "audio_data": audio_data_uri,
            }
        )

    finally:
        # Clean up temp files
        for p in [audio_path, image_path, video_path]:
            if p:
                try:
                    os.unlink(p)
                except OSError:
                    pass
        # Clean up generated audio file
        try:
            if 'audio_out_path' in locals() and audio_out_path.exists():
                os.unlink(audio_out_path)
        except OSError:
            pass


@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Serve generated doctor audio files."""
    filepath = AUDIO_OUT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(filepath, media_type="audio/mpeg")


# ── Serve React build in production ──
FRONTEND_BUILD = BASE_DIR / "dist"
if FRONTEND_BUILD.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD), html=True), name="frontend")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
