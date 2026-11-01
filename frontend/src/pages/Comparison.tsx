import React, { useState, useEffect } from 'react';
import {
  SplitSquareVertical,
  Copy,
  Check,
  Dna,
  ArrowRight,
  Trash2,
  ExternalLink,
  Plus,
  Scale,
  Compass,
  Activity,
  Sparkles,
  Bot,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Exoplanet } from '../types';
import { calculateHumanVisitMetrics } from '../lib/comparison';

interface ComparisonProps {
  comparisonList: Exoplanet[];
  allPlanets: Exoplanet[];
  onAddPlanet: (planet: Exoplanet) => void;
  onRemovePlanet: (planetName: string) => void;
  onNavigate: (view: string) => void;
  onSelectPlanet: (planet: Exoplanet) => void;
}

export const Comparison: React.FC<ComparisonProps> = ({
  comparisonList,
  allPlanets,
  onAddPlanet,
  onRemovePlanet,
  onNavigate,
  onSelectPlanet
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedAddPlanet, setSelectedAddPlanet] = useState('');
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsSource, setInsightsSource] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(true);

  // Earth Baseline Constants
  const earth = {
    name: 'Earth (Sol III)',
    radius: '1.00 R⊕',
    mass: '1.00 M⊕',
    gravity: '1.00 g',
    density: '5.51 g/cm³',
    escape_vel: '11.19 km/s',
    period: '365.25 d',
    flux: '1.00 S⊕',
    teq: '255 K (Mean SFC: 288 K)',
    hz_class: 'Conservative HZ (Standard)',
    rocky_status: 'Silicate / Iron Terrestrial',
    host_star: 'Sun (G2V, 5778 K)',
    distance: '0.00 pc',
    cardio_strain: 'Baseline Terrestrial (1.0×)',
    bone_resorption: 'Equilibrium (0.0%/month)'
  };

  const handleCopyGrid = () => {
    let summary = `ORBITRON MULTI-BODY COMPARISON MATRIX\n`;
    summary += `Parameter | Earth | ` + comparisonList.map((p) => p.pl_name).join(' | ') + `\n`;
    summary += `Radius | 1.00 R⊕ | ` + comparisonList.map((p) => (p.pl_rade ? `${p.pl_rade} R⊕` : 'N/A')).join(' | ') + `\n`;
    summary += `Mass | 1.00 M⊕ | ` + comparisonList.map((p) => (p.pl_bmasse ? `${p.pl_bmasse} M⊕` : 'N/A')).join(' | ') + `\n`;
    summary += `Gravity | 1.00 g | ` + comparisonList.map((p) => {
      const m = calculateHumanVisitMetrics(p);
      return m.surface_gravity_g ? `${m.surface_gravity_g} g` : 'N/A';
    }).join(' | ') + `\n`;
    summary += `Insolation Flux | 1.00 S⊕ | ` + comparisonList.map((p) => (p.pl_insol ? `${p.pl_insol} S⊕` : 'N/A')).join(' | ') + `\n`;
    summary += `Equilibrium Temp | 255 K | ` + comparisonList.map((p) => (p.pl_eqt ? `${p.pl_eqt} K` : 'N/A')).join(' | ') + `\n`;
    summary += `Data Source: NASA Exoplanet Archive composite table pscomppars.`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger Gemini Deep Differentiator Synthesis
  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    setShowInsights(true);
    try {
      const localKey = localStorage.getItem('orbitron_gemini_api_key') || undefined;
      const res = await fetch('/api/ai/compare-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planets: comparisonList,
          api_key: localKey
        })
      });
      if (!res.ok) throw new Error('API synthesis failed');
      const data = await res.json();
      setInsights(data.insights_markdown);
      setInsightsSource(data.source);
    } catch {
      setInsights(
        `### Comparative Differentiator Synthesis (Offline Engine)\n` +
        `Comparing Earth against ${comparisonList.map((p) => p.pl_name).join(', ')}.\n\n` +
        `**Key Differentiator:** Primary divergences center around host star spectral irradiance and surface gravity hydrostatic load. Earth orbits a quiet G-type star with moderate 1.0g surface pressure, while M-dwarf worlds experience significant high-energy UV flare and atmospheric stripping pressure.\n\n` +
        `*To enable open-world multi-model Gemini reasoning, enter your GEMINI_API_KEY in .env or the Ask AI settings.*`
      );
      setInsightsSource('Offline Fallback Engine');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Automatically synthesize differentiator insights on initial load or target change
  useEffect(() => {
    if (comparisonList.length > 0) {
      handleGenerateInsights();
    }
  }, [comparisonList.map((p) => p.pl_name).join(',')]);

  // Helper for computing delta percentage vs Earth
  const computeDelta = (val: number | null | undefined, base: number = 1.0) => {
    if (val == null || isNaN(val)) return null;
    const diff = Math.round(((val - base) / base) * 100);
    return diff > 0 ? `+${diff}%` : `${diff}%`;
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-[1520px] mx-auto text-white font-sans">
      {/* Visual Earth vs Exoplanet Comparison Hero Banner */}
      <div className="rounded-[24px] overflow-hidden border border-white/15 bg-black/95 relative shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/60 backdrop-blur-md">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Comparative Planetary Morphology & Radiative Equilibrium
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-mono flex items-center gap-2">
              <Scale className="w-5 h-5 text-white" />
              <span>Earth vs Exoplanet Comparison</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>Earth (Sol III)
            </span>
            <span className="text-neutral-500 font-bold">vs</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>{comparisonList[0]?.pl_name || 'Exoplanet Target'}
            </span>
          </div>
        </div>

        {/* High-Resolution Side-by-Side Planet Visual */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] max-h-[460px] bg-black flex items-center justify-center overflow-hidden">
          <img
            src="/assets/earth-vs-exoplanet.png"
            alt="Earth vs Exoplanet Comparison"
            className="w-full h-full object-contain filter contrast-105"
          />
        </div>

        <div className="p-4 bg-black/80 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-neutral-400">Reference Baseline:</span>
            <span className="text-white font-bold">Earth (Sol III) • G2V Main Sequence • 1.00 g</span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-neutral-400">Primary Target:</span>
            <span className="text-white font-bold">{comparisonList[0]?.pl_name || 'Target Exoplanet'} • {comparisonList[0]?.hostname || 'Host Star'}</span>
          </div>
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="p-5 rounded-[24px] glass-panel flex flex-wrap items-center justify-between gap-4 font-mono">
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
            SCIENTIFIC COMPARISON & DIFFERENTIATOR CORE
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-white" />
            <span>MULTI-TARGET PLANETARY ASTROPHYSICS GRID</span>
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Side-by-side empirical physical dimensions, orbital kinematics, and human biophysical impact indicators.
          </p>
        </div>

        {/* Add Planet Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {comparisonList.length < 4 && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedAddPlanet}
                onChange={(e) => setSelectedAddPlanet(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">+ Add Target World (up to 4)</option>
                {allPlanets
                  .filter((p) => !comparisonList.some((c) => c.pl_name === p.pl_name))
                  .slice(0, 40)
                  .map((p) => (
                    <option key={p.pl_name} value={p.pl_name}>
                      {p.pl_name} ({p.pl_rade ? `${p.pl_rade} R⊕` : 'no R'})
                    </option>
                  ))}
              </select>
              <button
                onClick={() => {
                  if (selectedAddPlanet) {
                    const found = allPlanets.find((p) => p.pl_name === selectedAddPlanet);
                    if (found) onAddPlanet(found);
                    setSelectedAddPlanet('');
                  }
                }}
                disabled={!selectedAddPlanet}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs cursor-pointer yt-hover-btn disabled:opacity-30"
              >
                Add
              </button>
            </div>
          )}

          <button
            onClick={handleGenerateInsights}
            disabled={loadingInsights}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs cursor-pointer yt-hover-btn hover:bg-neutral-200 transition-colors shadow-md"
            title="Generate AI Comparative Differentiator & Deep Insights"
          >
            {loadingInsights ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Synthesize Differentiator</span>
          </button>

          <button
            onClick={handleCopyGrid}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs text-white cursor-pointer yt-hover-btn font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Grid'}</span>
          </button>
        </div>
      </div>

      {/* AI Differentiator & Deep Insights Panel */}
      {insights && (
        <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono text-xs animate-fadeIn border border-white/20">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-bold text-white uppercase text-sm">
                  PLANETARY DIFFERENTIATOR & DEEP REASONING BRIEFING
                </h3>
                <span className="text-[10px] text-neutral-400">
                  Engine: {insightsSource || 'Google Gemini AI'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowInsights(!showInsights)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showInsights && (
            <div className="p-4 rounded-2xl bg-black/70 border border-white/10 text-neutral-200 text-xs leading-relaxed space-y-2 font-sans whitespace-pre-line">
              {insights}
            </div>
          )}
        </div>
      )}

      {/* Primary Comparison Grid Table */}
      <div className="rounded-[24px] glass-panel overflow-hidden border border-white/15 shadow-2xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            {/* Header Row: Targets */}
            <thead>
              <tr className="bg-black/90 border-b border-white/20 divide-x divide-white/10 text-neutral-300">
                <th className="p-4 w-64 uppercase tracking-wider text-[11px] font-bold text-white bg-black">
                  ASTROPHYSICAL METRIC
                </th>
                {/* Earth Column */}
                <th className="p-4 w-72 bg-white/5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-400">BASELINE STANDARD</div>
                      <div className="text-base font-bold text-white">EARTH (SOL III)</div>
                      <div className="text-[10px] text-neutral-400 font-sans">1.00 R⊕ • 1.00 M⊕ • 1.00 g</div>
                    </div>
                  </div>
                </th>
                {/* Dynamic Comparison Targets */}
                {comparisonList.map((p) => {
                  return (
                    <th key={p.pl_name} className="p-4 w-72 text-white bg-black/60">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-neutral-400">
                            HOST: {p.hostname}
                          </div>
                          <div className="text-base font-bold text-white truncate max-w-[170px]" title={p.pl_name}>
                            {p.pl_name}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-sans">
                            {p.sy_dist ? `~${Math.round(p.sy_dist * 3.26156)} ly` : 'Distance N/A'} • {p.discoverymethod || 'Transit'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onSelectPlanet(p);
                              onNavigate('anatomy_lab');
                            }}
                            title="Launch in Anatomy Lab"
                            className="p-1 rounded bg-white/10 hover:bg-white text-neutral-300 hover:text-black cursor-pointer transition-colors"
                          >
                            <Dna className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemovePlanet(p.pl_name)}
                            title="Remove Target"
                            className="p-1 rounded bg-white/10 hover:bg-white text-neutral-400 hover:text-black cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 text-neutral-200">
              {/* SECTION 1: PHYSICAL DIMENSIONS */}
              <tr className="bg-white/[0.04]">
                <td colSpan={comparisonList.length + 2} className="p-2.5 px-4 font-bold uppercase tracking-widest text-[10px] text-white">
                  PHYSICAL DIMENSIONS & BULK COMPOSITION
                </td>
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Planetary Radius (R⊕)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.radius}</td>
                {comparisonList.map((p) => {
                  const delta = computeDelta(p.pl_rade, 1.0);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{p.pl_rade != null ? `${p.pl_rade} R⊕` : 'Not available'}</span>
                        {delta && <span className="text-[10px] text-neutral-400">{delta} vs Earth</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Planetary Mass (M⊕)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.mass}</td>
                {comparisonList.map((p) => {
                  const delta = computeDelta(p.pl_bmasse, 1.0);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{p.pl_bmasse != null ? `${p.pl_bmasse} M⊕` : 'Not available'}</span>
                        {delta && <span className="text-[10px] text-neutral-400">{delta} vs Earth</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Bulk Density (g/cm³)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.density}</td>
                {comparisonList.map((p) => {
                  const m = calculateHumanVisitMetrics(p);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <span className="font-bold text-white">{m.bulk_density_g_cm3 != null ? `${m.bulk_density_g_cm3} g/cm³` : 'Not available'}</span>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Composition Regime</td>
                <td className="p-3.5 bg-white/[0.02] text-neutral-300 font-sans">{earth.rocky_status}</td>
                {comparisonList.map((p) => {
                  const isRocky = p.pl_rade != null && p.pl_rade <= 1.6;
                  return (
                    <td key={p.pl_name} className="p-3.5 font-sans">
                      <span className="text-white font-medium">
                        {p.pl_rade != null ? (isRocky ? 'Rocky Super-Earth (Rogers 2015)' : 'Volatile / Sub-Neptune') : 'Indeterminate'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* SECTION 2: SURFACE MECHANICS & GRAVITATIONAL FORCES */}
              <tr className="bg-white/[0.04]">
                <td colSpan={comparisonList.length + 2} className="p-2.5 px-4 font-bold uppercase tracking-widest text-[10px] text-white">
                  SURFACE GRAVIMETRY & ORBITAL MECHANICS
                </td>
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Surface Gravity (g)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.gravity}</td>
                {comparisonList.map((p) => {
                  const m = calculateHumanVisitMetrics(p);
                  const delta = computeDelta(m.surface_gravity_g, 1.0);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {m.surface_gravity_g != null ? `${m.surface_gravity_g} g` : 'Not available'}
                        </span>
                        {delta && <span className="text-[10px] text-neutral-400">{delta}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Escape Velocity (km/s)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.escape_vel}</td>
                {comparisonList.map((p) => {
                  const m = calculateHumanVisitMetrics(p);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <span className="font-bold text-white">
                        {m.escape_velocity_kms != null ? `${m.escape_velocity_kms} km/s` : 'Not available'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Orbital Period (days)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.period}</td>
                {comparisonList.map((p) => (
                  <td key={p.pl_name} className="p-3.5">
                    <span className="font-bold text-white">
                      {p.pl_orbper != null ? `${Math.round(p.pl_orbper * 100) / 100} d` : 'Not available'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* SECTION 3: STELLAR INSOLATION & THERMODYNAMICS */}
              <tr className="bg-white/[0.04]">
                <td colSpan={comparisonList.length + 2} className="p-2.5 px-4 font-bold uppercase tracking-widest text-[10px] text-white">
                  STELLAR INSOLATION & THERMAL ENVIRONMENT
                </td>
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Incident Stellar Flux (S⊕)</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.flux}</td>
                {comparisonList.map((p) => {
                  const delta = computeDelta(p.pl_insol, 1.0);
                  return (
                    <td key={p.pl_name} className="p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {p.pl_insol != null ? `${p.pl_insol} S⊕` : 'Not available'}
                        </span>
                        {delta && <span className="text-[10px] text-neutral-400">{delta}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Equilibrium Temperature</td>
                <td className="p-3.5 bg-white/[0.02] font-bold text-white">{earth.teq}</td>
                {comparisonList.map((p) => (
                  <td key={p.pl_name} className="p-3.5">
                    <span className="font-bold text-white">
                      {p.pl_eqt != null ? `${p.pl_eqt} K` : 'Not available'}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-sans">Assumes Bond albedo = 0</span>
                  </td>
                ))}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Host Star Spectral Type</td>
                <td className="p-3.5 bg-white/[0.02] font-sans text-neutral-300">{earth.host_star}</td>
                {comparisonList.map((p) => (
                  <td key={p.pl_name} className="p-3.5 font-sans">
                    <span className="font-bold text-white">{p.hostname}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {p.st_teff ? `${p.st_teff} K` : 'Teff uncatalogued'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* SECTION 4: HUMAN PHYSIOLOGICAL CONSEQUENCES */}
              <tr className="bg-white/[0.04]">
                <td colSpan={comparisonList.length + 2} className="p-2.5 px-4 font-bold uppercase tracking-widest text-[10px] text-white">
                  HUMAN BIOMEDICAL IMPACT & PHYSIOLOGICAL STRAIN
                </td>
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Cardiovascular Load</td>
                <td className="p-3.5 bg-white/[0.02] font-sans text-neutral-300">{earth.cardio_strain}</td>
                {comparisonList.map((p) => {
                  const m = calculateHumanVisitMetrics(p);
                  const g = m.surface_gravity_g;
                  let assessment = 'Indeterminate (requires mass & radius)';
                  if (g != null) {
                    if (g > 1.5) assessment = `Severe vascular pooling in lower limbs (${g}× load)`;
                    else if (g > 1.1) assessment = `Moderate hypertension & increased stroke work (${g}× load)`;
                    else if (g >= 0.9) assessment = `Nominal terrestrial-equivalent vascular strain (${g}×)`;
                    else assessment = `Cephalad fluid redistribution & vascular deconditioning (${g}×)`;
                  }
                  return (
                    <td key={p.pl_name} className="p-3.5 font-sans text-[11px] leading-relaxed">
                      {assessment}
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Musculoskeletal Demineralization</td>
                <td className="p-3.5 bg-white/[0.02] font-sans text-neutral-300">{earth.bone_resorption}</td>
                {comparisonList.map((p) => {
                  const m = calculateHumanVisitMetrics(p);
                  const g = m.surface_gravity_g;
                  let osteo = 'Indeterminate';
                  if (g != null) {
                    if (g < 0.4) osteo = 'Rapid trabecular bone loss (~1.0–1.5% bone mineral density/month)';
                    else if (g < 0.9) osteo = 'Moderate osteopenia without daily resistance countermeasures';
                    else if (g <= 1.2) osteo = 'Nominal osteoblast-osteoclast mechanical coupling maintained';
                    else osteo = 'Accelerated joint cartilage stress and axial skeletal compression';
                  }
                  return (
                    <td key={p.pl_name} className="p-3.5 font-sans text-[11px] leading-relaxed">
                      {osteo}
                    </td>
                  );
                })}
              </tr>
              <tr className="divide-x divide-white/10 hover:bg-white/[0.02]">
                <td className="p-3.5 font-semibold text-white">Diagnostic Action</td>
                <td className="p-3.5 bg-white/[0.02] font-sans text-neutral-400">Terrestrial Reference</td>
                {comparisonList.map((p) => (
                  <td key={p.pl_name} className="p-3.5">
                    <button
                      onClick={() => {
                        onSelectPlanet(p);
                        onNavigate('dossier');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs cursor-pointer hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
