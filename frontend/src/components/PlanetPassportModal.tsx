import React from 'react';
import { X, Copy, Check, Orbit, Award } from 'lucide-react';
import { Exoplanet, HabitabilityResult, HumanVisitMetrics } from '../types';

interface PlanetPassportModalProps {
  planet: Exoplanet;
  habitability: HabitabilityResult;
  visitMetrics: HumanVisitMetrics;
  isOpen: boolean;
  onClose: () => void;
}

export const PlanetPassportModal: React.FC<PlanetPassportModalProps> = ({
  planet,
  habitability,
  visitMetrics,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = `ORBITRON PLANET PASSPORT: ${planet.pl_name}
Host Star: ${planet.hostname}
Radius: ${planet.pl_rade ?? 'N/A'} R⊕ | Mass: ${planet.pl_bmasse ?? 'N/A'} M⊕
Equilibrium Temp: ${planet.pl_eqt ?? 'N/A'} K | Flux: ${planet.pl_insol ?? 'N/A'} S⊕
Screening Index: ${habitability.index != null ? habitability.index + '/100' : 'Insufficient data'} (Confidence: ${habitability.confidence}%)
Relative Gravity: ${visitMetrics.surface_gravity_g != null ? visitMetrics.surface_gravity_g + ' g' : 'N/A'}
Notice: Screening summary only. Does not establish habitability or life.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-black border border-white/30 rounded-2xl overflow-hidden shadow-2xl font-mono text-white">
        {/* Passport Top Banner */}
        <div className="bg-white text-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Orbit className="w-5 h-5 text-black" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Orbitron Passport</span>
              <h3 className="font-bold text-base leading-none">EXOPLANET DOSSIER</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black/70 hover:text-black p-1 rounded-lg hover:bg-black/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Planet Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-3">
            <div>
              <div className="text-[10px] text-neutral-400 uppercase">Target Designation</div>
              <h2 className="text-xl font-bold text-white">{planet.pl_name}</h2>
              <div className="text-neutral-400 text-[11px]">Primary: {planet.hostname}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 font-bold uppercase">
                {planet.pl_rade && planet.pl_rade <= 1.6 ? 'TERRESTRIAL' : 'SUB-NEPTUNE / GAS'}
              </span>
              <div className="text-[10px] text-neutral-400 mt-1">
                Dist: {planet.sy_dist ? `${planet.sy_dist} pc` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Physical Matrix */}
          <div className="grid grid-cols-2 gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Radius (R⊕)</span>
              <span className="text-sm font-bold text-white">{planet.pl_rade ?? 'Not available'}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Mass (M⊕)</span>
              <span className="text-sm font-bold text-white">{planet.pl_bmasse ?? 'Not available'}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Surface Gravity</span>
              <span className="text-sm font-bold text-white">
                {visitMetrics.surface_gravity_g ? `${visitMetrics.surface_gravity_g} g` : 'Not available'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Equilibrium Temp</span>
              <span className="text-sm font-bold text-white">
                {planet.pl_eqt ? `${planet.pl_eqt} K` : 'Not available'}
              </span>
            </div>
          </div>

          {/* Screening Evaluation */}
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-neutral-400">Illustrative Screening Index:</span>
              <span className="font-bold text-white">
                {habitability.index !== null ? `${habitability.index} / 100` : 'Insufficient data'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-neutral-400">Parameter Confidence:</span>
              <span className="font-bold text-white">{habitability.confidence}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${habitability.confidence}%` }}
              />
            </div>
          </div>

          {/* Mandatory Grounding Disclaimer */}
          <div className="p-2.5 rounded-lg bg-black border border-white/10 text-[10px] text-neutral-400 leading-tight font-sans">
            Screening is an illustrative diagnostic metric (Rogers 2015; Kopparapu 2013). Does not verify surface liquid water, atmosphere, or habitability.
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopySummary}
            className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            <span>{copied ? 'Passport Copied to Clipboard' : 'Copy Dossier Passport'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};