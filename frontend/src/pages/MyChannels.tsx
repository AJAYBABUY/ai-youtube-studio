import React, { useState } from 'react';
import {
  Tv,
  Plus,
  Settings2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Power,
  Clock,
  Sparkles,
  Link,
} from 'lucide-react';
import { Channel } from '../types';
import { Modal } from '../components/Common/Modal';

interface Props {
  channels: Channel[];
  onRefresh: () => void;
  onConnectGoogleOAuth: (channelId?: string) => void;
  onUpdateChannel: (id: string, data: Partial<Channel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onDisconnectChannel: (id: string) => Promise<void>;
}

const CATEGORIES = [
  'Technology',
  'Serious Facts',
  'Science',
  'History',
  'Education',
  'Current Affairs',
  'General Knowledge',
  'Kids Stories',
  'Entertainment',
];

export const MyChannels: React.FC<Props> = ({
  channels,
  onRefresh,
  onConnectGoogleOAuth,
  onUpdateChannel,
  onDeleteChannel,
  onDisconnectChannel,
}) => {
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [newFormat, setNewFormat] = useState<'shorts' | 'long_form' | 'mixed'>('shorts');
  const [newTime, setNewTime] = useState('10:00');

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          video_type_preference: newFormat,
          schedule_time: newTime,
          auto_publish_enabled: false,
        }),
      });
      setIsCreateOpen(false);
      setNewTitle('');
      onRefresh();
    } catch (err) {
      alert('Failed to create channel: ' + err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    try {
      await onUpdateChannel(editingChannel.id, {
        title: editingChannel.title,
        category: editingChannel.category,
        video_type_preference: editingChannel.video_type_preference,
        schedule_time: editingChannel.schedule_time,
        schedule_days: editingChannel.schedule_days,
        auto_publish_enabled: editingChannel.auto_publish_enabled,
      });
      setEditingChannel(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update channel: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Channel Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect, configure, and isolate content strategies for each Telugu YouTube channel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onConnectGoogleOAuth()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all"
          >
            <Link className="h-4 w-4" />
            Connect via Google OAuth
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-studio-900 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-studio-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Channel Manually
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-studio-900/40 py-16 px-6 text-center">
          <div className="rounded-2xl bg-red-500/10 p-5 text-red-500 mb-4">
            <Tv className="h-10 w-10" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No YouTube Channels Connected</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md">
            Click "Connect via Google OAuth" to link your YouTube channel with official Data API v3 upload permissions, or add a channel profile manually.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onConnectGoogleOAuth()}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all"
            >
              Connect Google Account
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-studio-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-studio-700 transition-colors"
            >
              Add Channel Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm hover:border-slate-700/80 transition-all"
            >
              <div>
                {/* Channel Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {channel.thumbnail_url ? (
                      <img
                        src={channel.thumbnail_url}
                        alt={channel.title}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-red-500/30"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-amber-600 font-bold text-white shadow-md">
                        {channel.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-white truncate">{channel.title}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {channel.custom_url || channel.youtube_channel_id || 'ID: ' + channel.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      channel.has_oauth_connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {channel.has_oauth_connected ? 'OAuth Linked' : 'No OAuth'}
                  </span>
                </div>

                {/* Badges & Category */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-studio-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                    📂 {channel.category}
                  </span>
                  <span className="rounded-lg bg-studio-800 px-2.5 py-1 text-xs font-medium text-slate-300 uppercase">
                    🎬 {channel.video_type_preference}
                  </span>
                  <span className="rounded-lg bg-studio-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                    ⏰ {channel.schedule_time} Daily
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-studio-950/60 p-3 border border-slate-800/60 text-center">
                  <div>
                    <span className="block text-lg font-bold text-white">{channel.total_videos_created}</span>
                    <span className="text-[11px] text-slate-400">Created</span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-emerald-400">{channel.total_videos_published}</span>
                    <span className="text-[11px] text-slate-400">Published</span>
                  </div>
                </div>

                {/* Automation Toggle */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-studio-950/40 p-3 border border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <Power
                      className={`h-4 w-4 ${channel.auto_publish_enabled ? 'text-emerald-400' : 'text-slate-500'}`}
                    />
                    <span className="text-xs font-medium text-slate-300">Daily Automation</span>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateChannel(channel.id, {
                        auto_publish_enabled: !channel.auto_publish_enabled,
                      })
                    }
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

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingChannel(channel)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-studio-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-studio-700 hover:text-white transition-colors"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Settings
                  </button>
                  {!channel.has_oauth_connected ? (
                    <button
                      onClick={() => onConnectGoogleOAuth(channel.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1.5 text-xs font-medium hover:bg-red-600/30 transition-colors"
                    >
                      <Link className="h-3.5 w-3.5" />
                      Authorize
                    </button>
                  ) : (
                    <button
                      onClick={() => onDisconnectChannel(channel.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                      title="Disconnect OAuth tokens"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete channel "${channel.title}"?`)) {
                      onDeleteChannel(channel.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  title="Delete Channel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Channel Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Telugu YouTube Channel">
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Channel Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Telugu Tech Facts, Telugu Science Insights"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Content Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Video Format *</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as any)}
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
              >
                <option value="shorts">YouTube Shorts (9:16)</option>
                <option value="long_form">Long-form (16:9)</option>
                <option value="mixed">Mixed (Both)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Daily Publishing Time (24h)</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition-colors"
            >
              Save Channel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Channel Settings Modal */}
      {editingChannel && (
        <Modal
          isOpen={Boolean(editingChannel)}
          onClose={() => setEditingChannel(null)}
          title={`Configure: ${editingChannel.title}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Channel Name</label>
              <input
                type="text"
                required
                value={editingChannel.title}
                onChange={(e) => setEditingChannel({ ...editingChannel, title: e.target.value })}
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content Category</label>
                <select
                  value={editingChannel.category}
                  onChange={(e) => setEditingChannel({ ...editingChannel, category: e.target.value })}
                  className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Format Profile</label>
                <select
                  value={editingChannel.video_type_preference}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      video_type_preference: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                >
                  <option value="shorts">YouTube Shorts (9:16)</option>
                  <option value="long_form">Long-form (16:9)</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Daily Schedule Time</label>
                <input
                  type="time"
                  value={editingChannel.schedule_time}
                  onChange={(e) => setEditingChannel({ ...editingChannel, schedule_time: e.target.value })}
                  className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Schedule Days</label>
                <input
                  type="text"
                  placeholder="mon,tue,wed,thu,fri,sat,sun"
                  value={editingChannel.schedule_days}
                  onChange={(e) => setEditingChannel({ ...editingChannel, schedule_days: e.target.value })}
                  className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

