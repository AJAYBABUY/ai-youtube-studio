import {
  Channel,
  ContentPlan,
  VideoJob,
  SystemHealth,
  AutomationStatus,
  UsageSummary,
  CalendarEvent,
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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

