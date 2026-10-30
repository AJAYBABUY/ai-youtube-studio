import os
import urllib.parse
import httpx
from PIL import Image, ImageDraw, ImageFont
from typing import Optional
from app.config import settings
from app.utils.logger import logger

class MediaGenerator:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY

    def generate_scene_image(
        self,
        prompt: str,
        output_path: str,
        video_type: str = "shorts",
        scene_number: int = 1,
        title_hint: str = ""
    ) -> str:
        """
        Generates or downloads a high-quality visual for a scene.
        Dimensions:
        - Shorts: 1080x1920 (9:16)
        - Long-form: 1920x1080 (16:9)
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        width, height = (1080, 1920) if video_type == "shorts" else (1920, 1080)

        # 1. Primary: Free high-quality Pollinations AI generator (Flux model)
        encoded_prompt = urllib.parse.quote(f"{prompt}, 8k resolution, cinematic lighting, photorealistic, vivid colors, unreal engine 5 render")
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&model=flux&nologo=true&seed={scene_number * 107}"

        try:
            with httpx.Client(timeout=25.0, follow_redirects=True) as client:
                res = client.get(url)
                if res.status_code == 200 and len(res.content) > 5000:
                    with open(output_path, "wb") as f:
                        f.write(res.content)
                    logger.info(f"Generated scene {scene_number} image via Pollinations AI: {output_path}")
                    return output_path
        except Exception as e:
            logger.warning(f"Pollinations AI request failed for scene {scene_number}: {e}")

        # 2. Resilient aesthetic Pillow image generator (Fallback)
        logger.info(f"Generating aesthetic stylized scene card for scene {scene_number}")
        img = Image.new("RGB", (width, height), color=(15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Generate stylized color gradient background
        colors = [
            [(15, 23, 42), (88, 28, 135)],  # Dark Slate to Purple
            [(15, 23, 42), (29, 78, 216)],  # Dark Slate to Blue
            [(15, 23, 42), (180, 83, 9)],   # Dark Slate to Amber
            [(15, 23, 42), (190, 18, 60)],  # Dark Slate to Crimson
            [(15, 23, 42), (4, 120, 87)],   # Dark Slate to Emerald
        ]
        top_color, bottom_color = colors[(scene_number - 1) % len(colors)]

        for y in range(height):
            ratio = y / height
            r = int(top_color[0] * (1 - ratio) + bottom_color[0] * ratio)
            g = int(top_color[1] * (1 - ratio) + bottom_color[1] * ratio)
            b = int(top_color[2] * (1 - ratio) + bottom_color[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Add stylized geometric frames and glowing scene accent
        accent_color = (255, 255, 255, 80)
        draw.rectangle([50, 50, width - 50, height - 50], outline=accent_color, width=4)
        
        # Center badge
        center_x, center_y = width // 2, height // 2
        badge_w, badge_h = (500, 260) if video_type == "shorts" else (700, 200)
        draw.rounded_rectangle(
            [center_x - badge_w // 2, center_y - badge_h // 2, center_x + badge_w // 2, center_y + badge_h // 2],
            radius=24,
            fill=(0, 0, 0, 180),
            outline=(255, 255, 255),
            width=2
        )

        # Scene label & Prompt preview
        draw.text((center_x, center_y - 40), f"SCENE #{scene_number}", fill=(245, 158, 11), anchor="mm")
        label = (prompt[:45] + "...") if len(prompt) > 45 else prompt
        draw.text((center_x, center_y + 20), label, fill=(255, 255, 255), anchor="mm")

        img.save(output_path, "JPEG", quality=92)
        return output_path

media_generator = MediaGenerator()

