import React from 'react';
import { Calendar as CalendarIcon, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
}

export const PublishingCalendar: React.FC<Props> = ({ events }) => {
  const publishedEvents = events.filter((e) => e.status === 'published');
  const scheduledEvents = events.filter((e) => e.status === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Publishing Calendar</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track confirmed YouTube publications and upcoming autonomous video schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Scheduled Queue */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Projected Publishing Schedule</h3>
          </div>

          {scheduledEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
              No upcoming scheduled videos. Enable automation on your channels to activate daily publishing slots.
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledEvents.map((evt) => {
                const dateObj = new Date(evt.date);
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-xl bg-studio-950/60 border border-slate-800/60 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-purple-400">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{evt.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {evt.channel_title} •{' '}
                          <span className="text-purple-300 font-mono">
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-studio-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                      {evt.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmed Published Uploads */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Published YouTube Uploads</h3>
          </div>

          {publishedEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
              No videos published to YouTube yet.
            </div>
          ) : (
            <div className="space-y-3">
              {publishedEvents.map((evt) => {
                const dateObj = new Date(evt.date);
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-xl bg-studio-950/60 border border-slate-800/60 p-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-emerald-400">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-slate-400">{evt.channel_title}</p>
                      </div>
                    </div>

                    {evt.youtube_url && (
                      <a
                        href={evt.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600/20 border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-600/30 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Watch
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

