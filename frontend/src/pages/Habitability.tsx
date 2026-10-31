import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Info,
  ShieldCheck,
  Compass,
  LineChart,
  SplitSquareVertical,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Exoplanet, HabitabilityResult } from '../types';
import { calculateHabitability } from '../lib/habitability';
import { JourneyStepper } from '../components/JourneyStepper';
import { PlanetPassportModal } from '../components/PlanetPassportModal';
import { calculateHumanVisitMetrics } from '../lib/comparison';

interface HabitabilityProps {
  planet: Exoplanet;
  onNavigate: (tab: string) => void;
  allPlanets: Exoplanet[];
  onSelectPlanet: (planet: Exoplanet) => void;
}

export const Habitability: React.FC<HabitabilityProps> = ({
  planet,
  onNavigate,
  allPlanets,
  onSelectPlanet
}) => {
  const [showPassport, setShowPassport] = useState(false);
  const habitability: HabitabilityResult = calculateHabitability(planet);
  const visitMetrics = calculateHumanVisitMetrics(planet);

  const getStatusBadge = (status: HabitabilityResult['status']) => {
    switch (status) {
      case 'Screened Candidate':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'Marginal Candidate':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      case 'Unfavorable Context':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case 'Insufficient data':
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Journey Stepper */}
      <JourneyStepper
        currentStep="analyze"
        selectedPlanetName={planet.pl_name}
        onNavigate={(step) => {
          if (step === 'discover') onNavigate('explorer');
          if (step === 'detect') onNavigate('spectrum');
          if (step === 'compare') onNavigate('comparison');
          if (step === 'protect') onNavigate('radiation');
        }}
      />

      {/* Target Selector Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1F3A]/90 border border-[#24466B] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
              Screening Target
            </span>
            <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <span>{planet.pl_name}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">
                (Host: {planet.hostname})
              </span>
            </h2>
          </div>
        </div>

        {/* Planet switcher dropdown & Passport button */}
        <div className="flex items-center gap-2">
          <select
            value={planet.pl_name}
            onChange={(e) => {
              const found = allPlanets.find((p) => p.pl_name === e.target.value);
              if (found) onSelectPlanet(found);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {allPlanets.slice(0, 40).map((p) => (
              <option key={p.pl_name} value={p.pl_name}>
                {p.pl_name} ({p.pl_rade ? `${p.pl_rade} R⊕` : 'no R'})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowPassport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-mono cursor-pointer transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-cyan-300" />
            <span>Planet Passport</span>
          </button>
        </div>
      </div>

      {/* Mandatory Scientific Label Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-300 font-mono text-[11px] uppercase tracking-wider">
            Orbitron Illustrative Screening Index Notice
          </div>
          <p className="text-[11px] leading-relaxed">
            This screening index is an educational and exploratory diagnostic model. It is <strong>not</strong> an official NASA metric,
            <strong>not</strong> a survivability score, and <strong>does not establish</strong> liquid water, atmospheric composition, or the presence of life.
            Circumstellar habitable-zone boundaries follow Kopparapu et al. (2013) for Sun-like stars; rocky composition thresholds follow Rogers (2015).
          </p>
        </div>
      </div>

      {/* Main Score & Confidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Screening Score Card */}
        <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
              <span>SCREENING INDEX</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(habitability.status)}`}>
                {habitability.status}
              </span>
            </div>
            {habitability.index !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-cyan-300">
                  {habitability.index}
                </span>
                <span className="text-slate-400 font-mono text-sm">/ 100</span>
              </div>
            ) : (
              <div className="text-2xl font-bold font-mono text-rose-400 my-2">
                Insufficient Data
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            {habitability.index !== null
              ? 'Computed as the renormalized weighted mean over observed catalogue parameters.'
              : 'Confidence is below 50%. Orbitron strictly refuses to guess missing parameters.'}
          </p>
        </div>

        {/* Confidence Metric Card */}
        <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
              <span>PARAMETER CONFIDENCE</span>
              <span className="text-[10px] text-slate-400 font-mono">Weighted Coverage</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono text-emerald-400">
                {habitability.confidence}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all ${
                  habitability.confidence >= 50 ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
                style={{ width: `${habitability.confidence}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Represents the fraction of diagnostic criteria verified by NASA Exoplanet Archive parameters.
          </p>
        </div>

        {/* Next Step Action Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#102B4B] to-[#071A36] border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
              Next Investigation Step
            </span>
            <h4 className="text-base font-bold font-mono text-white mt-1">
              Verify Atmosphere in Spectrum Lab
            </h4>
            <p className="text-[11px] text-[#AFC2D9] mt-2 leading-relaxed">
              Habitability requires an atmosphere. Proceed to Spectrum Lab to screen transmission spectroscopy for CO₂, H₂O, and CH₄ absorption features.
            </p>
          </div>
          <button
            onClick={() => onNavigate('spectrum')}
            className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-semibold cursor-pointer transition-all shadow-md"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Launch Spectrum Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detailed Diagnostic Factor Breakdown */}
      <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-mono text-white">SCREENING FACTOR BREAKDOWN</h3>
            <p className="text-xs text-slate-400">
              Diagnostic weights and empirical boundary evaluations (Kopparapu et al. 2013, Rogers 2015)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(habitability.factors).map(([key, f]) => {
            const scorePct = f.score !== null ? Math.round(f.score * 100) : null;
            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Weight: {Math.round(f.weight * 100)}%
                    </span>
                    <h4 className="text-sm font-bold font-mono text-white">{f.name}</h4>
                  </div>
                  <div className="text-right">
                    {scorePct !== null ? (
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {scorePct}/100
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 italic">Missing</span>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      scorePct === null
                        ? 'w-0'
                        : scorePct >= 70
                        ? 'bg-emerald-400'
                        : scorePct >= 40
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${scorePct || 0}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-300">
                  <span>
                    Archived value:{' '}
                    <strong>
                      {f.raw_value !== null ? `${f.raw_value} ${f.unit}` : 'Not available'}
                    </strong>
                  </span>
                  <span className="text-[10px] text-slate-400">{f.source_citation}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                  {f.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Known / Estimated / Unknown Parameter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Known */}
        <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>MEASURED & DERIVED (KNOWN)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
            {habitability.known_fields.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Estimated */}
        <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
            <Info className="w-4 h-4" />
            <span>ESTIMATED (MODEL-DEPENDENT)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
            {habitability.estimated_fields.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unknown */}
        <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>UNKNOWN PARAMETERS</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
            {habitability.unknown_fields.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Planet Passport Modal */}
      <PlanetPassportModal
        planet={planet}
        habitability={habitability}
        visitMetrics={visitMetrics}
        isOpen={showPassport}
        onClose={() => setShowPassport(false)}
      />
    </div>
  );
};
