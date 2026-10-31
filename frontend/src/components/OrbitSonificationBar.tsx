import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Square, Radio, Sparkles } from 'lucide-react';
import { systemSonifier, SystemPlanetOrbit } from '../lib/sonification';

interface OrbitSonificationBarProps {
  systemName?: string;
  planets?: SystemPlanetOrbit[];
}

const DEFAULT_TRAPPIST_ORBITS: SystemPlanetOrbit[] = [
  { name: 'TRAPPIST-1 b', period_days: 1.51, radius_earth: 1.12 },
  { name: 'TRAPPIST-1 c', period_days: 2.42, radius_earth: 1.10 },
  { name: 'TRAPPIST-1 d', period_days: 4.05, radius_earth: 0.78 },
  { name: 'TRAPPIST-1 e', period_days: 6.10, radius_earth: 0.92 },
  { name: 'TRAPPIST-1 f', period_days: 9.21, radius_earth: 1.04 },
  { name: 'TRAPPIST-1 g', period_days: 12.35, radius_earth: 1.13 },
  { name: 'TRAPPIST-1 h', period_days: 18.77, radius_earth: 0.77 }
];

export const OrbitSonificationBar: React.FC<OrbitSonificationBarProps> = ({
  systemName = 'TRAPPIST-1 Resonant Chain',
  planets = DEFAULT_TRAPPIST_ORBITS
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (isPlaying) {
      systemSonifier.stop();
      setIsPlaying(false);
    } else {
      systemSonifier.playSystem(planets);
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B1F3A]/90 via-[#102B4B]/80 to-[#0B1F3A]/90 border border-cyan-500/30 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/40 animate-pulse'
            : 'bg-slate-800 text-cyan-400 border border-slate-700'
        }`}>
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <span>{systemName}</span>
              <span className="text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded font-mono">
                {planets.length} Worlds
              </span>
            </h4>
          </div>
          <p className="text-[11px] text-[#AFC2D9]">
            Orbit sonification: Web Audio frequency-mapped resonant synthesis. <span className="text-slate-400 italic">Artistic sonification, not a recording.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Visual equalizer wave dots */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/30 border border-slate-800">
          {planets.map((p, i) => (
            <div
              key={p.name}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isPlaying
                  ? 'bg-cyan-400 animate-bounce'
                  : 'bg-slate-600 h-3'
              }`}
              style={{
                height: isPlaying ? `${Math.max(6, Math.min(24, (7 - i) * 3.5))}px` : '6px',
                animationDelay: `${i * 120}ms`
              }}
              title={`${p.name} (${p.period_days} d)`}
            />
          ))}
        </div>

        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer shadow-md ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play System Harmonics</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
