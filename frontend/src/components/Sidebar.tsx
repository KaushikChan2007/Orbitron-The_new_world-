import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Activity,
  LineChart,
  SplitSquareVertical,
  ShieldAlert,
  Bot,
  Info,
  Orbit,
  Menu,
  X
} from 'lucide-react';

export type NavTab =
  | 'mission_control'
  | 'explorer'
  | 'habitability'
  | 'spectrum'
  | 'comparison'
  | 'radiation'
  | 'ai'
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'mission_control', label: 'Mission Control', icon: LayoutDashboard },
  { id: 'explorer', label: 'Exoplanet Explorer', icon: Compass },
  { id: 'habitability', label: 'Habitability Analysis', icon: Activity },
  { id: 'spectrum', label: 'Spectrum Lab', icon: LineChart, badge: 'AI Engine' },
  { id: 'comparison', label: 'Earth Comparison', icon: SplitSquareVertical },
  { id: 'radiation', label: 'Radiation & Bio Lab', icon: ShieldAlert, badge: 'Bio Focus' },
  { id: 'ai', label: 'Ask Orbitron AI', icon: Bot },
  { id: 'about', label: 'About & Roadmap', icon: Info }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onToggleMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#071A36] border-r border-[#24466B] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#24466B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-white text-lg font-mono">ORBITRON</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono font-medium">v2.0</span>
              </div>
              <p className="text-[11px] text-[#AFC2D9] truncate">Exoplanet Intelligence</p>
            </div>
          </div>
          <button
            onClick={onToggleMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Platform Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onToggleMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/50'
                    : 'text-[#AFC2D9] hover:bg-[#0B1F3A] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Tagline / Integrity Notice */}
        <div className="p-4 border-t border-[#24466B] bg-[#061326]/60">
          <div className="p-2.5 rounded-lg bg-[#0B1F3A]/70 border border-[#24466B]/60 text-[11px] space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              SCIENTIFIC INTEGRITY
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Measured • Derived • Estimated • Unknown parameters clearly demarcated.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
