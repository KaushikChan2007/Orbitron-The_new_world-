import React from 'react';
import {
  Compass,
  ArrowUpRight,
  Plus,
  Play,
  Layers,
  Dna,
  ArrowRight,
  Database,
  Radio,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Exoplanet } from '../types';
import { ResearchScatterPlot } from '../components/ResearchScatterPlot';

interface MissionControlProps {
  planets: Exoplanet[];
  featuredPlanet: Exoplanet;
  onNavigate: (view: string) => void;
  onSelectPlanet: (planet: Exoplanet) => void;
  retrievedAt?: string;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  planets,
  featuredPlanet,
  onNavigate,
  onSelectPlanet,
  retrievedAt = '2026-10-31'
}) => {
  const totalPlanets = planets.length;
  const withRadius = planets.filter((p) => p.pl_rade != null).length;
  const withTemp = planets.filter((p) => p.pl_eqt != null).length;
  const rockyCandidates = planets.filter((p) => p.pl_rade != null && p.pl_rade <= 1.6).length;

  const distLy = featuredPlanet.sy_dist
    ? Math.round(featuredPlanet.sy_dist * 3.26156)
    : 492;

  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-[1520px] mx-auto">
      {/* Hero Section: Big, Immersive, Cinematic, Pure Black & White */}
      <div className="relative min-h-[640px] rounded-[32px] border border-white/15 bg-black overflow-hidden p-6 sm:p-12 flex flex-col justify-between shadow-2xl">
        {/* Massive Realistic Planet Background (Right Side) */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-24 sm:-right-16 md:right-4 w-[420px] sm:w-[580px] md:w-[720px] h-[420px] sm:h-[580px] md:h-[720px] pointer-events-none select-none z-0">
          {/* Outer glowing halo */}
          <div className="absolute inset-0 rounded-full bg-white/[0.03] blur-3xl" />
          {/* Orbital thin ring lines */}
          <div className="absolute inset-[-40px] rounded-full border border-white/[0.08]" />
          <div className="absolute inset-[-90px] rounded-full border border-white/[0.04]" />
          
          {/* Huge Planet Image */}
          <img
            src="/assets/hero-earth.jpg"
            alt="Hero Planet"
            className="w-full h-full rounded-full object-cover shadow-[0_0_90px_rgba(255,255,255,0.15)] border border-white/20 opacity-95"
          />

          {/* Floating Target Telemetry Pin (Strictly Black & White) */}
          <div className="absolute top-16 left-12 px-4 py-3 rounded-2xl bg-black/90 border border-white/30 backdrop-blur-xl shadow-2xl pointer-events-auto">
            <div className="text-[9px] font-mono text-[#A0A0A0] uppercase tracking-widest">
              NASA TAP TARGET
            </div>
            <div className="text-sm font-mono font-bold text-white tracking-wider">
              {featuredPlanet.pl_name.toUpperCase()}
            </div>
            <div className="text-[11px] font-mono text-white mt-0.5">
              DISTANCE: {distLy} LIGHT-YEARS
            </div>
          </div>
        </div>

        {/* Top Status Rail */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/20 text-[11px] font-mono text-white">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[#A0A0A0] uppercase tracking-wider text-[10px]">MISSION STATUS:</span>
            <span className="font-bold">ACTIVE ARCHIVE RESEARCH</span>
          </div>

          <div className="text-[11px] font-mono text-[#A0A0A0] hidden sm:block">
            RETRIEVED: <span className="text-white font-semibold">{retrievedAt.split('T')[0]}</span> • SOURCE: <span className="text-white">IPAC CALTECH TAP</span>
          </div>
        </div>

        {/* Hero Headline & Actions */}
        <div className="relative z-10 max-w-2xl space-y-6 my-auto pt-8 pb-12">
          <div className="text-xs font-mono text-[#A0A0A0] uppercase tracking-[0.25em] flex items-center gap-2">
            <span>NASA EXOPLANET INTELLIGENCE & RADIOBIOLOGY</span>
          </div>

          <h1 className="font-nasa text-5xl sm:text-7xl md:text-8xl text-white leading-[0.92] tracking-tighter">
            EXPLORE.<br />
            ANALYZE.<br />
            ENDURE.
          </h1>

          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-lg leading-relaxed font-sans">
            Direct telemetry from confirmed exoplanet catalogs merged with clinical space radiation biophysics. Characterize habitable zone thresholds and observe how deep-space cosmic particles impact human DNA and physiology.
          </p>

          {/* Action Buttons (Strictly B&W High-Contrast) */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase cursor-pointer yt-btn shadow-2xl"
            >
              <span>LAUNCH EXPLORER</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('anatomy_lab')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent hover:bg-white/10 border border-white/40 text-white font-bold text-xs sm:text-sm tracking-wider uppercase cursor-pointer yt-btn"
            >
              <span>ANATOMY LAB</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Interconnected Grid: 4 Scientific Modules (Pure Monochrome) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/15">
          {/* Card 1: Archive Telemetry */}
          <div
            onClick={() => onNavigate('explorer')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 transition-all cursor-pointer yt-hover group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A0A0A0] uppercase mb-2">
                <span>CATALOGUE STATUS</span>
                <span className="text-white font-bold">{withRadius}/{totalPlanets} RADII</span>
              </div>
              <div className="h-20 overflow-hidden rounded-xl bg-black border border-white/10 my-1">
                <img
                  src="/assets/hero-station.jpg"
                  alt="Station"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs font-mono font-bold text-white uppercase">NASA COMPOSITE ARCHIVE</div>
              <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${Math.round((withRadius / totalPlanets) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#A0A0A0]">
                <span>Data Completeness</span>
                <span>{Math.round((withRadius / totalPlanets) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Featured Target */}
          <div
            onClick={() => {
              onSelectPlanet(featuredPlanet);
              onNavigate('dossier');
            }}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 transition-all cursor-pointer yt-hover group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A0A0A0] uppercase mb-2">
                <span>TARGET WORLD</span>
                <span className="text-white font-mono">{distLy} LY</span>
              </div>
              <div className="h-20 overflow-hidden rounded-xl bg-black border border-white/10 my-1">
                <img
                  src="/assets/planet-viewer.jpg"
                  alt="Planet Viewer"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase group-hover:underline">
                  {featuredPlanet.pl_name}
                </h4>
                <div className="text-[10px] font-mono text-[#A0A0A0]">
                  {featuredPlanet.pl_rade ? `${featuredPlanet.pl_rade} R⊕` : 'N/A'} • {featuredPlanet.pl_bmasse ? `${featuredPlanet.pl_bmasse} M⊕` : 'N/A'}
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Live System Scan */}
          <div
            onClick={() => onNavigate('explorer')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 transition-all cursor-pointer yt-hover group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A0A0A0] uppercase mb-2">
              <span>SYSTEM SCAN</span>
              <span className="text-white flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            </div>
            <div className="h-20 flex items-center justify-center relative overflow-hidden rounded-xl bg-black border border-white/10 my-1">
              <div className="w-16 h-16 rounded-full border border-white/20 relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-white/15" />
                <div className="w-4 h-4 rounded-full border border-white/25" />
                <div className="absolute inset-0 rounded-full animate-radar border-r border-white/80 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />
                <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold font-mono text-white">{rockyCandidates}</span>
                <span className="text-[10px] font-mono text-[#A0A0A0] block">≤ 1.6 R⊕ ROCKY CANDIDATES</span>
              </div>
              <span className="text-[10px] font-mono text-white underline">VIEW</span>
            </div>
          </div>

          {/* Card 4: Research Pipeline */}
          <div
            onClick={() => onNavigate('anatomy_lab')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 transition-all cursor-pointer yt-hover group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A0A0A0] uppercase mb-1">
              <span>RESEARCH PIPELINE</span>
              <span className="text-white font-bold">STAGE 3/4</span>
            </div>
            <div className="space-y-1.5 text-[10px] font-mono my-auto">
              <div className="flex items-center justify-between text-[#A0A0A0]">
                <span>1. Transit Photometry</span>
                <span className="text-white font-bold">COMPLETE</span>
              </div>
              <div className="flex items-center justify-between text-[#A0A0A0]">
                <span>2. Habitability Screening</span>
                <span className="text-white font-bold">COMPLETE</span>
              </div>
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  3. Biomolecular Anatomy
                </span>
                <span className="text-white font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-[#6F7C8E]">
                <span>4. Surface ECLSS Life Support</span>
                <span>STANDBY</span>
              </div>
            </div>
            <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#A0A0A0]">
              <span>Next Investigation</span>
              <span className="text-white font-bold flex items-center gap-1">
                Open Bio Lab <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Research Scatter Plot Component directly on Dashboard */}
      <ResearchScatterPlot
        planets={planets}
        selectedPlanet={featuredPlanet}
        onSelectPlanet={(p) => {
          onSelectPlanet(p);
          onNavigate('dossier');
        }}
      />
    </div>
  );
};
