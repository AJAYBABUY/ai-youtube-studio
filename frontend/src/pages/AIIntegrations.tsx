import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { SystemHealth } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';

interface Props {
  health: SystemHealth | null;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
}

export const AIIntegrations: React.FC<Props> = ({ health, onRefresh, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">AI Integrations & Adapters</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular provider status, free tier quotas, and interchangeable Telugu AI processing engines.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl bg-studio-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-studio-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking...' : 'Recheck Connections'}
        </button>
      </div>

      {/* Free Tier Preferred Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-4 text-emerald-300">
        <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-emerald-200">Free-Tier First Architecture Enabled</h3>
          <p className="text-xs text-emerald-300/80 mt-1 leading-relaxed">
            AI YouTube Studio uses 100% free high-quality engines by default: Microsoft Edge Neural TTS (with natural Telugu voices like <span className="font-mono font-bold">te-IN-MohanNeural</span>), Pollinations FLUX image generation, and local FFmpeg video assembly. Gemini API free-tier quotas are prioritized for text generation and research.
          </p>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {health?.providers.map((p) => (
          <div
            key={p.name}
            className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="rounded-md bg-studio-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {p.type}
                </span>
                <StatusBadge status={p.status} />
              </div>

              <h3 className="text-base font-bold text-white">{p.name}</h3>

              {p.quota_info && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                  <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{p.quota_info}</span>
                </div>
              )}

              {p.last_error && (
                <div className="mt-3 rounded-xl bg-studio-950/80 border border-slate-800/60 p-3 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold block mb-0.5">Configuration Note:</span>
                  {p.last_error}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400">
                {p.is_free_tier ? '100% Free / Free Quota' : 'Paid Tier'}
              </span>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

