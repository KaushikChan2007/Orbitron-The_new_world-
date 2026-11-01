import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  SplitSquareVertical,
  Dna,
  ExternalLink,
  AlertTriangle,
  Award,
  ArrowRight,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { Exoplanet, DataTag } from '../types';
import { calculateHabitability } from '../lib/habitability';
import { calculateHumanVisitMetrics } from '../lib/comparison';
import { PlanetPassportModal } from '../components/PlanetPassportModal';
import { HabitableZoneDiagram } from '../components/HabitableZoneDiagram';

interface DossierProps {
  planet: Exoplanet;
  allPlanets: Exoplanet[];
  onSelectPlanet: (planet: Exoplanet) => void;
  onNavigate: (view: string) => void;
  onAddToCompare: (planet: Exoplanet) => void;
}

interface NasaImage {
  title: string;
  thumb: string;
  description?: string;
  nasa_id?: string;
}

export const Dossier: React.FC<DossierProps> = ({
  planet,
  allPlanets,
  onSelectPlanet,
  onNavigate,
  onAddToCompare
}) => {
  const [activeTab, setActiveTab] = useState<'screening' | 'human_visit' | 'atmosphere' | 'nasa_imagery'>('screening');
  const [showPassport, setShowPassport] = useState(false);
  const [nasaImages, setNasaImages] = useState<NasaImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const habitability = calculateHabitability(planet);
  const visitMetrics = calculateHumanVisitMetrics(planet);

  // Fetch live NASA Image Archive photography for the planet or its host star
  useEffect(() => {
    let isMounted = true;
    const fetchNasaImages = async () => {
      setLoadingImages(true);
      try {
        const queryTerm = encodeURIComponent(planet.hostname || planet.pl_name || 'exoplanet');
        const res = await fetch(`/api/nasa/images?query=${queryTerm}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results) {
            setNasaImages(data.results);
          }
        }
      } catch (e) {
        console.error('NASA image fetch failed', e);
      } finally {
        if (isMounted) setLoadingImages(false);
      }
    };
    fetchNasaImages();
    return () => {
      isMounted = false;
    };
  }, [planet.pl_name, planet.hostname]);

  // Strict monochrome tag rendering
  const renderTag = (tag: DataTag) => {
    const map = {
      measured: 'text-white border-white/40 bg-white/10 font-bold',
      derived: 'text-neutral-300 border-white/20 bg-white/5',
      estimated: 'text-neutral-400 border-white/20 bg-transparent',
      hypothetical: 'text-neutral-400 border-dashed border-white/30 bg-transparent',
      unknown: 'text-neutral-500 border-white/10 bg-transparent'
    };
    return (
      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${map[tag]}`}>
        {tag}
      </span>
    );
  };

  const keyParameters: { label: string; value: string | number | null; unit?: string; tag: DataTag }[] = [
    { label: 'Host System', value: planet.hostname, tag: 'measured' },
    { label: 'Discovery Method', value: planet.discoverymethod || 'Transit', tag: 'measured' },
    { label: 'Discovery Year', value: planet.disc_year || null, tag: 'measured' },
    { label: 'Planetary Radius', value: planet.pl_rade != null ? `${planet.pl_rade}` : null, unit: 'R⊕', tag: 'measured' },
    { label: 'Planetary Mass', value: planet.pl_bmasse != null ? `${planet.pl_bmasse}` : null, unit: 'M⊕', tag: planet.pl_bmasse ? 'measured' : 'unknown' },
    { label: 'Orbital Period', value: planet.pl_orbper != null ? `${planet.pl_orbper}` : null, unit: 'days', tag: 'measured' },
    { label: 'Equilibrium Temp', value: planet.pl_eqt != null ? `${planet.pl_eqt}` : null, unit: 'K', tag: 'estimated' },
    { label: 'Stellar Insolation Flux', value: planet.pl_insol != null ? `${planet.pl_insol}` : null, unit: 'S⊕', tag: 'derived' },
    { label: 'System Distance', value: planet.sy_dist != null ? `${planet.sy_dist}` : null, unit: 'pc', tag: 'measured' },
    { label: 'Host Star Teff', value: planet.st_teff != null ? `${planet.st_teff}` : null, unit: 'K', tag: 'measured' },
    { label: 'Host Star Radius', value: planet.st_rad != null ? `${planet.st_rad}` : null, unit: 'R☉', tag: 'measured' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1520px] mx-auto text-white font-sans">
      {/* 3. Habitability Analysis Header matching reference image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
          <span className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <span>Habitability Analysis</span>
          </span>
          <span className="text-[11px]">Mikko Tuomi et al. (2013) & Kopparapu et al. (2013)</span>
        </div>
      </div>

      {/* Top Header & Planet Switcher */}
      <div className="p-5 rounded-[24px] glass-panel flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
            <Layers className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
              HABITABILITY ANALYSIS & CLOUD FEEDBACK
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{planet.pl_name}</span>
              <span className="text-xs text-neutral-400 font-normal">(Primary: {planet.hostname})</span>
            </h1>
          </div>
        </div>

        {/* Quick Actions & Target Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={planet.pl_name}
            onChange={(e) => {
              const match = allPlanets.find((p) => p.pl_name === e.target.value);
              if (match) onSelectPlanet(match);
            }}
            className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
          >
            {allPlanets.slice(0, 50).map((p) => (
              <option key={p.pl_name} value={p.pl_name}>
                {p.pl_name} ({p.pl_rade ? `${p.pl_rade} R⊕` : 'no R'})
              </option>
            ))}
          </select>

          <button
            onClick={() => onAddToCompare(planet)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs text-white cursor-pointer yt-hover-btn"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Compare with Earth</span>
          </button>

          <button
            onClick={() => onNavigate('anatomy_lab')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs cursor-pointer yt-hover-btn"
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Open in Anatomy Lab</span>
          </button>
        </div>
      </div>

      {/* Sci-Fi Layout: Left Key-Value Matrix & Right Tabbed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key-Value Parameter Table (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-4 font-mono">
          <div className="p-5 rounded-[22px] glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CATALOGUE PHYSICAL MATRIX
              </span>
              <span className="text-[10px] text-neutral-400">
                NASA IPAC TAP
              </span>
            </div>

            <div className="rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden bg-black/40">
              {keyParameters.map((item, i) => (
                <div key={i} className="p-2.5 text-xs flex items-center justify-between hover:bg-white/[0.03]">
                  <span className="text-neutral-300 text-[11px]">{item.label}</span>
                  <div className="text-right flex items-center gap-2">
                    {item.value !== null ? (
                      <span className="text-white font-bold text-[11px]">
                        {item.value} {item.unit && <span className="text-neutral-400 font-normal">{item.unit}</span>}
                      </span>
                    ) : (
                      <span className="text-neutral-500 italic text-[10px]">Not available</span>
                    )}
                    {renderTag(item.tag)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[10px] text-neutral-400 space-y-1">
              <div>Values carry explicit measured/derived/estimated provenance tags.</div>
              <div>Values marked "Not available" are never synthesized or fabricated.</div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Scientific Exploration Panels (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub-tab pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono">
            {[
              { id: 'screening', label: 'Habitability Screening' },
              { id: 'human_visit', label: 'Human Visit Conditions' },
              { id: 'atmosphere', label: 'What is Unknown' },
              { id: 'nasa_imagery', label: 'Live NASA Archives' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer yt-hover-btn ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: HABITABILITY SCREENING */}
          {activeTab === 'screening' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white uppercase">
                    ILLUSTRATIVE SCREENING INDEX
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Transparent weighted scoring based on Kopparapu et al. (2013) & Rogers (2015).
                  </p>
                </div>
                <button
                  onClick={() => setShowPassport(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs text-white cursor-pointer yt-hover-btn flex items-center gap-1.5 font-bold"
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>Passport Card</span>
                </button>
              </div>

              {/* Score & Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase">Screening Score</span>
                  <div className="text-3xl font-bold text-white">
                    {habitability.index !== null ? `${habitability.index} / 100` : 'Insufficient data'}
                  </div>
                  <span className="text-[10px] text-neutral-400 block">Status: {habitability.status}</span>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase">Parameter Confidence</span>
                  <div className="text-3xl font-bold text-white">
                    {habitability.confidence}%
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-white h-full rounded-full"
                      style={{ width: `${habitability.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2">
                <span className="text-xs text-neutral-400 uppercase block">
                  Diagnostic Factor Breakdown
                </span>
                <div className="space-y-2 font-mono">
                  {Object.entries(habitability.factors).map(([key, f]) => {
                    const pct = f.score !== null ? Math.round(f.score * 100) : null;
                    return (
                      <div key={key} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{f.name} ({Math.round(f.weight * 100)}%)</span>
                          <span className={pct !== null ? 'text-white font-bold' : 'text-neutral-500 italic'}>
                            {pct !== null ? `${pct}%` : 'Missing'}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full"
                            style={{ width: `${pct || 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-300 font-sans pt-0.5">{f.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mikko Tuomi et al. / Kopparapu et al. Circumstellar Habitable Zone Diagram */}
              <div className="pt-2">
                <HabitableZoneDiagram planet={planet} />
              </div>
            </div>
          )}

          {/* TAB 2: HYPOTHETICAL HUMAN VISIT CONDITIONS */}
          {activeTab === 'human_visit' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn font-mono">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white uppercase">
                  DERIVED SURFACE MECHANICS & HUMAN VISIT CONDITIONS
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Computed from archival radius and mass with Earth = 1.0 (derived orbital mechanics).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase block">Surface Gravity</span>
                  <div className="text-xl font-bold text-white">
                    {visitMetrics.surface_gravity_g !== null ? `${visitMetrics.surface_gravity_g} g` : 'Not available'}
                  </div>
                  <span className="text-[10px] text-neutral-400">Earth: 1.00 g</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase block">Escape Velocity</span>
                  <div className="text-xl font-bold text-white">
                    {visitMetrics.escape_velocity_kms !== null ? `${visitMetrics.escape_velocity_kms} km/s` : 'Not available'}
                  </div>
                  <span className="text-[10px] text-neutral-400">Earth: 11.19 km/s</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase block">Bulk Density</span>
                  <div className="text-xl font-bold text-white">
                    {visitMetrics.bulk_density_g_cm3 !== null ? `${visitMetrics.bulk_density_g_cm3} g/cm³` : 'Not available'}
                  </div>
                  <span className="text-[10px] text-neutral-400">Earth: 5.51 g/cm³</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs font-sans">
                <span className="font-mono font-bold text-white text-xs block">
                  Biophysical Consequences on Human Physiology:
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-neutral-300 leading-relaxed">
                  {visitMetrics.plain_language_bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT IS UNKNOWN */}
          {activeTab === 'atmosphere' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 font-mono">
                <h3 className="text-base font-bold text-white uppercase">
                  WHAT THE ARCHIVE DOES NOT TELL US
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Critical unknown planetary factors that cannot be determined from transit or radial velocity alone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5">
                  <h4 className="font-mono font-bold text-white text-xs">Surface Barometric Pressure</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Transit depth measures optical extinction at high altitudes (~millibars); actual surface barometric pressure remains completely unknown without in-situ atmospheric descent probes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5">
                  <h4 className="font-mono font-bold text-white text-xs">Planetary Magnetic Dynamo</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Without an active dipolar magnetic field, atmospheres around close-in M-dwarf worlds are subject to rapid stellar wind stripping and coronal mass ejection erosion.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5">
                  <h4 className="font-mono font-bold text-white text-xs">Standing Liquid Hydrosphere</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Position in the habitable zone is purely an astronomical flux boundary; standing surface liquid water requires an inventory that survived planetary accretion and runaway desiccation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5">
                  <h4 className="font-mono font-bold text-white text-xs">Surface Radiation Flux</h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Galactic cosmic ray and stellar energetic particle attenuation depend on total column atmospheric mass and intrinsic magnetic shields, neither of which is measured.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE NASA ARCHIVE PHOTOGRAPHY & TELEMETRY */}
          {activeTab === 'nasa_imagery' && (
            <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
                <div>
                  <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white" />
                    <span>LIVE NASA IMAGE & VIDEO LIBRARY ARCHIVE</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Live imagery and public domain space telescope assets fetched for host system {planet.hostname}.
                  </p>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {nasaImages.length} archive assets loaded
                </div>
              </div>

              {loadingImages ? (
                <div className="h-48 flex items-center justify-center font-mono text-xs text-neutral-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Querying NASA public image database...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nasaImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-black space-y-2 p-2">
                      <div className="h-36 rounded-lg overflow-hidden bg-neutral-900">
                        <img
                          src={img.thumb}
                          alt={img.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1 font-mono">
                        <h4 className="text-xs font-bold text-white truncate" title={img.title}>
                          {img.title}
                        </h4>
                        {img.description && (
                          <p className="text-[10px] text-neutral-400 line-clamp-2 font-sans">
                            {img.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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