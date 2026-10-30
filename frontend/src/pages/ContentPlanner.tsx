import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen,
} from 'lucide-react';
import { Channel, ContentPlan } from '../types';

interface Props {
  channels: Channel[];
  plans: ContentPlan[];
  selectedChannelId: string;
  onRefresh: () => void;
  onTriggerResearch: (channelId: string, category: string, format: string) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
  onCreateVideoFromPlan: (channelId: string, planId: string, videoType: string) => void;
}

export const ContentPlanner: React.FC<Props> = ({
  channels,
  plans,
  selectedChannelId,
  onRefresh,
  onTriggerResearch,
  onDeletePlan,
  onCreateVideoFromPlan,
}) => {
  const [activeChannel, setActiveChannel] = useState(selectedChannelId || (channels[0]?.id || ''));
  const [category, setCategory] = useState('Technology');
  const [format, setFormat] = useState('shorts');
  const [loading, setLoading] = useState(false);

  const filteredPlans = plans.filter((p) => !activeChannel || p.channel_id === activeChannel);

  const handleResearch = async () => {
    if (!activeChannel) {
      alert('Please select a channel first');
      return;
    }
    setLoading(true);
    try {
      await onTriggerResearch(activeChannel, category, format);
      onRefresh();
    } catch (err) {
      alert('Research failed: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">AI Content Strategy Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomously research Telugu topics, verify factual claims, and score audience relevance.
          </p>
        </div>

        {/* Trigger Generator Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeChannel}
            onChange={(e) => setActiveChannel(e.target.value)}
            className="rounded-xl bg-studio-900 border border-slate-800 px-3 py-2 text-xs font-medium text-slate-200 focus:border-red-500 focus:outline-none"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.category})
              </option>
            ))}
          </select>

          <button
            onClick={handleResearch}
            disabled={loading || !activeChannel}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'AI Researching...' : 'Autonomous AI Research'}
          </button>
        </div>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-studio-900/40 py-16 px-6 text-center">
          <div className="rounded-2xl bg-purple-500/10 p-5 text-purple-400 mb-4">
            <BrainCircuit className="h-10 w-10" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Content Plans Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md">
            Click "Autonomous AI Research" above to let AI analyze audience curiosity, check verified facts, and generate high-potential Telugu topics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredPlans.map((plan) => {
            let claims: string[] = [];
            let sources: string[] = [];
            try {
              if (plan.factual_claims) claims = JSON.parse(plan.factual_claims);
              if (plan.sources_and_references) sources = JSON.parse(plan.sources_and_references);
            } catch {
              // ignore parse errors
            }

            return (
              <div
                key={plan.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm hover:border-purple-500/40 transition-all"
              >
                <div>
                  {/* Category, Format & Audience Score */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                        {plan.category}
                      </span>
                      <span className="rounded-md bg-studio-800 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-300">
                        {plan.target_format}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      <span>Viral Score: {plan.audience_relevance_score}/10</span>
                    </div>
                  </div>

                  {/* Telugu Topic Title */}
                  <h3 className="mt-4 text-lg font-bold text-white leading-snug font-['Noto_Sans_Telugu']">
                    {plan.topic}
                  </h3>

                  {plan.english_topic && (
                    <p className="text-xs text-slate-400 mt-1 font-sans italic">{plan.english_topic}</p>
                  )}

                  {/* Hook preview */}
                  {plan.hook && (
                    <div className="mt-3 rounded-xl bg-studio-950/60 border border-slate-800/60 p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Opening 3-Second Hook
                      </span>
                      <p className="text-xs text-slate-200 mt-1 font-['Noto_Sans_Telugu']">
                        "{plan.hook}"
                      </p>
                    </div>
                  )}

                  {/* Verified Claims */}
                  {claims.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        Verified Factual Claims
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
                        {claims.slice(0, 3).map((claim, idx) => (
                          <li key={idx} className="truncate">
                            {claim}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sources */}
                  {sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-studio-800/80 px-2 py-0.5 text-[10px] text-slate-400 flex items-center gap-1"
                        >
                          <BookOpen className="h-2.5 w-2.5 text-slate-500" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Discard plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onCreateVideoFromPlan(plan.channel_id, plan.id, plan.target_format)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-rose-500 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Produce This Video
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

