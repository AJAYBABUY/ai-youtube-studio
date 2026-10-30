import subprocess
import shutil
import os
from pathlib import Path
from app.config import settings

_CACHED_FFMPEG = None
_CACHED_FFPROBE = None

def find_ffmpeg_binary() -> str:
    global _CACHED_FFMPEG
    if _CACHED_FFMPEG:
        return _CACHED_FFMPEG

    # 1. Check user configured path
    if settings.FFMPEG_PATH and shutil.which(settings.FFMPEG_PATH):
        _CACHED_FFMPEG = settings.FFMPEG_PATH
        return _CACHED_FFMPEG

    # 2. Check system PATH
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        _CACHED_FFMPEG = system_ffmpeg
        return _CACHED_FFMPEG

    # 3. Check known WinGet installation path on Windows
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        known_ffmpeg = (
            Path(local_app_data)
            / "Microsoft"
            / "WinGet"
            / "Packages"
            / "Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe"
            / "ffmpeg-9.0.1-essentials_build"
            / "bin"
            / "ffmpeg.exe"
        )
        if known_ffmpeg.exists():
            _CACHED_FFMPEG = str(known_ffmpeg)
            return _CACHED_FFMPEG

        winget_base = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_base.exists():
            for p in winget_base.iterdir():
                if "ffmpeg" in p.name.lower():
                    exe = p / "bin" / "ffmpeg.exe"
                    if exe.exists():
                        _CACHED_FFMPEG = str(exe)
                        return _CACHED_FFMPEG
                    for sub in p.iterdir():
                        exe_sub = sub / "bin" / "ffmpeg.exe"
                        if exe_sub.exists():
                            _CACHED_FFMPEG = str(exe_sub)
                            return _CACHED_FFMPEG

    return "ffmpeg"

def find_ffprobe_binary() -> str:
    global _CACHED_FFPROBE
    if _CACHED_FFPROBE:
        return _CACHED_FFPROBE

    if settings.FFPROBE_PATH and shutil.which(settings.FFPROBE_PATH):
        _CACHED_FFPROBE = settings.FFPROBE_PATH
        return _CACHED_FFPROBE

    system_ffprobe = shutil.which("ffprobe")
    if system_ffprobe:
        _CACHED_FFPROBE = system_ffprobe
        return _CACHED_FFPROBE

    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        known_ffprobe = (
            Path(local_app_data)
            / "Microsoft"
            / "WinGet"
            / "Packages"
            / "Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe"
            / "ffmpeg-9.0.1-essentials_build"
            / "bin"
            / "ffprobe.exe"
        )
        if known_ffprobe.exists():
            _CACHED_FFPROBE = str(known_ffprobe)
            return _CACHED_FFPROBE

        winget_base = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_base.exists():
            for p in winget_base.iterdir():
                if "ffmpeg" in p.name.lower():
                    exe = p / "bin" / "ffprobe.exe"
                    if exe.exists():
                        _CACHED_FFPROBE = str(exe)
                        return _CACHED_FFPROBE
                    for sub in p.iterdir():
                        exe_sub = sub / "bin" / "ffprobe.exe"
                        if exe_sub.exists():
                            _CACHED_FFPROBE = str(exe_sub)
                            return _CACHED_FFPROBE

    return "ffprobe"

def verify_ffmpeg() -> dict:
    ffmpeg_bin = find_ffmpeg_binary()
    ffprobe_bin = find_ffprobe_binary()

    status = {
        "ffmpeg_available": False,
        "ffmpeg_path": ffmpeg_bin,
        "ffmpeg_version": "",
        "ffprobe_available": False,
        "ffprobe_path": ffprobe_bin,
    }

    try:
        proc = subprocess.run([ffmpeg_bin, "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if proc.returncode == 0:
            status["ffmpeg_available"] = True
            status["ffmpeg_version"] = proc.stdout.splitlines()[0] if proc.stdout else ""
    except Exception as e:
        status["error"] = str(e)

    try:
        proc = subprocess.run([ffprobe_bin, "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if proc.returncode == 0:
            status["ffprobe_available"] = True
    except Exception:
        pass

    return status

