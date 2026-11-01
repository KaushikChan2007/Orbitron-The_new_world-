import React, { useState } from 'react';
import {
  Dna,
  ShieldAlert,
  Activity,
  RotateCcw,
  AlertTriangle,
  Brain,
  Eye,
  HeartPulse,
  Bone,
  ShieldCheck,
  Info,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileText
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
import environmentsData from '../config/environments.json';
import bioEffectsData from '../data/bio_effects.json';
import { Exoplanet } from '../types';

interface AnatomyLabProps {
  selectedPlanet: Exoplanet | null;
  onNavigate: (view: string) => void;
}

export const AnatomyLab: React.FC<AnatomyLabProps> = ({
  selectedPlanet,
  onNavigate
}) => {
  // Scenario inputs
  const [selectedEnvId, setSelectedEnvId] = useState('deep_space_transit');
  const [durationDays, setDurationDays] = useState(180);
  const [shieldingId, setShieldingId] = useState('moderate');
  const [activeTab, setActiveTab] = useState<'dna' | 'cellular' | 'immune' | 'nervous' | 'body' | 'papers'>('dna');
  const [dnaVisualMode, setDnaVisualMode] = useState<'mechanism' | 'pathways' | 'canvas'>('mechanism');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('brain');

  const env = environmentsData.environments.find((e) => e.id === selectedEnvId) || environmentsData.environments[0];
  const shield = environmentsData.shielding.find((s) => s.id === shieldingId) || environmentsData.shielding[2];

  // Biophysical calculations (Rothkamm & Löbrich 2003, Zeitlin et al. 2013)
  const absorbedMgy = Math.round(env.dose_rate_mgy_day * durationDays * shield.transmission * 10) / 10;
  const doseEquivMsv = Math.round(env.dose_rate_msv_day * durationDays * shield.transmission * 10) / 10;
  
  // Illustrative DSBs before enzymatic repair (~35 DSBs per Gy = 0.035 DSBs/mGy in human cells)
  const dsbPerCell = Math.round((absorbedMgy / 1000) * 35.0 * 10) / 10;

  // Fraction of NASA career limit (600 mSv)
  const careerFraction = Math.min(1.0, doseEquivMsv / 600.0);

  // Dose timeline data for monochrome AreaChart
  const timelineData = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const d = Math.round((durationDays / steps) * i);
    const unshielded = Math.round(env.dose_rate_msv_day * d * 10) / 10;
    const shielded = Math.round(unshielded * shield.transmission * 10) / 10;
    timelineData.push({ day: d, shielded, unshielded });
  }

  const handleReset = () => {
    setSelectedEnvId('deep_space_transit');
    setDurationDays(180);
    setShieldingId('moderate');
  };

  const activeHotspot = bioEffectsData.hotspots.find((h) => h.id === selectedHotspotId) || bioEffectsData.hotspots[0];

  // Pure monochrome evidence badge
  const renderBadge = (badge: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/20 uppercase tracking-wider bg-white/5 text-white">
        {badge}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1520px] mx-auto text-white font-sans">
      {/* Top Hero Banner */}
      <div className="relative rounded-[24px] border border-white/20 bg-black overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/assets/dna-hero.jpg"
            alt="DNA Radiation Biophysics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>NASA SPACE BIOMEDICAL RESEARCH FACILITY</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
            BIOMOLECULAR ANATOMY LAB
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
            From single particle ion tracks to systemic human physiology: investigate ionizing radiation damage, γ-H2AX foci formation, and microgravity cephalad fluid shifts grounded in peer-reviewed aerospace radiobiology.
          </p>
        </div>
      </div>

      {/* Mandatory Scientific Notice */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/15 text-xs text-neutral-300 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="text-white font-mono font-bold uppercase tracking-wider">Scientific & Educational Integrity Notice:</span>{' '}
          All cellular models and DNA strand break counters are <strong>illustrative simulations</strong> calibrated against published radiobiology (Rothkamm & Löbrich 2003; NASA Twins Study 2019). Exoplanet surface radiation is currently unmeasured.
        </div>
      </div>

      {/* Two Column Grid: Controls (Left) & Simulation Tabs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Glass Control Panel (Cols 1-4) */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          <div className="p-5 rounded-[22px] glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                SCENARIO DOSIMETRY CONTROLS
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Environment Preset */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase">
                Radiation Environment Preset
              </label>
              <select
                value={selectedEnvId}
                onChange={(e) => setSelectedEnvId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {environmentsData.environments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-neutral-500">
                Source: {env.source}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Mission Duration:</span>
                <span className="text-white font-bold">{durationDays} days</span>
              </div>
              <input
                type="range"
                min={1}
                max={1000}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-500">
                <span>1 d</span>
                <span>180 d (Mars Transit)</span>
                <span>1000 d</span>
              </div>
            </div>

            {/* Shielding Preset */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase">
                Shielding Transmission Preset
              </label>
              <select
                value={shieldingId}
                onChange={(e) => setShieldingId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {environmentsData.shielding.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (×{s.transmission})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-neutral-500">
                {shield.notes}
              </div>
            </div>

            {/* Selected Planet Context */}
            {selectedPlanet && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                  Connected Target Context
                </span>
                <div className="text-xs font-bold text-white">
                  {selectedPlanet.pl_name}
                </div>
                <div className="text-[10px] text-neutral-300 leading-tight">
                  Surface Gravity: {selectedPlanet.pl_bmasse && selectedPlanet.pl_rade ? `${Math.round((selectedPlanet.pl_bmasse / Math.pow(selectedPlanet.pl_rade, 2)) * 100) / 100} g` : 'Unmeasured'} • Host: {selectedPlanet.hostname} ({selectedPlanet.st_teff ? `${selectedPlanet.st_teff} K` : 'N/A'})
                </div>
                <div className="text-[9px] text-neutral-500 italic pt-0.5">
                  Surface dose rate is unmeasured; orbital mechanics shown for scale.
                </div>
              </div>
            )}
          </div>

          {/* Computed Dosimetry Output Card */}
          <div className="p-5 rounded-[22px] glass-panel space-y-3.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              COMPUTED PHYSICAL OUTPUTS
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3.5 rounded-xl bg-black border border-white/10">
                <span className="text-[9px] text-neutral-400 block uppercase">Absorbed Dose</span>
                <span className="text-2xl font-bold text-white">{absorbedMgy}</span>
                <span className="text-[10px] text-neutral-400 block">mGy (physical energy)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-white/10">
                <span className="text-[9px] text-neutral-400 block uppercase">Dose Equivalent</span>
                <span className="text-2xl font-bold text-white">{doseEquivMsv}</span>
                <span className="text-[10px] text-neutral-400 block">mSv (biological effect)</span>
              </div>
            </div>

            {/* NASA Career Limit Benchmark */}
            <div className="space-y-1 pt-1 font-mono">
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-400">NASA Career Benchmark (600 mSv)</span>
                <span className="text-white font-bold">{Math.round(careerFraction * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round(careerFraction * 100))}%` }}
                />
              </div>
              <div className="text-[9px] text-neutral-500">
                UNSCEAR natural terrestrial background: 2.4 mSv/year
              </div>
            </div>

            {/* Timeline Area Chart (Strict Monochrome) */}
            <div className="pt-2">
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" stroke="#888888" fontSize={9} />
                    <YAxis stroke="#888888" fontSize={9} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div className="p-2 bg-black border border-white/30 rounded-lg text-[10px] font-mono text-white shadow-xl">
                              <div>Day {p.day}</div>
                              <div className="font-bold">Shielded: {p.shielded} mSv</div>
                              <div className="text-neutral-400">Unshielded: {p.unshielded} mSv</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="unshielded" stroke="#666666" strokeDasharray="3 3" fill="rgba(255,255,255,0.02)" />
                    <Area type="monotone" dataKey="shielded" stroke="#FFFFFF" fill="rgba(255,255,255,0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Research Tabs (Cols 5-12) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono">
            {[
              { id: 'dna', label: 'DNA Damage' },
              { id: 'cellular', label: 'Cellular Foci' },
              { id: 'immune', label: 'Immune System' },
              { id: 'nervous', label: 'Nervous System' },
              { id: 'body', label: 'Anatomical Hotspots' },
              { id: 'papers', label: 'Research Papers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer yt-hover-btn ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: DNA DAMAGE */}
          {activeTab === 'dna' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <Dna className="w-4 h-4 text-white" />
                    <span>DOUBLE-STRAND BREAK (DSB) & REPAIR SIMULATION</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Physical ion trajectory kinematics and enzymatic repair pathway competition.
                  </p>
                </div>
                {renderBadge('Calibrated in Human Fibroblasts')}
              </div>

              {/* Visual Figure Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setDnaVisualMode('mechanism')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    dnaVisualMode === 'mechanism' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Direct & Indirect Damage Mechanism
                </button>
                <button
                  onClick={() => setDnaVisualMode('pathways')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    dnaVisualMode === 'pathways' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  DNA Repair Pathways & Endpoints
                </button>
                <button
                  onClick={() => setDnaVisualMode('canvas')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    dnaVisualMode === 'canvas' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Heavy Ion Track Simulation
                </button>
              </div>

              {/* FIGURE 1: Direct & Indirect Radiation Damage */}
              {dnaVisualMode === 'mechanism' && (
                <div className="rounded-2xl bg-black border border-white/20 overflow-hidden space-y-3 p-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h4 className="font-mono font-bold text-white text-sm">
                        Direct vs Indirect Radiation Damage to Cellular DNA
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-sans">
                        Physical strand scission vs water radiolysis reactive oxygen species generation (•OH, •O₂⁻).
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Biophysical Mechanism</span>
                  </div>

                  <div className="relative w-full rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center max-h-[420px]">
                    <img
                      src="/assets/direct-indirect-radiation.png"
                      alt="Direct & Indirect Radiation Damage Mechanism"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-white font-bold block">Direct Ion Action:</span>
                      <span className="text-neutral-300 text-[11px] font-sans">High-LET charged particles directly ionize electrons from DNA bases and sugar-phosphate bonds, causing complex clustered strand breaks.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-white font-bold block">Indirect Water Radiolysis:</span>
                      <span className="text-neutral-300 text-[11px] font-sans">Ionization of cellular H₂O yields free radicals (•OH, •O₂⁻, H₂O₂) diffusing within ~4 nm to oxidize DNA, accounting for ~70% of low-LET damage.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FIGURE 2: DNA Repair Kinetics & Endpoints Flowchart */}
              {dnaVisualMode === 'pathways' && (
                <div className="rounded-2xl bg-black border border-white/20 overflow-hidden space-y-3 p-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h4 className="font-mono font-bold text-white text-sm">
                        DNA Damage Repair Outcomes & Mutational Cascades
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-sans">
                        Enzymatic repair fidelity: Correct repair (survival), Mis-repair (cancer/aberration), Un-repair (apoptosis).
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Cellular Fate Engine</span>
                  </div>

                  <div className="relative w-full rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center max-h-[420px]">
                    <img
                      src="/assets/dna-repair-pathways.png"
                      alt="DNA Damage Repair Pathways and Outcomes"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-emerald-300 font-bold block">Correct Repair:</span>
                      <span className="text-neutral-300 text-[10px] font-sans">High-fidelity Homologous Recombination (HR) preserves genomic sequence; cell survives normally.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                      <span className="text-amber-300 font-bold block">Mis-Repair:</span>
                      <span className="text-neutral-300 text-[10px] font-sans">Error-prone NHEJ leads to chromosome translocations and neoplastic cell transformation.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
                      <span className="text-rose-300 font-bold block">Un-Repair:</span>
                      <span className="text-neutral-300 text-[10px] font-sans">Persistent clustered DSBs trigger p53 checkpoints, mitotic catastrophe, apoptosis, and necrosis.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Canvas / Graphic View */}
              {dnaVisualMode === 'canvas' && (
                <div className="relative h-64 rounded-2xl bg-black border border-white/15 overflow-hidden flex items-center justify-center p-4 animate-fadeIn">
                  <img
                    src="/assets/dna-hero.jpg"
                    alt="DNA Double Helix Radiation Damage"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

                  {/* Overlay live metrics */}
                  <div className="absolute top-4 left-4 z-10 px-3.5 py-2.5 rounded-xl bg-black/90 border border-white/20 text-xs font-mono">
                    <span className="text-[10px] text-neutral-400 uppercase block">Simulated DSBs per Cell</span>
                    <span className="text-2xl font-bold text-white">~{dsbPerCell}</span>
                    <span className="text-[10px] text-neutral-400 block">(calibrated at ~35 DSBs/Gy, Rothkamm 2003)</span>
                  </div>

                  <div className="absolute bottom-4 right-4 z-10 px-3.5 py-2.5 rounded-xl bg-black/90 border border-white/20 text-[10px] font-mono text-neutral-300 max-w-xs text-right">
                    Heavy Ion Traversal: A cell nucleus is crossed by an energetic HZE particle ~once every several months during deep-space transit (Zeitlin et al. 2013).
                  </div>
                </div>
              )}

              {/* Side Facts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <h4 className="font-mono font-bold text-white text-xs">Repair Pathways: NHEJ vs HR</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Non-Homologous End Joining (NHEJ) functions throughout all cell cycles but is inherently error-prone, causing deletions. Homologous Recombination (HR) provides high-fidelity repair but requires a sister chromatid, restricting it to late S/G2 phases.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <h4 className="font-mono font-bold text-white text-xs">Clustered High-LET Damage</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Cosmic heavy ions (Fe, Si, C) deposit concentrated ionization cores. These produce complex, clustered DNA damage lesions that exceed normal cellular repair capacity, generating persistent translocations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CELLULAR CHANGES & FOCI GRID (Matching Reference Micrographs) */}
          {activeTab === 'cellular' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    CELLULAR NUCLEI & γ-H2AX FOCI CALIBRATION GRID
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Simulation of γ-H2AX phosphorylated histone foci formed per human nucleus as a function of acute dose.
                  </p>
                </div>
                {renderBadge('Rothkamm & Löbrich (2003)')}
              </div>

              {/* Micrograph Reference Image */}
              <div className="rounded-2xl border border-white/15 overflow-hidden bg-black relative">
                <img
                  src="/assets/dna-damage.jpg"
                  alt="Microscopy Foci Reference"
                  className="w-full max-h-56 object-contain mx-auto"
                />
              </div>

              {/* Simulated Nuclei Grid at Standard Benchmarked Doses */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center font-mono">
                {[0, 200, 300, 400, 500, 1000].map((dose) => {
                  const foci = Math.round((dose / 1000) * 35 * 10) / 10;
                  return (
                    <div key={dose} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                      <div className="text-[10px] text-neutral-400 font-bold">{dose} mGy</div>
                      <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/20 flex items-center justify-center relative">
                        {/* Simulating fluorescent foci points */}
                        {Array.from({ length: Math.min(14, Math.round(foci)) }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white"
                            style={{
                              top: `${18 + (i * 19) % 64}%`,
                              left: `${18 + (i * 27) % 64}%`
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-[11px] font-bold text-white">~{foci} foci</div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-neutral-300 leading-relaxed font-mono">
                <strong>Dosimetry Calibration:</strong> Human primary fibroblasts exhibit a linear yield of ~35 γ-H2AX foci per cell per Gray within 30 minutes of irradiation (Rothkamm & Löbrich, PNAS 2003). The 1000 mGy step serves as the high-dose laboratory calibration benchmark.
              </div>
            </div>
          )}

          {/* TAB 3: IMMUNE SYSTEM */}
          {activeTab === 'immune' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    IMMUNE DYSREGULATION & LATENT VIRAL REACTIVATION
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Observed shifts in astronaut lymphocyte populations and opportunistic viral shedding.
                  </p>
                </div>
                {renderBadge('Garrett-Bakelman et al. (2019)')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-2xl border border-white/15 overflow-hidden bg-black h-52">
                  <img
                    src="/assets/immune.jpg"
                    alt="Immune System Cell Dynamics"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
                  <p>
                    Long-duration spaceflight is consistently associated with alterations in peripheral blood leukocyte distributions, reductions in T-cell and Natural Killer (NK) cell cytotoxicity, and persistent early-stage inflammatory cytokine cascades.
                  </p>
                  <p>
                    Latent herpesviruses (Epstein-Barr virus, Cytomegalovirus, Varicella-Zoster) reactivate and shed in astronaut saliva and urine at rates substantially exceeding terrestrial ground controls.
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400 p-2.5 rounded-lg bg-black border border-white/10">
                    Synergistic Etiology: Microgravity fluid shifts, chronic low-dose GCR exposure, altered circadian rhythms, and isolated habitat confinement.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NERVOUS SYSTEM */}
          {activeTab === 'nervous' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    CENTRAL NERVOUS SYSTEM & SANS SYNDROME
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Heavy-ion neurocognitive risks vs. microgravity venous hypertension ocular syndromes.
                  </p>
                </div>
                {renderBadge('Aerospace Medicine Review')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-2xl border border-white/15 overflow-hidden bg-black h-52">
                  <img
                    src="/assets/nervous.jpg"
                    alt="Central Nervous System"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-white text-xs">Heavy-Ion CNS Degradation</span>
                      {renderBadge('Animal Models')}
                    </div>
                    <p className="text-[11px]">
                      Rodents exposed to accelerated 56Fe particles demonstrate significant reductions in dendritic branching and spine density in the medial prefrontal cortex and hippocampus, causing memory and task-switching deficits.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-white text-xs">SANS (Spaceflight Associated Neuro-ocular Syndrome)</span>
                      {renderBadge('Human Clinical Data')}
                    </div>
                    <p className="text-[11px]">
                      Optic disc edema, posterior globe flattening, and choroidal folds are driven by cephalad venous fluid redistribution under microgravity, <strong>not</strong> by radiation exposure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHOLE BODY ANATOMY HOTSPOTS */}
          {activeTab === 'body' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    INTERACTIVE HUMAN ANATOMICAL HOTSPOTS
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Select any organ target to inspect clinical evidence, scientific limitations, and literature citations.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  Select region below
                </span>
              </div>

              {/* Hotspot buttons grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bioEffectsData.hotspots.map((h) => {
                  const isSelected = selectedHotspotId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspotId(h.id)}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer yt-hover-btn border font-mono ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] text-neutral-400 hover:text-white border-white/10'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-70">
                        {h.target_region}
                      </div>
                      <div className="text-xs font-bold truncate">{h.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hotspot Detail Card */}
              {activeHotspot && (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase">Target Organ</span>
                      <h4 className="text-sm font-bold text-white">{activeHotspot.name}</h4>
                    </div>
                    {renderBadge(activeHotspot.evidence_badge)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                    <div className="space-y-1">
                      <span className="text-white font-mono text-[10px] uppercase font-bold">Stressor:</span>
                      <p className="text-neutral-200">{activeHotspot.stressor}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white font-mono text-[10px] uppercase font-bold">What Research Shows:</span>
                      <p className="text-neutral-300 leading-relaxed">{activeHotspot.what_research_shows}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black border border-white/10 text-[10px] font-sans text-neutral-400 space-y-1">
                    <div><strong>Scientific Limitation:</strong> {activeHotspot.limitation}</div>
                    <div className="text-white"><strong>Source Citation:</strong> {activeHotspot.source}</div>
                  </div>
                </div>
              )}

              {/* NASA Twins Study Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-sans space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-[11px]">
                    {bioEffectsData.twins_study.title}
                  </span>
                  {renderBadge(bioEffectsData.twins_study.evidence_badge)}
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Citation: {bioEffectsData.twins_study.citation}
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-300 list-disc list-inside">
                  {bioEffectsData.twins_study.key_findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: PEER-REVIEWED RESEARCH PAPERS & METHODOLOGIES */}
          {activeTab === 'papers' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span>PEER-REVIEWED SCIENTIFIC FOUNDATION</span>
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Foundational astrophysics, radiobiology, and aerospace medicine papers underpinning Orbitron algorithms.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  {
                    title: 'Rothkamm & Löbrich (2003)',
                    journal: 'Proceedings of the National Academy of Sciences (PNAS)',
                    doi: '10.1073/pnas.0830918100',
                    topic: 'Evidence for a lack of DNA double-strand break repair in human cells exposed to very low x-ray doses (~35 DSB/Gy baseline).'
                  },
                  {
                    title: 'Garrett-Bakelman et al. (2019) NASA Twins Study',
                    journal: 'Science 364(6436):eaau8650',
                    doi: '10.1126/science.aau8650',
                    topic: 'The NASA Twins Study: A multidimensional analysis of a year-long human spaceflight on the ISS (telomere dynamics, immune dysregulation).'
                  },
                  {
                    title: 'Zeitlin et al. (2013) & Hassler et al. (2014)',
                    journal: 'Science 340(6136) & 343(6169)',
                    doi: '10.1126/science.1235989',
                    topic: 'Measurements of energetic particle radiation in transit to Mars and on the Martian surface with the Mars Science Laboratory (MSL RAD).'
                  },
                  {
                    title: 'Kopparapu et al. (2013)',
                    journal: 'The Astrophysical Journal 765:131',
                    doi: '10.1088/0004-637X/765/2/131',
                    topic: 'Habitable Zones around Main-Sequence Stars: Updated Estimates (Runaway Greenhouse & Maximum Greenhouse flux limits).'
                  },
                  {
                    title: 'Zeng, Li et al. (2019)',
                    journal: 'PNAS 116(20):9723-9728',
                    doi: '10.1073/pnas.1818087116',
                    topic: 'Growth model interpretation of planet size distribution and theoretical mass-radius composition curves (Iron, Silicate, Water worlds).'
                  },
                  {
                    title: 'Rogers, L. A. (2015)',
                    journal: 'The Astrophysical Journal 801:41',
                    doi: '10.1088/0004-637X/801/1/41',
                    topic: 'Most 1.6 Earth-radius planets are not rocky (Volatile envelope transition threshold).'
                  }
                ].map((paper, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{paper.title}</span>
                      <span className="text-[10px] text-neutral-400">{paper.journal}</span>
                    </div>
                    <p className="text-[11px] font-sans text-neutral-300">{paper.topic}</p>
                    <div className="text-[10px] text-neutral-500 pt-1">DOI: {paper.doi}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};