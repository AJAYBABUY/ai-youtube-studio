import React, { useState } from 'react';
import {
  Repeat,
  ShieldAlert,
  Power,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Channel, AutomationStatus } from '../types';

interface Props {
  channels: Channel[];
  automationStatus: AutomationStatus | null;
  onRefresh: () => void;
  onToggleEmergencyPause: () => Promise<void>;
  onToggleChannelAutomation: (channelId: string) => Promise<void>;
  onTriggerAllNow: () => Promise<void>;
}

export const Automation: React.FC<Props> = ({
  channels,
  automationStatus,
  onRefresh,
  onToggleEmergencyPause,
  onToggleChannelAutomation,
  onTriggerAllNow,
}) => {
  const [triggering, setTriggering] = useState(false);

  const handleTriggerAll = async () => {
    if (!confirm('Start immediate video generation for all enabled channels right now?')) return;
    setTriggering(true);
    try {
      await onTriggerAllNow();
      alert('All channel workflows triggered successfully!');
      onRefresh();
    } catch (err) {
      alert('Failed: ' + err);
    } finally {
      setTriggering(false);
    }
  };

  const isPaused = automationStatus?.global_emergency_pause;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Daily Automation Engine</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Autonomous background worker scheduler, emergency pause controls, and individual channel triggers.
        </p>
      </div>

      {/* Emergency Control Card */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          isPaused
            ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-500/10'
            : 'border-slate-800/80 bg-studio-900/60 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-3 shrink-0 ${
                isPaused ? 'bg-rose-500/20 text-rose-400' : 'bg-studio-800 text-slate-400'
              }`}
            >
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Global Emergency Pause
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                When activated, all background workers immediately stop triggering new generations and all automatic uploads to YouTube are blocked. Use this if you need to review assets before anything goes live.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleEmergencyPause}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shrink-0 ${
              isPaused
                ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-500'
                : 'bg-rose-600 text-white shadow-md hover:bg-rose-500'
            }`}
          >
            {isPaused ? 'Resume All Automations' : 'Activate Emergency Pause'}
          </button>
        </div>
      </div>

      {/* Quick Launch & Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scheduler Engine</span>
            <Repeat className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-3 text-lg font-bold text-white">
            {automationStatus?.scheduler_running ? 'APScheduler Active' : 'Scheduler Offline'}
          </p>
          <p className="text-xs text-emerald-400 mt-1">Polling interval: 60s</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Automated Channels</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-lg font-bold text-white">
            {channels.filter((c) => c.auto_publish_enabled).length} / {channels.length} Enabled
          </p>
          <p className="text-xs text-slate-400 mt-1">Independent schedules</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Manual Production</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <button
            onClick={handleTriggerAll}
            disabled={triggering || isPaused}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-red-500 hover:to-rose-500 disabled:opacity-50 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {triggering ? 'Triggering...' : 'Trigger All Channels Now'}
          </button>
        </div>
      </div>

      {/* Per-Channel Automation Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-4">Channel Automation Controls</h3>

        {channels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
            No channels available.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {channel.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{channel.title}</h4>
                    <p className="text-xs text-slate-400">
                      Category: {channel.category} • Schedule: {channel.schedule_time} Daily ({channel.schedule_days})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-semibold ${
                      channel.auto_publish_enabled ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {channel.auto_publish_enabled ? 'AUTOMATION ON' : 'PAUSED'}
                  </span>
                  <button
                    onClick={() => onToggleChannelAutomation(channel.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      channel.auto_publish_enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        channel.auto_publish_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

