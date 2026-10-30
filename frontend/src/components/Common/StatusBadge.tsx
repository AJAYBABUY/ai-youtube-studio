import React from 'react';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    pending: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
    researching: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400 animate-pulse', label: 'Researching' },
    scripting: { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400', dot: 'bg-indigo-400 animate-pulse', label: 'Scripting' },
    generating_media: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400 animate-pulse', label: 'Generating Media' },
    assembling: { bg: 'bg-pink-500/10 border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-400 animate-pulse', label: 'FFmpeg Assembly' },
    validating: { bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400 animate-pulse', label: 'Validating' },
    ready_to_upload: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Ready to Publish' },
    uploading: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400 animate-ping', label: 'Uploading to YouTube' },
    published: { bg: 'bg-emerald-600/20 border-emerald-500/40', text: 'text-emerald-300 font-semibold', dot: 'bg-emerald-400', label: 'Published' },
    failed: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500', label: 'Failed' },
    connected: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Connected' },
    ready: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Ready' },
    unconfigured: { bg: 'bg-slate-700/30 border-slate-600/40', text: 'text-slate-400', dot: 'bg-slate-500', label: 'Needs Setup' },
    error: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500', label: 'Error' },
  };

  const current = map[status] || { bg: 'bg-slate-800 border-slate-700', text: 'text-slate-300', dot: 'bg-slate-400', label: status };
  const pad = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${pad} font-medium tracking-wide`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

