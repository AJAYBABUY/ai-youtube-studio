import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Shield,
  Folder,
  Database,
  Activity,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0.0);
  const [preferFree, setPreferFree] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettingsData(data);
      setDailyLimit(data.daily_spend_limit_usd || 0.0);
      setPreferFree(data.prefer_free_tiers ?? true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload: any = {
        daily_spend_limit_usd: dailyLimit,
        prefer_free_tiers: preferFree,
      };
      if (geminiKey.trim()) payload.gemini_api_key = geminiKey.trim();
      if (clientId.trim()) payload.google_client_id = clientId.trim();
      if (clientSecret.trim()) payload.google_client_secret = clientSecret.trim();

      await api.updateSettings(payload);
      setMessage('Settings updated successfully!');
      setGeminiKey('');
      setClientId('');
      setClientSecret('');
      loadSettings();
    } catch (err) {
      alert('Failed to save settings: ' + err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">System Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          API credentials, Google OAuth 2.0 client keys, spending guardrails, and media paths.
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Credentials */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-bold text-white">AI & YouTube Credentials</h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Google Gemini API Key (Supports Free Tier)
              </label>
              <span className="text-[11px] text-slate-400">
                Status: {settingsData?.has_gemini_key ? 'Configured ✅' : 'Using Free Curated Fallback'}
              </span>
            </div>
            <input
              type="password"
              placeholder={settingsData?.has_gemini_key ? '••••••••••••••••••••••••' : 'Enter AI Studio Gemini API Key'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Cloud OAuth Client ID
              </label>
              <input
                type="text"
                placeholder={settingsData?.has_google_oauth ? 'OAuth configured' : 'apps.googleusercontent.com'}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Cloud OAuth Client Secret
              </label>
              <input
                type="password"
                placeholder={settingsData?.has_google_oauth ? '••••••••' : 'Client secret'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cost & Guardrails */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Cost Guardrails & Limits</h3>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-studio-950/60 p-3.5 border border-slate-800/60">
            <div>
              <p className="text-xs font-semibold text-white">Prefer Free Services</p>
              <p className="text-[11px] text-slate-400">
                Always prioritize Edge-TTS, Pollinations, and Gemini free quotas before any paid requests.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferFree}
              onChange={(e) => setPreferFree(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-red-600 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Daily Spend Limit ($ USD)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseFloat(e.target.value) || 0)}
              className="w-48 rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Set to 0.00 for strict $0 free-only mode.</p>
          </div>
        </div>

        {/* System & Storage Environment */}
        <div className="rounded-2xl border border-slate-800/80 bg-studio-900/60 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">System Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-studio-950/60 p-3 border border-slate-800/60">
              <span className="text-slate-400 block mb-1">FFmpeg Binary:</span>
              <span className="font-mono text-slate-200 truncate block">
                {settingsData?.ffmpeg?.ffmpeg_version || 'Detecting...'}
              </span>
            </div>

            <div className="rounded-xl bg-studio-950/60 p-3 border border-slate-800/60">
              <span className="text-slate-400 block mb-1">Media Storage Directory:</span>
              <span className="font-mono text-slate-200 truncate block">
                {settingsData?.media_data_dir || 'data/channels'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

