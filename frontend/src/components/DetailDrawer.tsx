import React from 'react';
import { X, ExternalLink, Activity, SplitSquareVertical, LineChart, Globe, Zap, Compass, Dna } from 'lucide-react';
import { Exoplanet, DataTag } from '../types';

interface DetailDrawerProps {
  planet: Exoplanet | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (planet: Exoplanet) => void;
  onCompare: (planet: Exoplanet) => void;
  onOpenSpectrum: (planet: Exoplanet) => void;
  retrievedAt?: string;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  planet,
  isOpen,
  onClose,
  onAnalyze,
  onCompare,
  onOpenSpectrum,
  retrievedAt = '2026-10-31'
}) => {
  if (!isOpen || !planet) return null;

  const renderTag = (tag: DataTag) => {
    const map = {
      measured: 'bg-white/10 text-white border-white/30 font-bold',
      derived: 'bg-white/5 text-neutral-300 border-white/20',
      estimated: 'bg-transparent text-neutral-400 border-white/20',
      hypothetical: 'bg-transparent text-neutral-400 border-dashed border-white/30',
      unknown: 'bg-transparent text-neutral-500 border-white/10'
    };
    return (
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${map[tag]}`}>
        {tag}
      </span>
    );
  };

  const fields: { label: string; value: string | number | null; unit?: string; tag: DataTag; note?: string }[] = [
    {
      label: 'Host Star Name',
      value: planet.hostname,
      tag: 'measured'
    },
    {
      label: 'Discovery Method',
      value: planet.discoverymethod || null,
      tag: 'measured'
    },
    {
      label: 'Discovery Year',
      value: planet.disc_year || null,
      tag: 'measured'
    },
    {
      label: 'Planetary Radius',
      value: planet.pl_rade != null ? `${planet.pl_rade}` : null,
      unit: 'R⊕ (Earth radii)',
      tag: 'measured',
      note: 'Transit depth derived or direct measurement'
    },
    {
      label: 'Planetary Mass',
      value: planet.pl_bmasse != null ? `${planet.pl_bmasse}` : null,
      unit: 'M⊕ (Earth masses)',
      tag: planet.pl_bmasse ? 'measured' : 'unknown',
      note: 'Often minimum mass (m*sin(i)) from radial velocity'
    },
    {
      label: 'Orbital Period',
      value: planet.pl_orbper != null ? `${planet.pl_orbper}` : null,
      unit: 'days',
      tag: 'measured'
    },
    {
      label: 'Equilibrium Temperature',
      value: planet.pl_eqt != null ? `${planet.pl_eqt}` : null,
      unit: 'K',
      tag: 'estimated',
      note: 'Assumes Bond albedo = 0, uniform heat redistribution'
    },
    {
      label: 'Stellar Insolation Flux',
      value: planet.pl_insol != null ? `${planet.pl_insol}` : null,
      unit: 'S⊕ (Earth = 1.0)',
      tag: 'derived',
      note: 'Flux received from host star relative to Earth'
    },
    {
      label: 'System Distance',
      value: planet.sy_dist != null ? `${planet.sy_dist}` : null,
      unit: 'pc (parsecs)',
      tag: 'measured',
      note: planet.sy_dist ? `~${Math.round(planet.sy_dist * 3.26156 * 10) / 10} light-years` : undefined
    },
    {
      label: 'Host Star Temperature',
      value: planet.st_teff != null ? `${planet.st_teff}` : null,
      unit: 'K',
      tag: 'measured'
    },
    {
      label: 'Host Star Radius',
      value: planet.st_rad != null ? `${planet.st_rad}` : null,
      unit: 'R☉ (Solar radii)',
      tag: 'measured'
    },
    {
      label: 'Host Star Luminosity',
      value: planet.st_lum != null ? `${planet.st_lum} (log10)` : null,
      unit: 'log10(L☉)',
      tag: 'derived',
      note: planet.st_lum != null ? `linear: ~${Math.pow(10, planet.st_lum).toFixed(4)} L☉` : undefined
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end text-white font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-black border-l border-white/20 h-full flex flex-col shadow-2xl z-10 overflow-y-auto font-mono">
        {/* Header */}
        <div className="p-5 border-b border-white/15 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{planet.pl_name}</h2>
              <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase">
                Confirmed
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Host System: {planet.hostname}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 flex-1">
          {/* Quick Actions Toolbar */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAnalyze(planet)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-black font-bold transition-all text-xs cursor-pointer hover:bg-neutral-200"
            >
              <Activity className="w-4 h-4 mb-1 text-black" />
              <span>Dossier</span>
            </button>
            <button
              onClick={() => onCompare(planet)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all text-xs font-semibold cursor-pointer"
            >
              <SplitSquareVertical className="w-4 h-4 mb-1 text-white" />
              <span>Compare</span>
            </button>
            <button
              onClick={() => onOpenSpectrum(planet)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all text-xs font-semibold cursor-pointer"
            >
              <LineChart className="w-4 h-4 mb-1 text-white" />
              <span>Spectrum</span>
            </button>
          </div>

          {/* Parameter Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-white font-bold">
                Catalogue Physical Matrix
              </h3>
              <span className="text-[10px] text-neutral-400">
                NASA TAP (pscomppars)
              </span>
            </div>

            <div className="rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden bg-black/60">
              {fields.map((f, i) => (
                <div key={i} className="p-3 text-xs flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                  <div className="space-y-0.5 max-w-[55%]">
                    <div className="text-neutral-300 font-medium font-sans">{f.label}</div>
                    {f.note && <div className="text-[10px] text-neutral-500 truncate font-mono">{f.note}</div>}
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.value !== null ? (
                        <span className="font-bold text-white">
                          {f.value} {f.unit ? <span className="text-neutral-400 text-[11px] font-normal">{f.unit}</span> : ''}
                        </span>
                      ) : (
                        <span className="text-neutral-500 italic text-[11px]">Not available</span>
                      )}
                    </div>
                    <div>{renderTag(f.tag)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase">
              <ExternalLink className="w-3 h-3 text-white" />
              NASA ARCHIVE PROVENANCE
            </div>
            <p className="font-sans">
              Data snapshot retrieved on <span className="text-white font-mono">{retrievedAt}</span> from the IPAC Caltech Exoplanet Archive composite table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};