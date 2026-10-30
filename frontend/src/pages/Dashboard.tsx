import React from 'react';
import {
  Tv,
  Film,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { Channel, VideoJob, SystemHealth, AutomationStatus } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';

interface Props {
  channels: Channel[];
  jobs: VideoJob[];
  systemHealth: SystemHealth | null;
  automationStatus: AutomationStatus | null;
  onNavigate: (tab: string) => void;
  onSelectVideo: (job: VideoJob) => void;
  onRetryJob: (id: string) => void;
}

export const Dashboard: React.FC<Props> = ({
  channels,
  jobs,
  systemHealth,
  automationStatus,
  onNavigate,
  onSelectVideo,
  onRetryJob,
}) => {
  const publishedCount = jobs.filter((j) => j.status === 'published').length;
  const pendingCount = jobs.filter((j) =>
    ['pending', 'researching', 'scripting', 'generating_media', 'assembling', 'validating', 'uploading'].includes(j.status)
  ).length;
  const readyCount = jobs.filter((j) => j.status === 'ready_to_upload').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  const activeJob = jobs.find((j) =>
    ['researching', 'scripting', 'generating_media', 'assembling', 'validating', 'uploading'].includes(j.status)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner if Emergency Paused */}
      {automationStatus?.global_emergency_pause && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Global Emergency Pause Active</p>
              <p className="text-xs text-rose-400/80">All scheduled automated publishing is currently halted.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('automation')}
            className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 transition-colors"
          >
            Manage in Automation
          </button>
        </div>
      )}

      {/* Hero Welcome & Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connected Channels</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Tv className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{channels.length}</span>
            <span className="text-xs text-slate-400 font-medium">channels</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {channels.filter((c) => c.auto_publish_enabled).length} automated daily
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Videos Published</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{publishedCount}</span>
            <span className="text-xs text-emerald-400 font-medium font-mono">Live</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Official YouTube Data API v3</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{pendingCount}</span>
            <span className="text-xs text-purple-400 font-medium">in queue</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{readyCount} ready to publish</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Generated</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <Film className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{jobs.length}</span>
            <span className="text-xs text-slate-400 font-medium">productions</span>
          </div>
          <p className="mt-1 text-xs text-rose-400">{failedCount} failed jobs</p>
        </div>
      </div>

      {/* Active Pipeline Progress Tracker */}
      {activeJob && (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-studio-900/60 to-studio-950 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Live Production In Progress
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-white truncate max-w-xl">
                {activeJob.title || 'Autonomously researching topic...'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Channel: <span className="text-slate-200 font-medium">{activeJob.channel_title}</span> • Format:{' '}
                <span className="uppercase text-slate-200 font-semibold">{activeJob.video_type}</span>
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-purple-400">{activeJob.progress_percent}%</span>
              <span className="text-xs font-medium text-slate-400">{activeJob.current_step}</span>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-studio-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-500"
              style={{ width: `${Math.max(activeJob.progress_percent, 5)}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: Recent Productions & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Productions Table (2 columns wide) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Video Productions</h3>
              <p className="text-xs text-slate-400">Live progress & published YouTube assets</p>
            </div>
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-rose-500 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              New Video
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-2xl bg-studio-800/60 p-4 text-slate-500 mb-3">
                <Film className="h-8 w-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">No video productions yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Connect a channel and click "New Video" to autonomously generate Telugu YouTube Shorts or long-form videos.
              </p>
              <button
                onClick={() => onNavigate('create')}
                className="mt-4 rounded-xl bg-studio-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-studio-700 transition-colors"
              >
                Create Your First Video
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-medium">Video Title</th>
                    <th className="pb-3 font-medium">Channel</th>
                    <th className="pb-3 font-medium">Format</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {jobs.slice(0, 7).map((job) => (
                    <tr key={job.id} className="hover:bg-studio-800/40 transition-colors">
                      <td className="py-3 font-medium text-slate-200 max-w-[220px] truncate">
                        {job.title || 'Autonomous Generation...'}
                      </td>
                      <td className="py-3 text-slate-400">{job.channel_title}</td>
                      <td className="py-3">
                        <span className="rounded bg-studio-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                          {job.video_type}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.rendered_video_path && (
                            <button
                              onClick={() => onSelectVideo(job)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-studio-800 hover:text-white transition-colors"
                              title="Preview Rendered Video"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {job.youtube_url && (
                            <a
                              href={job.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Open on YouTube"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {job.status === 'failed' && (
                            <button
                              onClick={() => onRetryJob(job.id)}
                              className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/20 transition-colors"
                              title="Retry Job"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Launch & Channel Status (1 column wide) */}
        <div className="space-y-6">
          {/* Channel Overview Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Your Channels</h3>
              <button
                onClick={() => onNavigate('channels')}
                className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
              >
                Manage <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {channels.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center">
                <p className="text-xs text-slate-400">No channels added yet.</p>
                <button
                  onClick={() => onNavigate('channels')}
                  className="mt-2 text-xs font-semibold text-red-400 hover:underline"
                >
                  + Add YouTube Channel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {channels.slice(0, 4).map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between rounded-xl bg-studio-950/60 border border-slate-800/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-600/20 flex items-center justify-center font-bold text-red-400 text-xs shrink-0">
                        {ch.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate max-w-[140px]">
                        <p className="text-xs font-semibold text-slate-200 truncate">{ch.title}</p>
                        <p className="text-[10px] text-slate-400">{ch.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ch.auto_publish_enabled ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                        title={ch.auto_publish_enabled ? 'Daily Automation ON' : 'Automation OFF'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Providers Live Status Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">AI Provider Health</h3>
              <button
                onClick={() => onNavigate('integrations')}
                className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
              >
                Inspect <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {systemHealth?.providers.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[170px]">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

