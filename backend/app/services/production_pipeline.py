import os
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.models.channel import Channel
from app.models.content_plan import ContentPlan
from app.models.video_job import VideoJob
from app.models.upload_ledger import UploadLedger
from app.services.research_service import research_service
from app.services.script_service import script_service
from app.services.tts_service import tts_service
from app.services.media_generator import media_generator
from app.services.subtitle_service import subtitle_service
from app.services.thumbnail_service import thumbnail_service
from app.services.video_engine import video_engine
from app.services.youtube_service import youtube_service
from app.utils.logger import logger

class ProductionPipeline:
    def get_channel_dirs(self, channel_id: str) -> Dict[str, Path]:
        base = settings.MEDIA_DATA_DIR / str(channel_id)
        dirs = {
            "root": base,
            "research": base / "research",
            "scripts": base / "scripts",
            "images": base / "images",
            "voiceovers": base / "voiceovers",
            "scenes": base / "scenes",
            "subtitles": base / "subtitles",
            "thumbnails": base / "thumbnails",
            "rendered": base / "rendered",
            "published": base / "published",
        }
        for d in dirs.values():
            d.mkdir(parents=True, exist_ok=True)
        return dirs

    def execute_video_production(self, db: Session, job_id: str) -> VideoJob:
        """
        Executes the entire automated production lifecycle for a VideoJob.
        """
        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        channel = db.query(Channel).filter(Channel.id == job.channel_id).first()
        if not channel:
            raise ValueError(f"Channel {job.channel_id} not found")

        dirs = self.get_channel_dirs(channel.id)

        try:
            # Step 1: Research & Topic Planning
            if not job.title or job.status == "pending":
                job.status = "researching"
                job.current_step = "Researching Telugu Topics"
                job.progress_percent = 10
                db.commit()

                # Generate or fetch content plan
                plan_data = research_service.research_topic(
                    db, channel.id, channel.category, job.video_type
                )
                
                content_plan = ContentPlan(
                    channel_id=channel.id,
                    category=channel.category,
                    target_format=job.video_type,
                    topic=plan_data["topic"],
                    english_topic=plan_data.get("english_topic"),
                    hook=plan_data.get("hook"),
                    research_summary=plan_data.get("research_summary"),
                    factual_claims=json.dumps(plan_data.get("factual_claims", []), ensure_ascii=False),
                    sources_and_references=json.dumps(plan_data.get("sources_and_references", []), ensure_ascii=False),
                    audience_relevance_score=plan_data.get("audience_relevance_score", 9.0),
                    status="generating"
                )
                db.add(content_plan)
                db.commit()
                db.refresh(content_plan)

                job.content_plan_id = content_plan.id
                job.title = plan_data["topic"]

                # Save research file
                with open(dirs["research"] / f"plan_{job.id}.json", "w", encoding="utf-8") as f:
                    json.dump(plan_data, f, ensure_ascii=False, indent=2)

            # Step 2: Scripting & Scene Breakdown
            job.status = "scripting"
            job.current_step = "Writing Conversational Telugu Script & Scene Prompts"
            job.progress_percent = 25
            db.commit()

            plan = db.query(ContentPlan).filter(ContentPlan.id == job.content_plan_id).first()
            script_data = script_service.generate_script_and_scenes(
                category=channel.category,
                topic=job.title,
                video_type=job.video_type,
                hook=plan.hook if plan else ""
            )

            job.title = script_data.get("title", job.title)
            job.description = script_data.get("description", "")
            job.tags = script_data.get("tags", "")
            job.script_telugu = script_data.get("full_narration", "")
            job.scene_data = json.dumps(script_data.get("scenes", []), ensure_ascii=False)
            db.commit()

            with open(dirs["scripts"] / f"script_{job.id}.json", "w", encoding="utf-8") as f:
                json.dump(script_data, f, ensure_ascii=False, indent=2)

            # Step 3: Media & Voice Generation
            job.status = "generating_media"
            job.current_step = "Generating Images & Telugu Neural Narration"
            job.progress_percent = 45
            db.commit()

            scenes = script_data.get("scenes", [])
            total_duration = 0.0

            for sc in scenes:
                sc_num = sc.get("scene_number", 1)
                img_path = str(dirs["images"] / f"job_{job.id}_scene_{sc_num}.jpg")
                audio_path = str(dirs["voiceovers"] / f"job_{job.id}_scene_{sc_num}.mp3")

                # Generate image
                media_generator.generate_scene_image(
                    prompt=sc.get("visual_prompt", job.title),
                    output_path=img_path,
                    video_type=job.video_type,
                    scene_number=sc_num,
                    title_hint=job.title
                )
                sc["image_path"] = img_path

                # Generate speech
                duration = tts_service.generate_speech(
                    text=sc.get("narration_line", ""),
                    output_path=audio_path,
                    gender="male"
                )
                sc["audio_path"] = audio_path
                sc["actual_duration"] = duration
                total_duration += duration

            job.duration_seconds = total_duration
            job.scene_data = json.dumps(scenes, ensure_ascii=False)
            db.commit()

            # Step 4: Subtitle Generation
            job.current_step = "Rendering Burned-in Telugu Subtitles"
            job.progress_percent = 60
            db.commit()

            srt_path = str(dirs["subtitles"] / f"sub_{job.id}.srt")
            ass_path = str(dirs["subtitles"] / f"sub_{job.id}.ass")
            subtitle_service.generate_subtitles(scenes, srt_path, ass_path, video_type=job.video_type)
            job.subtitle_path = ass_path
            db.commit()

            # Step 5: FFmpeg Assembly
            job.status = "assembling"
            job.current_step = "Assembling Video with Transitions & Audio Sync"
            job.progress_percent = 75
            db.commit()

            scene_clips = []
            for sc in scenes:
                sc_num = sc.get("scene_number", 1)
                scene_mp4 = str(dirs["scenes"] / f"clip_{job.id}_sc_{sc_num}.mp4")
                video_engine.assemble_scene_clip(
                    image_path=sc["image_path"],
                    audio_path=sc["audio_path"],
                    output_scene_path=scene_mp4,
                    duration=sc["actual_duration"],
                    video_type=job.video_type
                )
                scene_clips.append(scene_mp4)

            # Concatenate master video
            master_mp4 = str(dirs["rendered"] / f"final_{job.id}.mp4")
            video_engine.concatenate_scenes_and_subtitles(
                scene_clip_paths=scene_clips,
                subtitle_path=job.subtitle_path,
                final_output_path=master_mp4,
                video_type=job.video_type
            )
            job.rendered_video_path = master_mp4
            db.commit()

            # Step 6: Thumbnail Composition
            job.current_step = "Composing High-CTR Thumbnail"
            job.progress_percent = 85
            db.commit()

            thumb_path = str(dirs["thumbnails"] / f"thumb_{job.id}.jpg")
            first_scene_img = scenes[0]["image_path"] if scenes else ""
            thumbnail_service.create_thumbnail(
                base_image_path=first_scene_img,
                headline_telugu=job.title,
                category=channel.category,
                output_path=thumb_path,
                video_type=job.video_type
            )
            job.thumbnail_path = thumb_path
            db.commit()

            # Step 7: Quality Validation
            job.status = "validating"
            job.current_step = "Verifying Media Quality & Specifications"
            job.progress_percent = 90
            db.commit()

            val_res = video_engine.validate_video_file(master_mp4)
            if not val_res.get("valid"):
                raise ValueError(f"Video quality validation failed: {val_res.get('error', 'Invalid media stream')}")

            # Step 8: Automatic or Manual Publishing
            if channel.auto_publish_enabled and channel.encrypted_refresh_token and not settings.GLOBAL_EMERGENCY_PAUSE:
                job.status = "uploading"
                job.current_step = "Publishing to YouTube via Data API v3"
                job.progress_percent = 95
                db.commit()

                pub_res = youtube_service.upload_video(
                    encrypted_refresh_token=channel.encrypted_refresh_token,
                    video_path=master_mp4,
                    title=job.title,
                    description=job.description,
                    tags=job.tags,
                    category=channel.category,
                    privacy_status="public",
                    thumbnail_path=job.thumbnail_path
                )

                # Record upload in ledger to prevent any duplicate uploads
                ledger = UploadLedger(
                    channel_id=channel.id,
                    video_job_id=job.id,
                    youtube_video_id=pub_res["video_id"],
                    youtube_url=pub_res["video_url"],
                    privacy_status="public",
                    published_at=datetime.utcnow()
                )
                db.add(ledger)
                job.status = "published"
                job.current_step = "Published Successfully"
            else:
                job.status = "ready_to_upload"
                job.current_step = "Video Production Complete (Ready to Publish)"

            job.progress_percent = 100
            db.commit()
            logger.info(f"Successfully completed video production job {job.id}")
            return job

        except Exception as e:
            logger.error(f"Video production failed for job {job.id}: {e}", exc_info=True)
            job.status = "failed"
            job.error_message = str(e)
            job.current_step = f"Failed: {str(e)[:100]}"
            db.commit()
            return job

production_pipeline = ProductionPipeline()
