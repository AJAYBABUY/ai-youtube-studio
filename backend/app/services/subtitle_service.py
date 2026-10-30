import os
from typing import List, Dict, Any

class SubtitleService:
    def format_timestamp_srt(self, seconds: float) -> str:
        """Converts seconds to SRT timestamp format HH:MM:SS,mmm"""
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

    def format_timestamp_ass(self, seconds: float) -> str:
        """Converts seconds to ASS timestamp format H:MM:SS.cc"""
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centis = int(((seconds - int(seconds)) * 100))
        return f"{hrs:d}:{mins:02d}:{secs:02d}.{centis:02d}"

    def generate_subtitles(self, scenes: List[Dict[str, Any]], srt_path: str, ass_path: str, video_type: str = "shorts") -> str:
        """
        Generates both SRT and styled ASS subtitle files.
        Returns the path to the ASS file (or SRT file).
        """
        os.makedirs(os.path.dirname(srt_path), exist_ok=True)
        
        # 1. Build SRT format
        srt_lines = []
        current_time = 0.0
        subtitle_index = 1

        for scene in scenes:
            line = scene.get("narration_line", "").strip()
            duration = float(scene.get("actual_duration") or scene.get("duration_target") or 6.0)
            
            start_time = current_time
            end_time = current_time + duration

            if line:
                srt_lines.append(f"{subtitle_index}")
                srt_lines.append(f"{self.format_timestamp_srt(start_time)} --> {self.format_timestamp_srt(end_time)}")
                srt_lines.append(f"{line}\n")
                subtitle_index += 1

            current_time = end_time

        with open(srt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(srt_lines))

        # 2. Build ASS format with high-CTR styling
        font_size = 28 if video_type == "shorts" else 22
        margin_v = 180 if video_type == "shorts" else 60

        ass_content = f"""[Script Info]
Title: Telugu Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: {'1080' if video_type == 'shorts' else '1920'}
PlayResY: {'1920' if video_type == 'shorts' else '1080'}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans Telugu, {font_size}, &H0000FFFF, &H000000FF, &H00000000, &H80000000, -1, 0, 0, 0, 100, 100, 0, 0, 1, 3.5, 2.0, 2, 40, 40, {margin_v}, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        current_time = 0.0
        for scene in scenes:
            line = scene.get("narration_line", "").strip()
            duration = float(scene.get("actual_duration") or scene.get("duration_target") or 6.0)
            start_time = current_time
            end_time = current_time + duration

            if line:
                ass_content += f"Dialogue: 0,{self.format_timestamp_ass(start_time)},{self.format_timestamp_ass(end_time)},Default,,0,0,0,,{line}\n"

            current_time = end_time

        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(ass_content)

        return ass_path

subtitle_service = SubtitleService()

