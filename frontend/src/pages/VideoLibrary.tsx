import React, { useState } from 'react';
import {
  Film,
  Play,
  Download,
  ExternalLink,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Channel, VideoJob } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { getMediaAssetUrl } from '../services/api';

interface Props {
  channels: Channel[];
  libraryVideos: any[];
  selectedChannelId: string;
  onRefresh: () => void;
  onSelectVideo: (job: any) => void;
  onPublishVideo: (id: string) => Promise<void>;
}

export const VideoLibrary: React.FC<Props> = ({
  channels,
  libraryVideos,
  selectedChannelId,
  onRefresh,
  onSelectVideo,
  onPublishVideo,
}) => {
  const [filterChannel, setFilterChannel] = useState(selectedChannelId || '');
  const [formatFilter, setFormatFilter] = useState<'all' | 'shorts' | 'long_form'>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filtered = libraryVideos.filter((v) => {
    if (filterChannel && v.channel_id !== filterChannel) return false;
    if (formatFilter !== 'all' && v.video_type !== formatFilter) return false;
    return true;
  });

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await onPublishVideo(id);
      alert('Video published successfully!');
      onRefresh();
    } catch (err) {
      alert('Upload failed: ' + err);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Video Production Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse all rendered media assets, burned-in subtitle outputs, thumbnails, and YouTube publications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="rounded-xl bg-studio-900 border border-slate-800 px-3 py-2 text-xs font-medium text-slate-200 focus:border-red-500 focus:outline-none"
          >
            <option value="">All Channels</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="rounded-xl bg-studio-900 border border-slate-800 px-3 py-2 text-xs font-medium text-slate-200 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="shorts">Shorts (9:16)</option>
            <option value="long_form">Long-form (16:9)</option>
          </select>
        </div>
      </div>

      {/* Video Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-studio-900/40 py-16 px-6 text-center">
          <div className="rounded-2xl bg-studio-800 p-4 text-slate-500 mb-3">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Rendered Videos in Library</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Generated videos will appear here once FFmpeg completes assembly and validation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-studio-900/60 shadow-sm hover:border-slate-700 hover:shadow-lg transition-all"
            >
              <div>
                {/* Thumbnail Image Container */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className={`relative cursor-pointer overflow-hidden bg-black ${video.video_type === 'shorts' ? 'aspect-[9/12]' : 'aspect-video'
                    }`}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={getMediaAssetUrl(video.thumbnail_url)}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-studio-950 text-slate-600">
                      <Film className="h-10 w-10" />
                    </div>
                  )}

                  {/* Play overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Format Pill */}
                  <span className="absolute top-2.5 left-2.5 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {video.video_type}
                  </span>

                  {/* Duration Pill */}
                  {video.duration_seconds > 0 && (
                    <span className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-200 backdrop-blur-sm">
                      {Math.floor(video.duration_seconds / 60)}:
                      {Math.floor(video.duration_seconds % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      {video.channel_title}
                    </span>
                    <StatusBadge status={video.status} />
                  </div>

                  <h3
                    onClick={() => onSelectVideo(video)}
                    className="cursor-pointer text-sm font-bold text-white leading-snug line-clamp-2 hover:text-red-400 transition-colors font-['Noto_Sans_Telugu']"
                  >
                    {video.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => onSelectVideo(video)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  Watch
                </button>

                <div className="flex items-center gap-2">
                  {video.stream_url && (
                    <a
                      href={getMediaAssetUrl(video.stream_url)}
                      download
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-studio-800 hover:text-white transition-colors"
                      title="Download MP4"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}

                  {video.youtube_url ? (
                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : video.status === 'ready_to_upload' ? (
                    <button
                      onClick={() => handlePublish(video.id)}
                      disabled={publishingId === video.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {publishingId === video.id ? 'Publishing...' : 'Publish'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

