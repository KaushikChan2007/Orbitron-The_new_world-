import React, { useState } from 'react';
import { Layers, Info, ExternalLink, Image as ImageIcon, Sparkles, Compass, Eye, Maximize2 } from 'lucide-react';
import { Exoplanet } from '../types';

interface HabitableZoneDiagramProps {
  planet: Exoplanet;
}

export const HabitableZoneDiagram: React.FC<HabitableZoneDiagramProps> = ({ planet }) => {
  const [showOriginalPaperFigure, setShowOriginalPaperFigure] = useState(false);
  const [showLandscapeChart, setShowLandscapeChart] = useState(true);
  const [expandedLandscape, setExpandedLandscape] = useState(false);

  // Stellar luminosity and temperature
  const teff = planet.st_teff || 5778;
  const rad = planet.st_rad || 1.0;
  // Stefan-Boltzmann luminosity L/L_sun = (R/R_sun)^2 * (T/T_sun)^4
  const lumSolar = planet.st_lum != null 
    ? Math.pow(10, planet.st_lum) 
    : Math.pow(rad, 2) * Math.pow(teff / 5778, 4);

  // Scaled HZ boundaries (Kopparapu et al. 2013 & Tuomi et al. 2013)
  // Distance ~ sqrt(L / Seff)
  // Sun Seff: Runaway Greenhouse (No clouds) ~ 1.06 S⊕, Venus 50% clouds ~ 1.76 S⊕, 100% clouds ~ 2.4 S⊕
  // Maximum Greenhouse ~ 0.36 S⊕, 100% CO2 clouds ~ 0.25 S⊕
  const sqrtL = Math.sqrt(Math.max(0.001, lumSolar));
  
  // Solar system AU boundaries
  const sunBounds = {
    c100: 0.55,
    c50: 0.72, // Venus
    noClouds: 0.95,
    earth: 1.00,
    mars: 1.52,
    hzOuter: 1.67,
    co2Clouds: 2.40,
    maxAu: 2.8
  };

  // Target system AU boundaries
  const targetBounds = {
    c100: Math.round(0.55 * sqrtL * 100) / 100,
    c50: Math.round(0.72 * sqrtL * 100) / 100,
    noClouds: Math.round(0.95 * sqrtL * 100) / 100,
    hzOuter: Math.round(1.67 * sqrtL * 100) / 100,
    co2Clouds: Math.round(2.40 * sqrtL * 100) / 100,
    maxAu: Math.max(1.2, Math.round(2.8 * sqrtL * 100) / 100)
  };

  // Semi-major axis of planet
  // Kepler's 3rd Law: a ~ (P^2 * M_star)^(1/3)
  const semiMajorAu = planet.pl_orbper != null
    ? Math.round(Math.pow(Math.pow(planet.pl_orbper / 365.25, 2) * (teff > 5000 ? 1.0 : 0.7), 1 / 3) * 100) / 100
    : (planet.pl_insol ? Math.round(Math.sqrt(lumSolar / planet.pl_insol) * 100) / 100 : null);

  const isPlanetInHz = semiMajorAu != null && semiMajorAu >= targetBounds.noClouds && semiMajorAu <= targetBounds.hzOuter;

  return (
    <div className="p-6 rounded-[24px] glass-panel space-y-5 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-widest">
            CIRCUMSTELLAR HABITABILITY & CLOUD FEEDBACK
          </div>
          <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <span>HABITABILITY ANALYSIS & CLOUD FEEDBACK RULER</span>
          </h3>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Calibrated on Mikko Tuomi et al. (2013) & Kopparapu et al. (2013) climate feedback models.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLandscapeChart(!showLandscapeChart)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 yt-hover-btn ${
              showLandscapeChart ? 'bg-white text-black border-white' : 'bg-white/5 hover:bg-white/15 border-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showLandscapeChart ? 'Hide CSI Landscape' : 'View CSI Landscape'}</span>
          </button>

          <button
            onClick={() => setShowOriginalPaperFigure(!showOriginalPaperFigure)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 yt-hover-btn ${
              showOriginalPaperFigure ? 'bg-white text-black border-white' : 'bg-white/5 hover:bg-white/15 border-white/20 text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{showOriginalPaperFigure ? 'Hide Cloud Model' : 'Cloud Model (Tuomi 2013)'}</span>
          </button>
        </div>
      </div>

      {/* Carl Sagan Institute Habitable Zone Landscape Card */}
      {showLandscapeChart && (
        <div className="rounded-2xl overflow-hidden bg-black border border-white/20 space-y-3 p-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                Carl Sagan Institute / Chester Harman / Pablo Carlos Budassi
              </span>
              <h4 className="font-bold text-white text-sm">
                Habitable Zone Landscape: Starlight vs Stellar Temperature
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                Optimistic & Conservative Boundaries
              </span>
              <button
                onClick={() => setExpandedLandscape(!expandedLandscape)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black cursor-pointer transition-colors"
                title={expandedLandscape ? 'Standard View' : 'Expand High-Res'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* High-Resolution Landscape Image */}
          <div className={`relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10 transition-all ${
            expandedLandscape ? 'max-h-[800px]' : 'max-h-[500px]'
          }`}>
            <img
              src="/assets/habitable-zone-landscape.png"
              alt="Carl Sagan Institute Habitable Zone Landscape"
              className="w-full h-full object-contain filter contrast-105"
            />
          </div>

          {/* Scientific Legend & Annotations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px] font-sans">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-mono font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-green-400"></span>
                <span>Conservative HZ</span>
              </div>
              <p className="text-neutral-400 text-[10px] leading-relaxed">
                Runaway greenhouse to maximum CO₂ greenhouse limits. Terrestrial planets here maintain stable liquid water over gigayears.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-mono font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-amber-400"></span>
                <span>Optimistic HZ</span>
              </div>
              <p className="text-neutral-400 text-[10px] leading-relaxed">
                Recent Venus to Early Mars boundaries. Planets may retain surface oceans under dense cloud shielding or volcanic atmospheres.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-mono font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>Active Target: {planet.pl_name}</span>
              </div>
              <p className="text-neutral-400 text-[10px] leading-relaxed">
                Starlight: <strong className="text-white font-mono">{planet.pl_insol ? `${Math.round(planet.pl_insol * 100)}%` : 'N/A'}</strong> of Sun • Teff: <strong className="text-white font-mono">{planet.st_teff ? `${Math.round((planet.st_teff / 5778) * 100)}%` : 'N/A'}</strong> of Sol
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Paper Reference Figure (Image 2) */}
      {showOriginalPaperFigure && (
        <div className="p-4 rounded-2xl bg-black border border-white/20 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="font-bold">Original Astrophysical Paper Diagram: Mikko Tuomi et al. (HD 40307 System)</span>
            <span className="text-[10px] text-neutral-500">Source: phys.org / Astronomy & Astrophysics</span>
          </div>
          <div className="rounded-xl overflow-hidden bg-white p-2 border border-neutral-700">
            <img
              src="/assets/hz-diagram.png"
              alt="Habitability Analysis Tuomi et al."
              className="w-full max-h-72 object-contain mx-auto"
            />
          </div>
          <p className="text-[10px] text-neutral-400 font-sans">
            Diagram demonstrates how atmospheric cloud cover shifts inner and outer habitable zone boundaries. 100% water clouds reflect incident starlight and shield the planetary surface, extending habitability inward towards the star.
          </p>
        </div>
      )}

      {/* Interactive Astronomical Habitable Zone Ruler */}
      <div className="space-y-6 pt-2">
        {/* Track 1: Sol System Baseline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-bold text-white uppercase tracking-wider">
              Solar System Baseline (Sol / G2V, 5778 K)
            </span>
            <span className="text-neutral-400 text-[10px]">
              Earth: 1.00 AU • Mars: 1.52 AU
            </span>
          </div>

          <div className="relative h-20 rounded-2xl bg-black/80 border border-white/15 p-2 overflow-hidden select-none">
            {/* Axis Ruler Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-neutral-700 -translate-y-1/2" />

            {/* Cloud feedback grey bands */}
            <div
              className="absolute top-2 bottom-2 bg-neutral-800/80 border-l border-r border-neutral-600"
              style={{
                left: `${(sunBounds.c100 / sunBounds.maxAu) * 100}%`,
                width: `${((sunBounds.noClouds - sunBounds.c100) / sunBounds.maxAu) * 100}%`
              }}
              title="Inner Cloud Feedback (100% to No Clouds)"
            >
              <span className="absolute top-1 left-1 text-[8px] text-neutral-400 uppercase">Clouds</span>
            </div>

            {/* Conservative Habitable Zone */}
            <div
              className="absolute top-2 bottom-2 bg-white/10 border-l-2 border-r-2 border-white/60 flex items-center justify-center"
              style={{
                left: `${(sunBounds.noClouds / sunBounds.maxAu) * 100}%`,
                width: `${((sunBounds.hzOuter - sunBounds.noClouds) / sunBounds.maxAu) * 100}%`
              }}
            >
              <span className="text-[9px] uppercase font-bold text-white tracking-widest opacity-80">
                Habitable Zone
              </span>
            </div>

            {/* Outer CO2 clouds */}
            <div
              className="absolute top-2 bottom-2 bg-neutral-900/90 border-l border-r border-dashed border-neutral-600"
              style={{
                left: `${(sunBounds.hzOuter / sunBounds.maxAu) * 100}%`,
                width: `${((sunBounds.co2Clouds - sunBounds.hzOuter) / sunBounds.maxAu) * 100}%`
              }}
              title="CO2 Cloud Greenhouse Outer Envelope"
            >
              <span className="absolute bottom-1 right-1 text-[8px] text-neutral-500 uppercase">CO₂ Clouds</span>
            </div>

            {/* Mercury (0.39 AU) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${(0.39 / sunBounds.maxAu) * 100}%` }}
              title="Mercury (0.39 AU)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 border border-black shadow" />
              <span className="text-[8px] text-neutral-400 mt-1">0.39</span>
            </div>

            {/* Venus (0.72 AU) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${(0.72 / sunBounds.maxAu) * 100}%` }}
              title="Venus (0.72 AU)"
            >
              <div className="w-3 h-3 rounded-full bg-neutral-300 border border-black shadow" />
              <span className="text-[8px] text-neutral-400 mt-1">Venus</span>
            </div>

            {/* Earth (1.00 AU) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group z-10 cursor-pointer"
              style={{ left: `${(1.00 / sunBounds.maxAu) * 100}%` }}
              title="Earth (1.00 AU - Confirmed Habitable)"
            >
              <div className="w-4 h-4 rounded-full bg-white border-2 border-black ring-2 ring-white shadow-xl animate-pulse" />
              <span className="text-[9px] font-bold text-white mt-1">Earth</span>
            </div>

            {/* Mars (1.52 AU) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${(1.52 / sunBounds.maxAu) * 100}%` }}
              title="Mars (1.52 AU)"
            >
              <div className="w-3 h-3 rounded-full bg-neutral-300 border border-black shadow" />
              <span className="text-[8px] text-neutral-400 mt-1">Mars</span>
            </div>
          </div>
        </div>

        {/* Track 2: Target Planetary System */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-bold text-white uppercase tracking-wider">
              Target System: {planet.hostname} ({planet.st_teff ? `${planet.st_teff} K` : 'Spectral Class N/A'})
            </span>
            <span className="text-white text-[10px] font-bold">
              {planet.pl_name}: {semiMajorAu ? `${semiMajorAu} AU` : 'Semi-major Axis Derived from Insolation'}
            </span>
          </div>

          <div className="relative h-20 rounded-2xl bg-black/80 border border-white/15 p-2 overflow-hidden select-none">
            {/* Axis Ruler Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-neutral-700 -translate-y-1/2" />

            {/* Scaled Cloud feedback bands */}
            <div
              className="absolute top-2 bottom-2 bg-neutral-800/80 border-l border-r border-neutral-600"
              style={{
                left: `${(targetBounds.c100 / targetBounds.maxAu) * 100}%`,
                width: `${((targetBounds.noClouds - targetBounds.c100) / targetBounds.maxAu) * 100}%`
              }}
              title="Inner Cloud Feedback Envelope"
            >
              <span className="absolute top-1 left-1 text-[8px] text-neutral-400 uppercase">Clouds</span>
            </div>

            {/* Scaled Target Habitable Zone */}
            <div
              className="absolute top-2 bottom-2 bg-white/15 border-l-2 border-r-2 border-white flex items-center justify-center"
              style={{
                left: `${(targetBounds.noClouds / targetBounds.maxAu) * 100}%`,
                width: `${Math.max(4, ((targetBounds.hzOuter - targetBounds.noClouds) / targetBounds.maxAu) * 100)}%`
              }}
            >
              <span className="text-[9px] uppercase font-bold text-white tracking-widest opacity-90">
                HZ ({targetBounds.noClouds} – {targetBounds.hzOuter} AU)
              </span>
            </div>

            {/* Outer CO2 cloud limit */}
            <div
              className="absolute top-2 bottom-2 bg-neutral-900/90 border-l border-r border-dashed border-neutral-600"
              style={{
                left: `${(targetBounds.hzOuter / targetBounds.maxAu) * 100}%`,
                width: `${Math.max(2, ((targetBounds.co2Clouds - targetBounds.hzOuter) / targetBounds.maxAu) * 100)}%`
              }}
            >
              <span className="absolute bottom-1 right-1 text-[8px] text-neutral-500 uppercase">CO₂</span>
            </div>

            {/* Target Planet Pin */}
            {semiMajorAu != null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group z-20 cursor-pointer"
                style={{
                  left: `${Math.min(95, Math.max(5, (semiMajorAu / targetBounds.maxAu) * 100))}%`
                }}
                title={`${planet.pl_name} (${semiMajorAu} AU) - ${isPlanetInHz ? 'INSIDE Habitable Zone' : 'Outside Habitable Zone'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 border-black ring-2 shadow-2xl ${
                  isPlanetInHz ? 'bg-white ring-white animate-pulse' : 'bg-neutral-400 ring-neutral-400'
                }`} />
                <span className="text-[9px] font-bold text-white mt-1 px-1 bg-black/90 rounded border border-white/20 whitespace-nowrap">
                  {planet.pl_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Assessment Bar */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ORBITAL HZ EVALUATION:</span>
            <span className="px-2 py-0.5 rounded bg-white text-black font-bold uppercase text-[10px]">
              {isPlanetInHz ? 'IN CIRUMSTELLAR HABITABLE ZONE' : 'OUTSIDE CONSERVATIVE HZ BOUNDS'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-400 font-sans">
            Insolation Flux: <strong className="text-white font-mono">{planet.pl_insol ? `${planet.pl_insol} S⊕` : 'N/A'}</strong> (Earth = 1.00 S⊕)
          </div>
        </div>
      </div>
    </div>
  );
};
