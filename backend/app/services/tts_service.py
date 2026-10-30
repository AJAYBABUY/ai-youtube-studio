import asyncio
import os
import subprocess
from pathlib import Path
from app.utils.logger import logger
from app.utils.ffmpeg_checker import find_ffprobe_binary

class TTSService:
    def __init__(self):
        # High quality Telugu neural voices
        self.male_voice = "te-IN-MohanNeural"
        self.female_voice = "te-IN-ShrutiNeural"

    async def _generate_edge_tts(self, text: str, output_path: str, voice: str = "te-IN-MohanNeural") -> bool:
        """Generates audio using free Edge-TTS neural speech."""
        import edge_tts
        try:
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(output_path)
            return True
        except Exception as e:
            logger.warning(f"Edge-TTS generation failed for text '{text[:30]}...': {e}")
            return False

    def _generate_gtts(self, text: str, output_path: str) -> bool:
        """Fallback to Google TTS for Telugu speech."""
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang="te", slow=False)
            tts.save(output_path)
            return True
        except Exception as e:
            logger.error(f"gTTS fallback failed: {e}")
            return False

    def generate_speech(self, text: str, output_path: str, gender: str = "male") -> float:
        """
        Generates Telugu voiceover for the given text.
        Returns the duration of the generated audio in seconds.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        chosen_voice = self.male_voice if gender.lower() == "male" else self.female_voice

        # 1. Primary: Edge-TTS
        success = False
        try:
            success = asyncio.run(self._generate_edge_tts(text, output_path, chosen_voice))
        except Exception as e:
            logger.warning(f"Edge-TTS async execution error: {e}")

        # 2. Secondary Fallback: gTTS
        if not success or not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            logger.info("Attempting gTTS fallback...")
            success = self._generate_gtts(text, output_path)

        # 3. Last-resort fallback for local offline testing (silent 4s audio file via FFmpeg)
        if not success or not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            logger.warning("All TTS services failed or offline; generating synthetic placeholder audio.")
            from app.utils.ffmpeg_checker import find_ffmpeg_binary
            ffmpeg_bin = find_ffmpeg_binary()
            subprocess.run([
                ffmpeg_bin, "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                "-t", "5", "-q:a", "9", "-acodec", "libmp3lame", output_path
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Measure exact duration
        duration = self.get_audio_duration(output_path)
        logger.info(f"Generated speech file: {output_path} (Duration: {duration:.2f}s)")
        return duration

    def get_audio_duration(self, audio_path: str) -> float:
        """Measures precise duration of audio file using ffprobe or mutagen."""
        try:
            from mutagen.mp3 import MP3
            audio = MP3(audio_path)
            return float(audio.info.length)
        except Exception:
            pass

        try:
            ffprobe_bin = find_ffprobe_binary()
            cmd = [
                ffprobe_bin, "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", audio_path
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
            if res.returncode == 0:
                return float(res.stdout.strip())
        except Exception as e:
            logger.warning(f"Failed to probe audio duration: {e}")

        return 5.0 # fallback estimate

tts_service = TTSService()

