import React from 'react';
import {
  Compass,
  Activity,
  Layers,
  SplitSquareVertical,
  Dna,
  Home,
  LineChart,
  Search,
  Bot,
  Info,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type NavView =
  | 'mission_control'
  | 'explorer'
  | 'dossier'
  | 'anatomy_lab'
  | 'compare'
  | 'settlement'
  | 'spectrum'
  | 'about';

interface TopNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenAi: () => void;
  onSearchClick: () => void;
  retrievedAt?: string;
  totalPlanets?: number;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

const NAV_ITEMS: { id: NavView; label: string; icon: React.ElementType }[] = [
  { id: 'mission_control', label: '1. Mission Control', icon: Compass },
  { id: 'explorer', label: '2. Exoplanet Explorer', icon: Compass },
  { id: 'dossier', label: '3. Habitability Analysis', icon: Layers },
  { id: 'anatomy_lab', label: '4. Anatomy Lab', icon: Dna },
  { id: 'compare', label: '5. Compare Grid', icon: SplitSquareVertical },
  { id: 'spectrum', label: '6. Spectrum Lab', icon: LineChart },
  { id: 'settlement', label: '7. Settlement', icon: Home },
  { id: 'about', label: '8. Sources', icon: Info }
];

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onSelectView,
  onOpenAi,
  onSearchClick,
  retrievedAt = '2026-10-31',
  totalPlanets = 520,
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 backdrop-blur-xl bg-[#05070D]/80 border-b border-white/5 transition-all">
      <div className="max-w-[1520px] mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo + Forward/Backward Navigation Controls */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectView('mission_control')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-white text-base">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white group-hover:rotate-45 transition-transform duration-300"
              >
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-white text-base sm:text-lg tracking-[0.2em]">
              ORBITRON
            </span>
          </div>

          {/* Forward and Backward Navigation Buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={onGoBack}
              disabled={!canGoBack}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center text-white cursor-pointer yt-hover-btn transition-all"
              title="Navigate Backward (Previous View)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onGoForward}
              disabled={!canGoForward}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center text-white cursor-pointer yt-hover-btn transition-all"
              title="Navigate Forward (Next View)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Pill Navigation Container (exact style from Screenshot 2) */}
        <nav className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-inner">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer yt-hover-btn ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-[#9AA7B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: AI button & Mobile Menu */}
        <div className="flex items-center gap-2.5">
          {/* Ask AI Floating Panel Trigger */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer yt-hover-btn"
            title="Ask Orbitron AI"
          >
            <Bot className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-left text-xs font-medium ${
                currentView === item.id
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#9AA7B8] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
