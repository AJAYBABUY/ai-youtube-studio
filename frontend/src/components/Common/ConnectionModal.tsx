import React, { useState } from 'react';
import { Modal } from './Modal';
import { Key, Globe, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api, getApiBaseUrl } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const currentKey = localStorage.getItem('studio_access_key') || '';
  const currentUrl = localStorage.getItem('studio_backend_url') || '';

  const [accessKey, setAccessKey] = useState(currentKey);
  const [backendUrl, setBackendUrl] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      // Temporarily store to test with current settings
      if (backendUrl.trim()) {
        localStorage.setItem('studio_backend_url', backendUrl.trim());
      } else {
        localStorage.removeItem('studio_backend_url');
      }

      if (accessKey.trim()) {
        localStorage.setItem('studio_access_key', accessKey.trim());
      } else {
        localStorage.removeItem('studio_access_key');
      }

      // 1. Check health
      await api.checkHealth();

      // 2. Check key validation
      if (accessKey.trim()) {
        const verifyRes = await api.verifyAccessKey(accessKey.trim());
        if (!verifyRes.valid) {
          throw new Error('Access key is invalid. Please verify the 32-character key from data/.access_key.');
        }
      }

      setTestResult({
        success: true,
        message: 'Successfully connected and authenticated with your local production backend!',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Unable to connect to backend.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Production Backend Connection" maxWidth="max-w-lg">
      <form onSubmit={handleTestAndSave} className="space-y-5">
        <p className="text-xs text-slate-300">
          Connect this web interface to your Windows laptop production engine. Your secret access key is stored securely in your browser and never exposed to third parties.
        </p>

        {testResult && (
          <div
            className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 border ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-200 mb-1.5">
              <Key className="h-3.5 w-3.5 text-red-500" />
              Studio Master Access Key
            </label>
            <input
              type="password"
              placeholder="Enter 32-character Studio Access Key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found on your laptop in <code className="text-slate-300">data/.access_key</code>.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-200 mb-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              Backend Tunnel URL (Leave blank for default / localhost)
            </label>
            <input
              type="url"
              placeholder="https://your-cloudflared-domain.trycloudflare.com"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full rounded-xl bg-studio-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Current active API endpoint: <code className="text-slate-300">{getApiBaseUrl()}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-studio-950 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-studio-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={testing}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {testing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Save & Connect
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

