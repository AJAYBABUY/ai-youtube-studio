import json
from typing import Dict, Any, List
from app.config import settings
from app.utils.logger import logger

class ScriptService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def _get_category_style_instruction(self, category: str) -> str:
        instructions = {
            "Technology": "Use an energetic, conversational tech-influencer tone. Keep technical words like 'AI', 'Algorithm', 'Chips', 'Battery' in English while explaining their significance in engaging, fluent Telugu.",
            "Serious Facts": "Use an intriguing, suspenseful, deep documentary tone. Build curiosity with dramatic pacing and wonder.",
            "Science": "Use an inquisitive, mind-bending scientific storytelling style. Break down complex phenomena into relatable real-world analogies.",
            "History": "Use a grand, historical epic narrative style with rich historical flavor.",
            "Education": "Use a clear, encouraging, structured teacher/mentor tone with actionable takeaways.",
            "Kids Stories": "Use a sweet, playful, animated and expressive storytelling tone with clear moral lessons.",
            "Entertainment": "Use a trendy, upbeat, sensational movie-critic or pop-culture commentator vibe.",
            "Current Affairs": "Use an objective, articulate, analytical news-explainer style."
        }
        return instructions.get(category, "Use a natural, conversational, highly engaging Telugu spoken tone.")

    def generate_script_and_scenes(
        self,
        category: str,
        topic: str,
        video_type: str = "shorts",
        hook: str = ""
    ) -> Dict[str, Any]:
        """
        Generates:
        - Full Telugu narration script
        - Scene breakdown (visual prompt for image generation, narration line, duration target)
        - SEO optimized Telugu title, description, and hashtags
        """
        logger.info(f"Generating Telugu script for topic: '{topic}' (Type: {video_type}, Category: {category})")

        num_scenes = 4 if video_type == "shorts" else 8
        style_instruction = self._get_category_style_instruction(category)

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")

                prompt = f"""
Act as a master Telugu YouTube scriptwriter and visual director.
Create an entire video production package for:
Topic: "{topic}"
Category: "{category}"
Target Format: {video_type.upper()} ({'30-50 seconds fast-paced vertical video' if video_type == 'shorts' else '5-8 minutes horizontal comprehensive story'})
Opening Hook: "{hook}"

Style Requirement:
{style_instruction}

Language Rules:
1. Spoken Telugu must feel 100% natural, as spoken by native Telugu creators (not robotic Google translate).
2. Use authentic Telugu idioms and pacing.
3. Natural English loan words are encouraged for tech, science or modern terms.
4. Total scenes needed: exactly {num_scenes} scenes.

Visual Directives:
- Each scene must have a vivid, cinematic English visual prompt suitable for AI image generation (e.g. "Cinematic 8k photorealistic close up of...").

Output MUST BE strictly valid JSON without extra markdown:
{{
  "title": "Viral Telugu Title (e.g. ఈ రహస్యం మీకు తెలుసా? 😱)",
  "description": "Engaging Telugu description summarizing the video with calls to action and relevant hashtags.",
  "tags": "Telugu, TeluguShorts, TeluguFacts, TechTelugu, AI, trending",
  "full_narration": "Full continuous Telugu script...",
  "scenes": [
    {{
      "scene_number": 1,
      "narration_line": "Opening Telugu sentence hooked to audience...",
      "visual_prompt": "Cinematic visual description in English for AI generator...",
      "duration_target": 7.5
    }}
  ]
}}
"""
                response = model.generate_content(prompt)
                raw = response.text.strip()
                if raw.startswith("```json"):
                    raw = raw.split("```json")[1].split("```")[0].strip()
                elif raw.startswith("```"):
                    raw = raw.split("```")[1].split("```")[0].strip()

                parsed = json.loads(raw)
                if parsed.get("scenes") and len(parsed["scenes"]) > 0:
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini script generation failed: {e}. Falling back to pre-crafted Telugu production template.")

        # Fallback template with authentic Telugu sentences and cinematic prompts
        if video_type == "shorts":
            scenes = [
                {
                    "scene_number": 1,
                    "narration_line": f"{hook if hook else 'మీకు ఈ ఆశ్చర్యకరమైన విషయం తెలుసా?'} కేవలం 30 సెకన్లలో ఈ సీక్రెట్ తెలుసుకోండి!",
                    "visual_prompt": f"Hyper-realistic dramatic 8k cinematic shot illustrating {topic}, dramatic lighting, 9:16 vertical composition",
                    "duration_target": 7.0
                },
                {
                    "scene_number": 2,
                    "narration_line": "దీని వెనుక ఉన్న అసలైన సైన్స్ మరియు టెక్నాలజీ తెలిస్తే మీరు ఖచ్చితంగా షాక్ అవుతారు.",
                    "visual_prompt": f"Futuristic glowing high-tech laboratory or deep universe concept art related to {topic}, volumetric light",
                    "duration_target": 8.0
                },
                {
                    "scene_number": 3,
                    "narration_line": "శాస్త్రవేత్తలు పరిశోధనల్లో కనుగొన్న తాజా నిజాలు ప్రపంచవ్యాప్తంగా సంచలనం సృష్టిస్తున్నాయి.",
                    "visual_prompt": f"Detailed cinematic visualization of discoveries and data graphs around {topic}, ultra photorealistic",
                    "duration_target": 8.0
                },
                {
                    "scene_number": 4,
                    "narration_line": "మరి ఈ అద్భుతమైన విషయం గురించి మీరేమనుకుంటున్నారు? వెంటనే కామెంట్ చేయండి మరియు సబ్‌స్క్రైబ్ చేసుకోండి!",
                    "visual_prompt": f"Epic concluding inspiring scene showing the future and innovation regarding {topic}, warm cinematic tone",
                    "duration_target": 7.0
                }
            ]
        else:
            scenes = [
                {
                    "scene_number": 1,
                    "narration_line": f"నమస్కారం ఫ్రెండ్స్! ఈరోజు మనం మాట్లాడబోయే టాపిక్: {topic}. ఇది ప్రతి ఒక్కరూ తెలుసుకోవాల్సిన ఒక అద్భుతమైన విషయం.",
                    "visual_prompt": f"Cinematic widescreen 16:9 intro establishing shot of {topic}, cinematic 8k masterpiece",
                    "duration_target": 12.0
                },
                {
                    "scene_number": 2,
                    "narration_line": "మొదటగా దీని ప్రాథమిక నేపథ్యం మరియు ఇది ఎందుకు ఇంతటి ప్రాధాన్యత సంతరించుకుందో అర్థం చేసుకుందాం.",
                    "visual_prompt": f"Detailed documentary style visualization of historical context and foundational technology of {topic}",
                    "duration_target": 14.0
                },
                {
                    "scene_number": 3,
                    "narration_line": "పరిశోధకులు జరిపిన తాజా ప్రయోగాలలో మన ఊహకు అందని అద్భుతమైన ఫలితాలు వెలుగులోకి వచ్చాయి.",
                    "visual_prompt": f"Close-up high tech scientific laboratory analysis and visual proof of {topic}, dramatic studio lighting",
                    "duration_target": 14.0
                },
                {
                    "scene_number": 4,
                    "narration_line": "భవిష్యత్తులో ఈ పరిజ్ఞానం మానవాళి జీవన విధానాన్ని పూర్తిగా మార్చివేయబోతోంది.",
                    "visual_prompt": f"Futuristic smart city and human interaction concept reflecting {topic}, ultra-detailed golden hour",
                    "duration_target": 14.0
                },
                {
                    "scene_number": 5,
                    "narration_line": "ఈ వీడియో మీకు నచ్చితే వెంటనే లైక్ చేయండి, మరిన్ని ఆసక్తికరమైన విషయాల కోసం మన ఛానెల్‌ను సబ్‌స్క్రైబ్ చేయడం మర్చిపోకండి!",
                    "visual_prompt": f"Outro cinematic sequence inspiring community engagement and curiosity about {topic}",
                    "duration_target": 10.0
                }
            ]

        full_script = " ".join([s["narration_line"] for s in scenes])
        title = f"{topic} | మీకు తెలియని ఆసక్తికరమైన నిజాలు! 🤯"
        description = f"{topic} గురించిన పూర్తి విశ్లేషణ మరియు ఆసక్తికరమైన వాస్తవాలు ఈ వీడియోలో చూడండి.\n\n🔔 మరిన్ని అప్‌డేట్స్ కోసం ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకోండి!\n\n#Telugu #TeluguFacts #{category.replace(' ', '')} #TeluguShorts"
        tags = f"Telugu, {category}, {topic}, Telugu Facts, AI Telugu, Trending Telugu"

        return {
            "title": title,
            "description": description,
            "tags": tags,
            "full_narration": full_script,
            "scenes": scenes
        }

script_service = ScriptService()

