import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from app.utils.logger import logger

class ThumbnailService:
    def create_thumbnail(
        self,
        base_image_path: str,
        headline_telugu: str,
        category: str,
        output_path: str,
        video_type: str = "shorts"
    ) -> str:
        """
        Composes a high-CTR YouTube thumbnail with bold Telugu headline typography and category badge.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        target_size = (1080, 1920) if video_type == "shorts" else (1280, 720)
        w, h = target_size

        try:
            if os.path.exists(base_image_path):
                img = Image.open(base_image_path).convert("RGB")
                img = img.resize(target_size, Image.Resampling.LANCZOS)
            else:
                img = Image.new("RGB", target_size, (15, 23, 42))
        except Exception as e:
            logger.warning(f"Failed to load base image {base_image_path}: {e}")
            img = Image.new("RGB", target_size, (15, 23, 42))

        # Add cinematic vignette & bottom contrast gradient
        overlay = Image.new("RGBA", target_size, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)

        # Gradient band for text readability
        gradient_h = int(h * 0.45)
        for y in range(h - gradient_h, h):
            alpha = int(220 * ((y - (h - gradient_h)) / gradient_h))
            draw_ov.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))

        # Blend overlay
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

        # Draw Category Badge
        badge_text = f"⚡ {category.upper()}"
        badge_w = 260
        badge_h = 44
        badge_x = 50
        badge_y = 50 if video_type != "shorts" else 120
        draw.rounded_rectangle(
            [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
            radius=12,
            fill=(220, 38, 38) # Vibrant red badge
        )
        draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), badge_text, fill=(255, 255, 255), anchor="mm")

        # Telugu Headline
        # Truncate if too long
        display_title = headline_telugu if len(headline_telugu) <= 50 else (headline_telugu[:47] + "...")
        text_y = h - int(gradient_h * 0.65)
        center_x = w // 2

        # Draw text with heavy contrast border for readability on any background
        for ox in [-3, -2, 0, 2, 3]:
            for oy in [-3, -2, 0, 2, 3]:
                draw.text((center_x + ox, text_y + oy), display_title, fill=(0, 0, 0), anchor="mm")
        
        # Primary golden/yellow headline
        draw.text((center_x, text_y), display_title, fill=(253, 224, 71), anchor="mm")

        img.save(output_path, "JPEG", quality=95)
        logger.info(f"Generated thumbnail: {output_path}")
        return output_path

thumbnail_service = ThumbnailService()

