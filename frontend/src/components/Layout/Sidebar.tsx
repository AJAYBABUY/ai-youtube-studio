import React from 'react';
import {
  LayoutDashboard,
  Tv,
  BrainCircuit,
  Sparkles,
  Film,
  Calendar,
  Repeat,
  Cpu,
  BarChart3,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'channels', label: 'My Channels', icon: Tv },
    { id: 'planner', label: 'AI Content Planner', icon: BrainCircuit },
    { id: 'create', label: 'Create Video', icon: Sparkles, badge: 'AI' },
    { id: 'library', label: 'Video Library', icon: Film },
    { id: 'calendar', label: 'Publishing Calendar', icon: Calendar },
    { id: 'automation', label: 'Automation', icon: Repeat },
    { id: 'integrations', label: 'AI Integrations', icon: Cpu },
    { id: 'usage', label: 'Usage & Costs', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-studio-950 transition-all duration-300 ease-in-out z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-lg shadow-red-500/20">
            <Flame className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                AI YouTube <span className="text-xs px-1.5 py-0.2 rounded bg-red-600/30 text-red-400 font-mono">PRO</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                Telugu Production Co.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/20 font-semibold'
                  : 'text-slate-400 hover:bg-studio-900 hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-800/80 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-studio-900/60 p-2 text-xs font-medium text-slate-400 hover:bg-studio-800 hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};

