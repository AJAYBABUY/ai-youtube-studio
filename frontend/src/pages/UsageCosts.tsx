import React from 'react';
import { DollarSign, ShieldCheck, BarChart3, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { UsageSummary } from '../types';

interface Props {
  summary: UsageSummary | null;
  onRefresh: () => void;
}

export const UsageCosts: React.FC<Props> = ({ summary, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Usage & Cost Guardrails</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time expense tracking, free-tier enforcement, and spend protection limits.
        </p>
      </div>

      {/* Spend Protection Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Spend</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              ${(summary?.daily_spend_usd || 0).toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">USD</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Limit: ${summary?.spend_limit_usd.toFixed(2) || '0.00'}</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Spend</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              ${(summary?.monthly_spend_usd || 0).toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">USD</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Free tier quota prioritized</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Operations</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {summary?.total_requests || 0}
            </span>
            <span className="text-xs text-slate-400">requests</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Audio, images, research</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cost Protection</span>
          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="text-base font-bold text-emerald-400">Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Zero-spend mode enforced</p>
        </div>
      </div>

      {/* Advisory Callout */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-200 text-sm mb-1">
          <AlertTriangle className="h-4 w-4" />
          Google AI Pro Subscription vs API Access Clarification
        </div>
        Please note that a consumer <span className="font-semibold text-white">Google One / Google AI Pro</span> consumer web subscription does <span className="font-semibold text-white">not</span> provide paid YouTube Data API or Gemini developer API credits. Developer API access is provisioned separately via Google AI Studio and Google Cloud Console, both of which offer generous free quotas. AI YouTube Studio will never silently consume paid quotas.
      </div>

      {/* Recent API Call Log */}
      <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-4">Operations & Usage Ledger</h3>
        {summary?.history && summary.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Operation</th>
                  <th className="pb-3 font-medium">Tokens / Units</th>
                  <th className="pb-3 font-medium">Cost</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.history.map((item) => (
                  <tr key={item.id} className="hover:bg-studio-800/30">
                    <td className="py-3 font-semibold text-slate-200">{item.provider}</td>
                    <td className="py-3 text-slate-400">{item.operation}</td>
                    <td className="py-3 text-slate-300 font-mono">{item.tokens}</td>
                    <td className="py-3 text-emerald-400 font-semibold">${item.cost_usd.toFixed(4)}</td>
                    <td className="py-3 text-right text-slate-400">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No paid usage logged. Free providers were used for all generated operations.
          </p>
        )}
      </div>
    </div>
  );
};

