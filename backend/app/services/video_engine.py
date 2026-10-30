import os
import subprocess
import tempfile
from typing import List, Dict, Any
from app.utils.logger import logger
from app.utils.ffmpeg_checker import find_ffmpeg_binary, find_ffprobe_binary

class VideoEngine:
    def __init__(self):
        self.ffmpeg_bin = find_ffmpeg_binary()
        self.ffprobe_bin = find_ffprobe_binary()

    def assemble_scene_clip(
        self,
        image_path: str,
        audio_path: str,
        output_scene_path: str,
        duration: float,
        video_type: str = "shorts"
    ) -> bool:
        """
        Takes a scene image and audio file, applies smooth Ken Burns pan/zoom, and produces a synchronized scene MP4 clip.
        """
        w, h = (1080, 1920) if video_type == "shorts" else (1920, 1080)
        fps = 25
        total_frames = int(duration * fps)

        # Ken Burns zoompan filter: slow cinematic 1.0 to 1.15 zoom
        vf_filter = (
            f"scale={w*2}x{h*2},"
            f"zoompan=z='min(zoom+0.0008,1.15)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={w}x{h}:fps={fps},"
            f"format=yuv420p"
        )

        cmd = [
            self.ffmpeg_bin, "-y",
            "-loop", "1", "-i", image_path,
            "-i", audio_path,
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "fast",
            "-vf", vf_filter,
            "-c:a", "aac", "-b:a", "192k",
            "-t", str(duration),
            "-pix_fmt", "yuv420p",
            "-shortest",
            output_scene_path
        ]

        logger.info(f"Assembling scene clip: {output_scene_path} (Duration: {duration}s)")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            logger.warning(f"Ken Burns scene assembly failed, attempting standard static render: {res.stderr[:200]}")
            # Fallback simpler filter without zoompan
            fallback_cmd = [
                self.ffmpeg_bin, "-y",
                "-loop", "1", "-i", image_path,
                "-i", audio_path,
                "-c:v", "libx264", "-preset", "ultrafast",
                "-vf", f"scale={w}:{h},format=yuv420p",
                "-c:a", "aac",
                "-t", str(duration),
                output_scene_path
            ]
            fallback_res = subprocess.run(fallback_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return fallback_res.returncode == 0

        return True

    def concatenate_scenes_and_subtitles(
        self,
        scene_clip_paths: List[str],
        subtitle_path: str,
        final_output_path: str,
        video_type: str = "shorts"
    ) -> bool:
        """
        Concatenates all individual scene clips into the finalized master video.
        Burns in subtitles if subtitle_path exists.
        """
        os.makedirs(os.path.dirname(final_output_path), exist_ok=True)
        temp_concat_txt = os.path.join(tempfile.gettempdir(), f"concat_{os.path.basename(final_output_path)}.txt")

        with open(temp_concat_txt, "w", encoding="utf-8") as f:
            for p in scene_clip_paths:
                normalized = os.path.abspath(p).replace("\\", "/")
                f.write(f"file '{normalized}'\n")

        # Check subtitle burning capability
        escaped_sub = os.path.abspath(subtitle_path).replace("\\", "/").replace(":", "\\:") if subtitle_path and os.path.exists(subtitle_path) else None

        if escaped_sub:
            # Re-encode with burned-in subtitles
            cmd = [
                self.ffmpeg_bin, "-y",
                "-f", "concat", "-safe", "0", "-i", temp_concat_txt,
                "-vf", f"subtitles='{escaped_sub}'",
                "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart",
                final_output_path
            ]
        else:
            # Fast stream copy concat
            cmd = [
                self.ffmpeg_bin, "-y",
                "-f", "concat", "-safe", "0", "-i", temp_concat_txt,
                "-c", "copy",
                "-movflags", "+faststart",
                final_output_path
            ]

        logger.info(f"Rendering final master video to: {final_output_path}")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if res.returncode != 0:
            logger.warning(f"Subtitle burn-in render returned code {res.returncode}. Falling back to clean concat without burned-in subtitles: {res.stderr[:200]}")
            fallback_cmd = [
                self.ffmpeg_bin, "-y",
                "-f", "concat", "-safe", "0", "-i", temp_concat_txt,
                "-c:v", "libx264", "-preset", "fast",
                "-c:a", "aac",
                final_output_path
            ]
            fallback_res = subprocess.run(fallback_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return fallback_res.returncode == 0

        # Clean up temp file
        if os.path.exists(temp_concat_txt):
            os.remove(temp_concat_txt)

        return True

    def validate_video_file(self, file_path: str) -> Dict[str, Any]:
        """
        Validates the rendered media file: checks existence, size, and probes streams.
        """
        if not os.path.exists(file_path):
            return {"valid": False, "error": "File does not exist"}

        size_bytes = os.path.getsize(file_path)
        if size_bytes < 1000:
            return {"valid": False, "error": f"File size too small ({size_bytes} bytes)"}

        try:
            cmd = [
                self.ffprobe_bin, "-v", "error",
                "-show_entries", "stream=codec_type,width,height,duration",
                "-of", "json",
                file_path
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
            if res.returncode == 0:
                import json
                data = json.loads(res.stdout)
                streams = data.get("streams", [])
                has_video = any(s.get("codec_type") == "video" for s in streams)
                has_audio = any(s.get("codec_type") == "audio" for s in streams)
                return {
                    "valid": has_video and has_audio,
                    "has_video": has_video,
                    "has_audio": has_audio,
                    "size_mb": round(size_bytes / (1024 * 1024), 2),
                    "streams": streams
                }
        except Exception as e:
            logger.warning(f"Video validation probe warning: {e}")

        # Basic fallback validation if probe times out
        return {"valid": size_bytes > 50000, "size_mb": round(size_bytes / (1024 * 1024), 2)}

video_engine = VideoEngine()

