import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { MyChannels } from './pages/MyChannels';
import { ContentPlanner } from './pages/ContentPlanner';
import { CreateVideo } from './pages/CreateVideo';
import { VideoLibrary } from './pages/VideoLibrary';
import { PublishingCalendar } from './pages/PublishingCalendar';
import { Automation } from './pages/Automation';
import { AIIntegrations } from './pages/AIIntegrations';
import { UsageCosts } from './pages/UsageCosts';
import { Settings } from './pages/Settings';
import { VideoModal } from './components/VideoPlayer/VideoModal';
import { api } from './services/api';
import {
  Channel,
  VideoJob,
  ContentPlan,
  SystemHealth,
  AutomationStatus,
  UsageSummary,
  CalendarEvent,
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState('');

  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [libraryVideos, setLibraryVideos] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);

  // Video preview modal
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);

  // Initial load & URL params check
  useEffect(() => {
    loadAllData();

    // Check OAuth return query params
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      alert('🎉 Google OAuth connection successful! Your YouTube channel is now connected.');
      window.history.replaceState({}, '', window.location.pathname);
      setCurrentTab('channels');
    } else if (params.get('auth') === 'error') {
      alert('OAuth Error: ' + (params.get('message') || 'Failed to authenticate channel.'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Polling for live production progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadJobs();
      loadHealth();
      loadAutomation();
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedChannelId]);

  const loadAllData = async () => {
    await Promise.allSettled([
      loadChannels(),
      loadJobs(),
      loadPlans(),
      loadLibrary(),
      loadCalendar(),
      loadHealth(),
      loadAutomation(),
      loadUsage(),
    ]);
  };

  const loadChannels = async () => {
    try {
      const data = await api.getChannels();
      setChannels(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await api.getJobs({ channel_id: selectedChannelId || undefined });
      setJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await api.getPlans(selectedChannelId || undefined);
      setPlans(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLibrary = async () => {
    try {
      const data = await api.getLibraryVideos(selectedChannelId || undefined);
      setLibraryVideos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCalendar = async () => {
    try {
      const data = await api.getCalendarEvents();
      setCalendarEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHealth = async () => {
    try {
      const data = await api.getProvidersStatus();
      setSystemHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAutomation = async () => {
    try {
      const data = await api.getAutomationStatus();
      setAutomationStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsage = async () => {
    try {
      const data = await api.getUsageSummary();
      setUsageSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Channel Operations
  const handleConnectGoogleOAuth = async (channelId?: string) => {
    try {
      const res = await api.getGoogleAuthUrl(channelId);
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err) {
      alert(
        'Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Settings or .env file.'
      );
    }
  };

  const handleUpdateChannel = async (id: string, data: Partial<Channel>) => {
    await api.updateChannel(id, data);
    loadChannels();
  };

  const handleDeleteChannel = async (id: string) => {
    await api.deleteChannel(id);
    loadChannels();
  };

  const handleDisconnectChannel = async (id: string) => {
    await api.disconnectChannel(id);
    loadChannels();
  };

  // Planner Operations
  const handleTriggerResearch = async (chId: string, category: string, format: string) => {
    await api.createTopicResearch({ channel_id: chId, category, target_format: format });
    loadPlans();
  };

  const handleDeletePlan = async (id: string) => {
    await api.deletePlan(id);
    loadPlans();
  };

  const handleCreateVideoFromPlan = (chId: string, planId: string, videoType: string) => {
    api.createJob({ channel_id: chId, content_plan_id: planId, video_type: videoType });
    setCurrentTab('dashboard');
    loadJobs();
  };

  // Jobs
  const handleLaunchJob = async (data: any) => {
    await api.createJob(data);
    loadJobs();
  };

  const handleRetryJob = async (id: string) => {
    await api.retryJob(id);
    loadJobs();
  };

  const handlePublishJob = async (id: string) => {
    await api.publishJob(id);
    loadJobs();
    loadLibrary();
    loadCalendar();
  };

  // Emergency Pause
  const handleToggleEmergencyPause = async () => {
    if (automationStatus?.global_emergency_pause) {
      await api.resumeAutomation();
    } else {
      await api.pauseAutomation();
    }
    loadAutomation();
  };

  const handleToggleChannelAutomation = async (channelId: string) => {
    await api.toggleChannelAutomation(channelId);
    loadChannels();
    loadAutomation();
  };

  const handleTriggerAllNow = async () => {
    await api.triggerAllNow();
    loadJobs();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-studio-950 font-sans text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={currentTab.replace('-', ' ')}
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={(id) => {
            setSelectedChannelId(id);
            setTimeout(() => {
              loadJobs();
              loadPlans();
              loadLibrary();
            }, 100);
          }}
          isEmergencyPaused={Boolean(automationStatus?.global_emergency_pause)}
          onToggleEmergencyPause={handleToggleEmergencyPause}
          ffmpegAvailable={Boolean(systemHealth?.ffmpeg_available)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              channels={channels}
              jobs={jobs}
              systemHealth={systemHealth}
              automationStatus={automationStatus}
              onNavigate={setCurrentTab}
              onSelectVideo={(j) =>
                setActiveVideoModal({
                  url: `/api/library/stream/${j.id}`,
                  title: j.title,
                  type: j.video_type,
                  youtubeUrl: j.youtube_url,
                })
              }
              onRetryJob={handleRetryJob}
            />
          )}

          {currentTab === 'channels' && (
            <MyChannels
              channels={channels}
              onRefresh={loadChannels}
              onConnectGoogleOAuth={handleConnectGoogleOAuth}
              onUpdateChannel={handleUpdateChannel}
              onDeleteChannel={handleDeleteChannel}
              onDisconnectChannel={handleDisconnectChannel}
            />
          )}

          {currentTab === 'planner' && (
            <ContentPlanner
              channels={channels}
              plans={plans}
              selectedChannelId={selectedChannelId}
              onRefresh={loadPlans}
              onTriggerResearch={handleTriggerResearch}
              onDeletePlan={handleDeletePlan}
              onCreateVideoFromPlan={handleCreateVideoFromPlan}
            />
          )}

          {currentTab === 'create' && (
            <CreateVideo
              channels={channels}
              selectedChannelId={selectedChannelId}
              onLaunchJob={handleLaunchJob}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'library' && (
            <VideoLibrary
              channels={channels}
              libraryVideos={libraryVideos}
              selectedChannelId={selectedChannelId}
              onRefresh={loadLibrary}
              onSelectVideo={(v) =>
                setActiveVideoModal({
                  url: v.stream_url,
                  title: v.title,
                  type: v.video_type,
                  youtubeUrl: v.youtube_url,
                })
              }
              onPublishVideo={handlePublishJob}
            />
          )}

          {currentTab === 'calendar' && <PublishingCalendar events={calendarEvents} />}

          {currentTab === 'automation' && (
            <Automation
              channels={channels}
              automationStatus={automationStatus}
              onRefresh={loadAutomation}
              onToggleEmergencyPause={handleToggleEmergencyPause}
              onToggleChannelAutomation={handleToggleChannelAutomation}
              onTriggerAllNow={handleTriggerAllNow}
            />
          )}

          {currentTab === 'integrations' && (
            <AIIntegrations
              health={systemHealth}
              onRefresh={loadHealth}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'usage' && (
            <UsageCosts summary={usageSummary} onRefresh={loadUsage} />
          )}

          {currentTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <VideoModal
          isOpen={Boolean(activeVideoModal)}
          onClose={() => setActiveVideoModal(null)}
          videoUrl={activeVideoModal.url}
          title={activeVideoModal.title}
          videoType={activeVideoModal.type}
          youtubeUrl={activeVideoModal.youtubeUrl}
        />
      )}
    </div>
  );
};

export default App;

