# 🎬 AI YouTube Studio – Autonomous Telugu Production Platform

**AI YouTube Studio** is a production-grade, multi-channel automated video creation and autonomous publishing platform designed for Windows laptops and workstations.

It autonomously researches trending topics, writes natural conversational Telugu scripts, synthesizes neural Telugu speech, generates visuals, assembles high-quality videos using FFmpeg with Ken Burns effects and burned-in subtitles, designs high-CTR thumbnails, and publishes them to connected YouTube channels via the official YouTube Data API v3.

---

## ⚡ Production Pipeline Architecture

```
[ Daily Scheduler ]
        │
        ▼
[ Select Channel ]
        │
        ▼
[ Research Telugu Topics ]
        │
        ▼
[ Rank and Select Topic ]
        │
        ▼
[ Generate Script & Scene Prompts ]
        │
        ▼
[ Generate Visuals & Media ]
        │
        ▼
[ Generate Telugu Voiceover (Neural TTS) ]
        │
        ▼
[ FFmpeg Assembly (Ken Burns + Subtitles) ]
        │
        ▼
[ Generate Thumbnail & Metadata ]
        │
        ▼
[ Quality Validation ] ─────────► [ Failed: Retry / Alert ]
        │ (Passed)
        ▼
[ YouTube Resumable Upload (Data API v3) ]
        │
        ▼
[ Schedule Publication & Save Ledger ]
```

---

## 🌟 Key Features

1. **Multi-Channel Management**:
   - Manage multiple YouTube channels independently.
   - Separate content categories, publishing schedules, and isolated asset folders.
   - Independent daily automation toggle for each channel.
   - Secure Google OAuth 2.0 with AES-256 encrypted refresh tokens.

2. **Native Conversational Telugu Content Engine**:
   - Natural spoken Telugu flow (not robotic machine translation).
   - Natural integration of English technical terms (`processor`, `AI`, `black hole`, `rocket`).
   - Category-specialized prompts: Technology, Science, Serious Facts, Education, History, Kids Stories, Current Affairs, Entertainment, General Knowledge.
   - 3-second viral opening hooks tailored for high audience retention.

3. **Two Configurable Video Profiles**:
   - **YouTube Shorts (9:16, 1080 × 1920)**: Fast-paced 30–60s vertical storytelling, Ken Burns zoom/pan, burned-in viral subtitles.
   - **Long-Form Video (16:9, 1920 × 1080)**: Structured 5–10m documentary narrative arc with multi-scene progression and subtle ambient audio bed.

4. **100% Free-First AI Architecture**:
   - **Neural Voiceover**: Microsoft Edge Neural TTS (`te-IN-MohanNeural` & `te-IN-ShrutiNeural`) — ultra-high quality, 100% free with zero API key requirement.
   - **Visuals**: Pollinations AI (FLUX model) — free, high-speed photorealistic image generation.
   - **Intelligence & Planning**: Curated topic intelligence + optional Gemini API free tier.
   - **Assembly**: Local FFmpeg 9.0.

5. **Official YouTube Data API v3 Resumable Publishing**:
   - Uploads videos with chunked resumable protocol.
   - Custom thumbnail upload.
   - Sets localized Telugu titles, descriptions, and tags.
   - Configurable privacy status (`public`, `unlisted`, `private`, `scheduled`).
   - Persistent `UploadLedger` to prevent duplicate publishing.

6. **Daily Background Automation & Recovery**:
   - Autonomous APScheduler running locally on Windows.
   - Checks daily schedule times (e.g. 10:00 AM) and triggers production workflows.
   - Persistent checkpoints in SQLite (`ai_youtube_studio.db`).
   - Crash recovery: automatically resumes interrupted jobs on application startup.
   - Global Emergency Pause button accessible on every screen.

---

## 🚀 Quick Start on Windows

### 1. Launch with One Click
Simply double-click:
```cmd
Start.bat
```
This automatically:
1. Verifies your Python and Node environments.
2. Initializes the SQLite database and storage folders.
3. Launches the FastAPI backend API on `http://127.0.0.1:8000`.
4. Starts the Vite web application on `http://localhost:5173`.
5. Automatically opens the Studio Dashboard in your web browser.

### 2. Stop Services
Double-click:
```cmd
Stop.bat
```
Gracefully terminates backend and frontend background workers.

---

## 🛠️ Windows Manual Setup (Optional)

If running for the first time or setting up manually:

```cmd
:: 1. Run Automatic Installer
install.bat

:: 2. Or install backend dependencies manually
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt

:: 3. Install frontend dependencies
cd frontend
npm install
npm run build
cd ..

:: 4. Start Backend
set PYTHONPATH=%cd%\backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend

:: 5. Start Frontend
cd frontend
npm run dev
```

---

## 🔐 Google Cloud OAuth 2.0 Setup (For YouTube Uploads)

To connect YouTube channels for automatic publishing:

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `AI YouTube Studio`.
3. Navigate to **APIs & Services > Library** and enable **YouTube Data API v3**.
4. Go to **APIs & Services > OAuth consent screen**:
   - User Type: **External**.
   - App Name: `AI YouTube Studio`.
   - Add scopes:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/youtube`
   - Add your Google account email under **Test Users**.
5. Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs:
     `http://localhost:8000/api/auth/google/callback`
6. Copy your **Client ID** and **Client Secret**.
7. Enter them in the Studio interface under **Settings** or paste into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```
8. Go to **My Channels** and click **Connect via Google OAuth**.

---

## 📁 Storage Folder Hierarchy

All assets are strictly isolated per channel under `data/`:

```
data/
  ├── ai_youtube_studio.db       # Persistent SQLite database
  ├── .secret_key                # Fernet AES token encryption key
  ├── logs/                      # Application activity logs
  └── channels/
        └── <channel_id>/
              ├── research/      # Content plans & verified sources
              ├── scripts/       # Telugu narration & scene breakdown JSON
              ├── images/        # 9:16 and 16:9 generated scene visuals
              ├── voiceovers/    # Telugu neural MP3 audio clips
              ├── scenes/        # Individual animated MP4 clips
              ├── subtitles/     # Styled .ass and .srt Telugu subtitles
              ├── thumbnails/    # High-CTR composite JPEG thumbnails
              ├── rendered/      # Final assembled master MP4 videos
              └── published/     # Published video records
```

---

## 🐳 Optional Docker Deployment

```bash
docker-compose up -d --build
```
Access dashboard at `http://localhost:5173`.

