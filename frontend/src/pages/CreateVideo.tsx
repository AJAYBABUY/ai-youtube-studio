import React, { useState } from 'react';
import {
  Sparkles,
  Tv,
  Film,
  Layers,
  Wand2,
  FileText,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Channel } from '../types';

interface Props {
  channels: Channel[];
  selectedChannelId: string;
  onLaunchJob: (data: {
    channel_id: string;
    video_type: string;
    custom_topic?: string;
    custom_script?: string;
  }) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const CreateVideo: React.FC<Props> = ({
  channels,
  selectedChannelId,
  onLaunchJob,
  onNavigate,
}) => {
  const [channelId, setChannelId] = useState(selectedChannelId || (channels[0]?.id || ''));
  const [videoType, setVideoType] = useState<'shorts' | 'long_form'>('shorts');
  const [mode, setMode] = useState<'autonomous' | 'custom_topic' | 'custom_script'>('autonomous');
  const [customTopic, setCustomTopic] = useState('');
  const [customScript, setCustomScript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      alert('Please connect or select a channel first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLaunchJob({
        channel_id: channelId,
        video_type: videoType,
        custom_topic: mode === 'custom_topic' ? customTopic : undefined,
        custom_script: mode === 'custom_script' ? customScript : undefined,
      });
      onNavigate('dashboard');
    } catch (err) {
      alert('Error initiating production: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Create Video Production</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure video format and let AI assemble visuals, voiceover, burned-in subtitles, and metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Channel */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <label className="block text-sm font-bold text-white mb-2">1. Select Target Channel *</label>
          {channels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center">
              <p className="text-xs text-slate-400">No channels added yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('channels')}
                className="mt-2 text-xs font-semibold text-red-400 hover:underline"
              >
                + Add YouTube Channel First
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => setChannelId(ch.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    channelId === ch.id
                      ? 'border-red-500 bg-red-500/10 shadow-md shadow-red-500/10'
                      : 'border-slate-800 bg-studio-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {ch.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate">{ch.title}</p>
                      <p className="text-xs text-slate-400">{ch.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Choose Video Profile */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <label className="block text-sm font-bold text-white mb-3">2. Select Production Profile *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shorts */}
            <div
              onClick={() => setVideoType('shorts')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                videoType === 'shorts'
                  ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                  : 'border-slate-800 bg-studio-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-red-600/20 px-2.5 py-1 text-xs font-bold text-red-400">
                  9:16 VERTICAL
                </span>
                <span className="text-xs text-slate-400 font-mono">1080 × 1920</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">YouTube Shorts Profile</h3>
              <p className="text-xs text-slate-400 mt-1">
                30–60 seconds fast-paced visual storytelling, high curiosity hook in first 3 seconds, natural Telugu narration, and viral burned-in subtitles.
              </p>
            </div>

            {/* Long-form */}
            <div
              onClick={() => setVideoType('long_form')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                videoType === 'long_form'
                  ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                  : 'border-slate-800 bg-studio-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs font-bold text-blue-400">
                  16:9 HORIZONTAL
                </span>
                <span className="text-xs text-slate-400 font-mono">1920 × 1080</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">Standard Long-Form Video</h3>
              <p className="text-xs text-slate-400 mt-1">
                Comprehensive narrative progression, multiple visual scenes, in-depth Telugu documentary voiceover, transitions, and high-CTR thumbnail.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Content Mode */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
          <label className="block text-sm font-bold text-white mb-3">3. Production Input Strategy</label>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode('autonomous')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                mode === 'autonomous'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-studio-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              100% Autonomous (AI Decides Topic)
            </button>
            <button
              type="button"
              onClick={() => setMode('custom_topic')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                mode === 'custom_topic'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'bg-studio-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Custom Idea / Prompt
            </button>
            <button
              type="button"
              onClick={() => setMode('custom_script')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                mode === 'custom_script'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'bg-studio-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Custom Telugu Script
            </button>
          </div>

          {mode === 'autonomous' && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-xs text-purple-300">
              <p className="font-semibold">Autonomous Production Mode Active</p>
              <p className="mt-1 text-purple-300/80">
                AI YouTube Studio will automatically research today's top trending topic in the channel's category, write a natural conversational Telugu script, generate images, synthesize neural narration, and assemble the final MP4.
              </p>
            </div>
          )}

          {mode === 'custom_topic' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Enter Your Topic / Idea:</label>
              <input
                type="text"
                placeholder="e.g. చంద్రుడిపై నీరు ఎలా కనుగొన్నారు? or The Mystery of the Bermuda Triangle"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                required
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          )}

          {mode === 'custom_script' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Paste Full Telugu Narration Script:</label>
              <textarea
                rows={5}
                placeholder="మీ తెలుగు స్క్రిప్ట్‌ను ఇక్కడ పేస్ట్ చేయండి..."
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                required
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none font-['Noto_Sans_Telugu']"
              />
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !channelId}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-red-600/30 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            {isSubmitting ? 'Starting Production Pipeline...' : 'Generate & Assemble Video Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

