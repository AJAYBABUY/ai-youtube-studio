import React from 'react';
import { ShieldAlert, AlertTriangle, Play, Pause, Activity } from 'lucide-react';
import { Channel } from '../../types';

interface HeaderProps {
  title: string;
  channels: Channel[];
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
  isEmergencyPaused: boolean;
  onToggleEmergencyPause: () => void;
  ffmpegAvailable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  channels,
  selectedChannelId,
  setSelectedChannelId,
  isEmergencyPaused,
  onToggleEmergencyPause,
  ffmpegAvailable,
}) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800/80 bg-studio-950/80 px-6 backdrop-blur-md">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-white capitalize">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Channel quick filter */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:inline">Active Channel:</span>
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="rounded-lg bg-studio-900 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-red-500 focus:outline-none"
          >
            <option value="">All Channels ({channels.length})</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.category})
              </option>
            ))}
          </select>
        </div>

        {/* FFmpeg Indicator */}
        <div
          title={ffmpegAvailable ? 'FFmpeg Video Assembly Ready' : 'FFmpeg not detected'}
          className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-800 bg-studio-900/60 px-2.5 py-1 text-xs text-slate-300"
        >
          <Activity className={`h-3 w-3 ${ffmpegAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span>FFmpeg: {ffmpegAvailable ? 'Ready' : 'Missing'}</span>
        </div>

        {/* Global Emergency Pause Control */}
        <button
          onClick={onToggleEmergencyPause}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-md ${
            isEmergencyPaused
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
              : 'bg-studio-900 border border-slate-700 text-slate-300 hover:border-rose-500/60 hover:text-rose-400'
          }`}
        >
          {isEmergencyPaused ? (
            <>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>EMERGENCY PAUSED</span>
              <span className="underline ml-1 text-[11px]">Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5 text-slate-400" />
              <span>Emergency Pause</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

