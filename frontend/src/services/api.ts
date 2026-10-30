import {
  Channel,
  ContentPlan,
  VideoJob,
  SystemHealth,
  AutomationStatus,
  UsageSummary,
  CalendarEvent,
} from '../types';

export const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('studio_backend_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '') + '/api';
  }
  const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
  return envBase ? envBase.replace(/\/+$/, '') + '/api' : '/api';
};

export const getBackendRootUrl = (): string => {
  const customUrl = localStorage.getItem('studio_backend_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
  return envBase ? envBase.replace(/\/+$/, '') : '';
};

export const getMediaAssetUrl = (pathOrUrl?: string | null): string => {
  if (!pathOrUrl) return '';
  const studioKey = localStorage.getItem('studio_access_key') || '';
  const separator = pathOrUrl.includes('?') ? '&' : '?';
  const urlWithKey = studioKey ? `${pathOrUrl}${separator}studio_key=${encodeURIComponent(studioKey)}` : pathOrUrl;

  if (urlWithKey.startsWith('http://') || urlWithKey.startsWith('https://')) {
    return urlWithKey;
  }
  const root = getBackendRootUrl();
  return root ? `${root}${urlWithKey}` : urlWithKey;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const studioKey = localStorage.getItem('studio_access_key') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(studioKey ? { 'X-Studio-Key': studioKey } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health & Verification
  checkHealth: () => request<{ status: string; app: string; environment: string; emergency_paused: boolean }>('/health'),
  verifyAccessKey: (key: string) =>
    request<{ valid: boolean }>('/auth/verify-key', { method: 'POST', body: JSON.stringify({ key }) }),

  // Channels
  getChannels: () => request<Channel[]>('/channels'),
  getChannel: (id: string) => request<Channel>(`/channels/${id}`),
  createChannel: (data: Partial<Channel>) =>
    request<Channel>('/channels', { method: 'POST', body: JSON.stringify(data) }),
  updateChannel: (id: string, data: Partial<Channel>) =>
    request<Channel>(`/channels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteChannel: (id: string) =>
    request<{ message: string }>(`/channels/${id}`, { method: 'DELETE' }),

  // Auth
  getGoogleAuthUrl: (channelId?: string) =>
    request<{ authorization_url: string }>(`/auth/google/url${channelId ? `?channel_id=${channelId}` : ''}`),
  disconnectChannel: (channelId: string) =>
    request<{ message: string }>(`/auth/disconnect/${channelId}`, { method: 'POST' }),

  // Planner
  getPlans: (channelId?: string) =>
    request<ContentPlan[]>(`/planner/plans${channelId ? `?channel_id=${channelId}` : ''}`),
  createTopicResearch: (data: { channel_id: string; category: string; target_format: string }) =>
    request<ContentPlan>('/planner/research', { method: 'POST', body: JSON.stringify(data) }),
  deletePlan: (id: string) =>
    request<{ message: string }>(`/planner/plans/${id}`, { method: 'DELETE' }),

  // Jobs
  getJobs: (params?: { channel_id?: string; status?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.channel_id) q.set('channel_id', params.channel_id);
    if (params?.status) q.set('status', params.status);
    if (params?.limit) q.set('limit', String(params.limit));
    return request<VideoJob[]>(`/jobs?${q.toString()}`);
  },
  getJob: (id: string) => request<VideoJob>(`/jobs/${id}`),
  createJob: (data: { channel_id: string; content_plan_id?: string; video_type: string; custom_topic?: string; custom_script?: string }) =>
    request<VideoJob>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  retryJob: (id: string) => request<{ message: string }>(`/jobs/${id}/retry`, { method: 'POST' }),
  publishJob: (id: string) => request<{ message: string; url: string }>(`/jobs/${id}/publish`, { method: 'POST' }),

  // Library
  getLibraryVideos: (channelId?: string) =>
    request<any[]>(`/library/videos${channelId ? `?channel_id=${channelId}` : ''}`),

  // Calendar
  getCalendarEvents: () => request<CalendarEvent[]>('/calendar/events'),

  // Automation
  getAutomationStatus: () => request<AutomationStatus>('/automation/status'),
  pauseAutomation: () => request<{ message: string; emergency_paused: boolean }>('/automation/pause', { method: 'POST' }),
  resumeAutomation: () => request<{ message: string; emergency_paused: boolean }>('/automation/resume', { method: 'POST' }),
  toggleChannelAutomation: (channelId: string) =>
    request<any>(`/automation/channels/${channelId}/toggle`, { method: 'POST' }),
  triggerAllNow: () => request<{ message: string; jobs: any[] }>('/automation/trigger-now', { method: 'POST' }),

  // Providers & Health
  getProvidersStatus: () => request<SystemHealth>('/providers/status'),

  // Usage
  getUsageSummary: () => request<UsageSummary>('/usage/summary'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) =>
    request<any>('/settings', { method: 'POST', body: JSON.stringify(data) }),
};
