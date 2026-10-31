import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Activity,
  Dna,
  Bug,
  Brain,
  HeartPulse,
  Info,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  RadiationScenarioInput,
  RadiationResult,
  ExtremophileData
} from '../types';
import {
  calculateRadiationDose,
  DEFAULT_RADIATION_SCENARIO,
  RADIATION_PRESETS,
  SHIELDING_PRESETS
} from '../lib/radiation';
import { JourneyStepper } from '../components/JourneyStepper';

interface RadiationLabProps {
  onNavigate: (tab: string) => void;
  selectedPlanetName?: string;
  selectedPlanetStellarFlux?: number | null;
  selectedPlanetHostTeff?: number | null;
}

export const RadiationLab: React.FC<RadiationLabProps> = ({
  onNavigate,
  selectedPlanetName,
  selectedPlanetStellarFlux,
  selectedPlanetHostTeff
}) => {
  const [activeTab, setActiveTab] = useState<'dosimetry' | 'microbiology'>('dosimetry');
  const [scenario, setScenario] = useState<RadiationScenarioInput>(DEFAULT_RADIATION_SCENARIO);
  const [extremophiles, setExtremophiles] = useState<ExtremophileData[]>([]);
  const [cellularBioData, setCellularBioData] = useState<any>(null);

  const result: RadiationResult = calculateRadiationDose(scenario);

  // Fetch microbiology data from backend
  useEffect(() => {
    fetch('/api/biology/extremophiles')
      .then((res) => res.json())
      .then((data) => setExtremophiles(data))
      .catch((err) => console.error('Failed to fetch extremophiles', err));

    fetch('/api/biology/cellular-radiation')
      .then((res) => res.json())
      .then((data) => setCellularBioData(data))
      .catch((err) => console.error('Failed to fetch cellular radiobiology data', err));
  }, []);

  // Generate dose over time chart data
  const chartData = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const day = Math.round((scenario.duration_days / steps) * i);
    const doseUnshielded = Math.round(scenario.dose_rate_msv_day * day * 10) / 10;
    const doseShielded = Math.round(doseUnshielded * scenario.shielding_transmission * 10) / 10;
    chartData.push({
      day,
      doseShielded,
      doseUnshielded
    });
  }

  const handleReset = () => {
    setScenario(DEFAULT_RADIATION_SCENARIO);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Journey Stepper */}
      <JourneyStepper
        currentStep="protect"
        selectedPlanetName={selectedPlanetName}
        onNavigate={(step) => {
          if (step === 'discover') onNavigate('explorer');
          if (step === 'analyze') onNavigate('habitability');
          if (step === 'detect') onNavigate('spectrum');
          if (step === 'compare') onNavigate('comparison');
        }}
      />

      {/* Header & Sub-Tab Navigation */}
      <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl md:text-2xl font-bold font-mono text-white">
                DEEP SPACE RADIATION & ASTROBIOLOGY LAB
              </h1>
            </div>
            <p className="text-xs text-[#AFC2D9]">
              GCR/SPE ion transport dosimetry scenarios, cellular DNA double-strand break kinetics, and extremophile survival envelopes.
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs">
            <button
              onClick={() => setActiveTab('dosimetry')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dosimetry'
                  ? 'bg-cyan-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dosimetry Calculator
            </button>
            <button
              onClick={() => setActiveTab('microbiology')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'microbiology'
                  ? 'bg-cyan-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-emerald-400" />
              <span>Microbiology & Radiobiology</span>
            </button>
          </div>
        </div>

        {/* Selected Exoplanet Environmental Context (Honest Version - Section 6.6) */}
        {selectedPlanetName && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-semibold">Exoplanet Context:</span>
              <span className="text-white font-bold">{selectedPlanetName}</span>
              <span className="text-slate-500">•</span>
              <span>Stellar Flux: {selectedPlanetStellarFlux ? `${selectedPlanetStellarFlux} S⊕` : 'N/A'}</span>
              <span className="text-slate-500">•</span>
              <span>Host Teff: {selectedPlanetHostTeff ? `${selectedPlanetHostTeff} K` : 'N/A'}</span>
            </div>
            <div className="text-[10px] text-amber-300 font-mono">
              Note: Exoplanet surface radiation is UNKNOWN. Stellar flux is not converted to dose.
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Regulatory & Scientific Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-300 font-mono text-[11px] uppercase tracking-wider">
            Educational Dosimetry Model Limitation
          </div>
          <p className="text-[11px] leading-relaxed">
            {result.notice} Dosimetry calculations operate strictly in <strong>mSv (dose equivalent)</strong>.
            Real cosmic shielding involves complex hadronic cascades, secondary neutron production, and nuclear fragmentation governed by target Z-number.
          </p>
        </div>
      </div>

      {activeTab === 'dosimetry' ? (
        <>
          {/* Controls & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls Panel */}
            <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Scenario Parameters
                </h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Environment Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Radiation Environment Preset</label>
                <select
                  value={scenario.environment_name}
                  onChange={(e) => {
                    const key = e.target.value;
                    const preset = RADIATION_PRESETS[key];
                    setScenario({
                      ...scenario,
                      environment_name: key,
                      dose_rate_msv_day: preset ? preset.dose_rate : scenario.dose_rate_msv_day
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="iss_leo">ISS Low Earth Orbit (0.50 mSv/day)</option>
                  <option value="interplanetary_transit">Interplanetary Cruise / GCR (1.80 mSv/day)</option>
                  <option value="mars_surface">Martian Surface (0.64 mSv/day)</option>
                  <option value="solar_particle_event">Solar Particle Event Peak (25.0 mSv/day)</option>
                  <option value="custom">Custom Configuration</option>
                </select>
                {RADIATION_PRESETS[scenario.environment_name] && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Source: {RADIATION_PRESETS[scenario.environment_name].source}
                  </p>
                )}
              </div>

              {/* Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Mission Duration (Days)</span>
                  <span className="text-cyan-300 font-bold">{scenario.duration_days} days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={1000}
                  step={1}
                  value={scenario.duration_days}
                  onChange={(e) =>
                    setScenario({ ...scenario, duration_days: parseInt(e.target.value) || 1 })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 day</span>
                  <span>180 d (Transit)</span>
                  <span>1000 d</span>
                </div>
              </div>

              {/* Daily Dose Rate Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Unshielded Dose Rate (mSv/day)</span>
                  <span className="text-amber-300 font-bold">{scenario.dose_rate_msv_day} mSv/d</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="100"
                  value={scenario.dose_rate_msv_day}
                  onChange={(e) =>
                    setScenario({ ...scenario, dose_rate_msv_day: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Shielding Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Shielding Configuration</label>
                <select
                  value={scenario.shielding_name}
                  onChange={(e) => {
                    const key = e.target.value;
                    const p = SHIELDING_PRESETS[key];
                    setScenario({
                      ...scenario,
                      shielding_name: key,
                      shielding_transmission: p ? p.transmission : scenario.shielding_transmission
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="none">No Shielding (100% transmission)</option>
                  <option value="light">Light Shielding (90% transmission, ~2 g/cm² Al)</option>
                  <option value="moderate">Moderate Shielding (70% transmission, Storm Shelter)</option>
                  <option value="heavy">Heavy Shielding (50% transmission, Water / Regolith)</option>
                </select>
                {SHIELDING_PRESETS[scenario.shielding_name] && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    {SHIELDING_PRESETS[scenario.shielding_name].material_note}
                  </p>
                )}
              </div>
            </div>

            {/* Dosimetry Output Metrics (2 Cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#0B1F3A]/90 border border-cyan-500/40">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                    Cumulative Mission Dose
                  </span>
                  <div className="text-2xl md:text-3xl font-black font-mono text-white mt-1">
                    {result.cumulative_dose_msv}{' '}
                    <span className="text-sm font-sans text-slate-400 font-normal">mSv</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Equivalent dose absorbed
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1F3A]/90 border border-slate-700">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Unshielded Potential
                  </span>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-rose-400 mt-1">
                    {result.unshielded_dose_msv}{' '}
                    <span className="text-sm font-sans text-slate-400 font-normal">mSv</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Saved by shield: {result.dose_avoided_msv} mSv
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B1F3A]/90 border border-slate-700 col-span-2 md:col-span-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Effective Daily Rate
                  </span>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-cyan-300 mt-1">
                    {result.effective_daily_rate_msv}{' '}
                    <span className="text-sm font-sans text-slate-400 font-normal">mSv/d</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    After transmission factor
                  </span>
                </div>
              </div>

              {/* Dose Over Time Chart */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#24466B] space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">
                    CUMULATIVE DOSE ACCUMULATION OVER TIME
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Shielded Dose
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Unshielded
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1C385C" />
                      <XAxis
                        dataKey="day"
                        stroke="#AFC2D9"
                        fontSize={11}
                        label={{ value: 'Mission Days', position: 'insideBottom', offset: -12, fill: '#AFC2D9', fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#AFC2D9"
                        fontSize={11}
                        label={{ value: 'Dose (mSv)', angle: -90, position: 'insideLeft', fill: '#AFC2D9', fontSize: 11 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white shadow-xl space-y-1">
                                <div>Day {data.day}</div>
                                <div className="text-cyan-400">Shielded: {data.doseShielded} mSv</div>
                                <div className="text-rose-400">Unshielded: {data.doseUnshielded} mSv</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="doseUnshielded"
                        stroke="#F43F5E"
                        fill="#F43F5E"
                        fillOpacity={0.15}
                      />
                      <Area
                        type="monotone"
                        dataKey="doseShielded"
                        stroke="#4CC9E8"
                        fill="#4CC9E8"
                        fillOpacity={0.3}
                      />
                      <ReferenceLine y={600} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'NASA Career Max (600 mSv)', fill: '#F59E0B', fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Benchmarks Bar */}
          <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-[#24466B] space-y-3">
            <h4 className="text-xs font-mono text-cyan-400 uppercase font-semibold">
              Verified Scientific Dosimetry Benchmarks
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
              {result.reference_benchmarks.map((bm, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 truncate">{bm.name}</div>
                  <div className="text-base font-bold text-white mt-0.5">{bm.dose_msv} mSv</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug">{bm.note}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Sub-Tab 2: Astrobiology & Microbiology Lab (Directly fulfilling Screenshot 155008 & 155019) */
        <div className="space-y-6">
          {/* Cellular Radiobiology & DNA Damage Panel (Screenshots 155008 & 155019) */}
          <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-cyan-500/30 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  RADIOBIOLOGY & CELLULAR DNA STRAND KINETICS
                </span>
                <h3 className="text-lg font-bold font-mono text-white">
                  DNA Damage, γ-H2AX Foci & Cellular Repair Response
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Rothkamm & Löbrich (2003) Benchmark
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Estimated DNA Double-Strand Breaks</span>
                <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                  ~{result.cellular_metrics.est_double_strand_breaks_per_cell}{' '}
                  <span className="text-xs font-sans text-slate-400 font-normal">DSBs / cell</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Based on ~35 DSBs/Gy per cell nucleus in mammalian fibroblasts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">γ-H2AX Repair Foci Density</span>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                  ~{result.cellular_metrics.gamma_h2ax_foci_per_cell}{' '}
                  <span className="text-xs font-sans text-slate-400 font-normal">foci / cell</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Phosphorylated Ser-139 on histone H2AX marking double strand lesion sites.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Repair Pathway Capacity</span>
                <div className="text-xs font-mono text-emerald-300 font-semibold mt-1 leading-snug">
                  {result.cumulative_dose_msv < 500 ? 'Autonomous NHEJ & HR Active' : 'Complex Lesions Overload'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {result.cellular_metrics.cellular_repair_outlook}
                </p>
              </div>
            </div>

            {/* γ-H2AX Dose Response Table (Directly matching Screenshot 155008 0-1000 mGy levels!) */}
            {cellularBioData?.foci_dose_response && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-cyan-300 font-semibold">
                  Empirical Radiation Foci Calibration (0 mGy to 1000 mGy)
                </h4>
                <div className="rounded-xl border border-[#24466B] overflow-x-auto bg-[#0B1F3A]/40">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-[#24466B]">
                      <tr>
                        <th className="p-2.5">Acute Dose (mGy)</th>
                        <th className="p-2.5">γ-H2AX Foci / Cell</th>
                        <th className="p-2.5">Physiological Status</th>
                        <th className="p-2.5">Repair Kinetics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24466B]/50 text-slate-300">
                      {cellularBioData.foci_dose_response.map((f: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold text-white">{f.dose_mgy} mGy</td>
                          <td className="p-2.5 text-cyan-300">{f.gamma_h2ax_foci_per_cell}</td>
                          <td className="p-2.5 text-slate-300">{f.status}</td>
                          <td className="p-2.5 text-slate-400">{f.repair_kinetics}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Organ System Vulnerabilities (Screenshot 155019) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
                  <HeartPulse className="w-4 h-4" />
                  <span>Hematopoietic & Immune System Impact</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  High radiation sensitivity. Bone marrow hematopoietic progenitor depletion, selective reduction of CD4+ T-helper cells, and suppression of secondary humoral immune cascades.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
                  <Brain className="w-4 h-4" />
                  <span>Central Nervous System & Brain Risks</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  High-Z and energy (HZE) cosmic ions trigger microglial activation, persistent neuro-inflammation, synaptic dendritic spine pruning, and cognitive performance deficits.
                </p>
              </div>
            </div>
          </div>

          {/* Model Extremophiles & Astrobiology Survival Limits */}
          <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-[#24466B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  ASTROBIOLOGY & MICROBIAL SURVIVAL ENVELOPES
                </span>
                <h3 className="text-lg font-bold font-mono text-white">
                  Model Polyextremophiles in Space & Extreme Regimes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Biological benchmarks for exoplanet suitability
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extremophiles.map((ext) => (
                <div
                  key={ext.species}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">
                        {ext.class}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-slate-700 text-cyan-300">
                        {ext.survival_ratio_vs_human}× Human Limit
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-mono text-white italic">
                      {ext.species}
                    </h4>

                    <div className="text-xs text-amber-300 font-medium">
                      Resistance: {ext.primary_resistance}
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      Radiation Tolerance:{' '}
                      <strong className="text-emerald-400">{ext.radiation_tolerance_gy} Gy</strong> (Human: 5 Gy)
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {ext.cellular_mechanism}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono space-y-1">
                    <div>
                      Temp: <span className="text-slate-200">{ext.habitable_envelope.temperature_c}°C</span> | pH: <span className="text-slate-200">{ext.habitable_envelope.ph_range}</span>
                    </div>
                    <div className="text-cyan-300/80">
                      Space data: {ext.space_exposure_data}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
