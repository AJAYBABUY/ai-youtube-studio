export interface Channel {
  id: string;
  youtube_channel_id?: string;
  title: string;
  custom_url?: string;
  description?: string;
  thumbnail_url?: string;
  is_active: boolean;
  auto_publish_enabled: boolean;
  category: string;
  video_type_preference: 'shorts' | 'long_form' | 'mixed';
  schedule_time: string;
  schedule_days: string;
  has_oauth_connected: boolean;
  total_videos_created: number;
  total_videos_published: number;
  created_at: string;
  updated_at: string;
}

export interface ContentPlan {
  id: string;
  channel_id: string;
  category: string;
  target_format: 'shorts' | 'long_form';
  topic: string;
  english_topic?: string;
  hook?: string;
  research_summary?: string;
  factual_claims?: string;
  sources_and_references?: string;
  audience_relevance_score: number;
  status: 'planned' | 'generating' | 'completed' | 'discarded';
  created_at: string;
}

export interface VideoJob {
  id: string;
  channel_id: string;
  channel_title?: string;
  content_plan_id?: string;
  video_type: 'shorts' | 'long_form';
  title: string;
  description?: string;
  tags?: string;
  script_telugu?: string;
  scene_data?: string;
  thumbnail_path?: string;
  subtitle_path?: string;
  rendered_video_path?: string;
  duration_seconds: number;
  status: 'pending' | 'researching' | 'scripting' | 'generating_media' | 'assembling' | 'validating' | 'ready_to_upload' | 'uploading' | 'published' | 'failed';
  progress_percent: number;
  current_step: string;
  error_message?: string;
  retry_count: number;
  youtube_video_id?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderStatus {
  name: string;
  type: string;
  is_active: boolean;
  is_free_tier: boolean;
  status: 'connected' | 'ready' | 'unconfigured' | 'error';
  quota_info?: string;
  last_error?: string;
}

export interface SystemHealth {
  status: string;
  ffmpeg_available: boolean;
  ffmpeg_version?: string;
  active_channels: number;
  pending_jobs: number;
  emergency_paused: boolean;
  providers: ProviderStatus[];
}

export interface AutomationStatus {
  scheduler_running: boolean;
  global_emergency_pause: boolean;
  total_active_channels: number;
  auto_enabled_channels: number;
  active_jobs_running: number;
}

export interface UsageSummary {
  total_spend_usd: number;
  daily_spend_usd: number;
  monthly_spend_usd: number;
  spend_limit_usd: number;
  free_tier_only: boolean;
  total_requests: number;
  history: Array<{
    id: string;
    provider: string;
    operation: string;
    cost_usd: number;
    tokens: number;
    date: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  channel_title: string;
  type: string;
  status: 'published' | 'scheduled';
  date: string;
  youtube_url?: string;
}

