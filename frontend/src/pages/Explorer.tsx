import React, { useState, useMemo } from 'react';
import {
  Search,
  Compass,
  ArrowRight,
  Eye,
  SplitSquareVertical,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { Exoplanet } from '../types';

interface ExplorerProps {
  planets: Exoplanet[];
  selectedPlanet: Exoplanet | null;
  onSelectPlanet: (planet: Exoplanet) => void;
  onOpenDetail: (planet: Exoplanet) => void;
  onNavigate: (view: string) => void;
  onAddToComparison: (planet: Exoplanet) => void;
}

export const Explorer: React.FC<ExplorerProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet,
  onOpenDetail,
  onNavigate,
  onAddToComparison
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [discoveryMethod, setDiscoveryMethod] = useState('all');
  const [radiusFilter, setRadiusFilter] = useState<'all' | 'rocky' | 'sub_neptune' | 'giant'>('all');
  const [sortBy, setSortBy] = useState<'pl_name' | 'pl_rade' | 'pl_orbper' | 'sy_dist' | 'disc_year'>('pl_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const filteredPlanets = useMemo(() => {
    return planets.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.pl_name.toLowerCase().includes(q);
        const matchesHost = p.hostname.toLowerCase().includes(q);
        if (!matchesName && !matchesHost) return false;
      }

      if (discoveryMethod !== 'all') {
        if (!p.discoverymethod || p.discoverymethod.toLowerCase() !== discoveryMethod.toLowerCase()) {
          return false;
        }
      }

      if (radiusFilter === 'rocky') {
        if (p.pl_rade == null || p.pl_rade > 1.6) return false;
      } else if (radiusFilter === 'sub_neptune') {
        if (p.pl_rade == null || p.pl_rade <= 1.6 || p.pl_rade > 3.5) return false;
      } else if (radiusFilter === 'giant') {
        if (p.pl_rade == null || p.pl_rade <= 3.5) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [planets, searchTerm, discoveryMethod, radiusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPlanets.length / pageSize) || 1;
  const paginatedPlanets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlanets.slice(start, start + pageSize);
  }, [filteredPlanets, currentPage, pageSize]);

  const getCompleteness = (p: Exoplanet) => {
    const fields = [p.pl_rade, p.pl_bmasse, p.pl_orbper, p.pl_eqt, p.pl_insol, p.sy_dist, p.st_teff];
    const present = fields.filter((f) => f != null).length;
    return Math.round((present / fields.length) * 100);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1520px] mx-auto">
      {/* 2. Exoplanet Explorer Hero Section matching reference image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
          <span className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-white" />
            <span>Exoplanet Explorer</span>
          </span>
          <span className="text-[11px]">NASA Composite Archive Telemetry (pscomppars)</span>
        </div>
        <div className="relative rounded-[28px] overflow-hidden border border-white/20 shadow-2xl bg-black">
          <img
            src="/assets/explorer-hero.png"
            alt="Exoplanet Explorer Cinematic Render"
            className="w-full max-h-[420px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 z-10 space-y-1 font-mono">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
              NASA VERIFIED ARCHIVAL WORLDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-tight">
              EXOPLANET EXPLORER
            </h2>
            <p className="text-xs text-neutral-300 font-sans max-w-xl">
              Survey, filter, and inspect 520+ confirmed exoplanetary systems with empirical physical and orbital telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Header and Controls in Clean Glass Grid */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#6F7C8E] uppercase tracking-wider">
              VERIFIED ARCHIVAL WORLDS
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-white" />
              <span>EXOPLANET CATALOGUE EXPLORER</span>
            </h1>
          </div>
          <div className="text-xs font-mono text-[#9AA7B8]">
            Showing <strong className="text-white">{filteredPlanets.length}</strong> of {planets.length} Curated Worlds
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#6F7C8E] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by planet or host star (e.g. TRAPPIST, Kepler, Proxima)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#6F7C8E] font-mono focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <select
              value={discoveryMethod}
              onChange={(e) => {
                setDiscoveryMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">Discovery: All Methods</option>
              <option value="Transit">Transit</option>
              <option value="Radial Velocity">Radial Velocity</option>
              <option value="Imaging">Direct Imaging</option>
              <option value="Microlensing">Microlensing</option>
            </select>
          </div>

          <div>
            <select
              value={radiusFilter}
              onChange={(e) => {
                setRadiusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">Radius: All Sizes</option>
              <option value="rocky">Rocky (≤ 1.6 R⊕, Rogers 2015)</option>
              <option value="sub_neptune">Sub-Neptune (1.6 – 3.5 R⊕)</option>
              <option value="giant">Giant / Gas (&gt; 3.5 R⊕)</option>
            </select>
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">SORT BY:</span>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="pl_name">Planet Name (Alphabetical)</option>
                <option value="pl_rade">Planetary Radius (Size)</option>
                <option value="pl_orbper">Orbital Period (Year Length)</option>
                <option value="sy_dist">System Distance (from Earth)</option>
                <option value="disc_year">Discovery Year</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/20 text-xs text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5 yt-hover-btn"
                title="Toggle Sort Direction"
              >
                <span>{sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}</span>
              </button>
            </div>
          </div>

          {(searchTerm || discoveryMethod !== 'all' || radiusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDiscoveryMethod('all');
                setRadiusFilter('all');
                setCurrentPage(1);
              }}
              className="text-white underline text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Exoplanet Items */}
      {paginatedPlanets.length === 0 ? (
        <div className="p-12 text-center rounded-[24px] glass-panel space-y-2">
          <Database className="w-8 h-8 text-[#6F7C8E] mx-auto" />
          <h3 className="text-sm font-mono text-white">No worlds match active criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {paginatedPlanets.map((p) => {
            const completeness = getCompleteness(p);
            const isSelected = selectedPlanet?.pl_name === p.pl_name;

            return (
              <div
                key={p.pl_name}
                className={`p-4 rounded-[20px] transition-all flex flex-col justify-between yt-hover cursor-pointer border ${
                  isSelected
                    ? 'bg-white/[0.07] border-white/30 shadow-lg ring-1 ring-white/20'
                    : 'bg-white/[0.025] hover:bg-white/[0.05] border-white/[0.07]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#6F7C8E] uppercase tracking-wider block truncate max-w-[170px]">
                        Star: {p.hostname}
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white truncate max-w-[180px]">
                        {p.pl_name}
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-white shrink-0">
                      {p.discoverymethod || 'Transit'}
                    </span>
                  </div>

                  {/* Completeness Bar */}
                  <div className="my-2.5">
                    <div className="flex justify-between text-[9px] font-mono text-[#6F7C8E] mb-1">
                      <span>Data Completeness</span>
                      <span className="text-white font-semibold">{completeness}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono py-1">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-[#6F7C8E] block">Radius:</span>
                      <span className="text-white font-medium">
                        {p.pl_rade != null ? `${p.pl_rade} R⊕` : <span className="text-[#6F7C8E] italic">N/A</span>}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-[#6F7C8E] block">Mass:</span>
                      <span className="text-white font-medium">
                        {p.pl_bmasse != null ? `${p.pl_bmasse} M⊕` : <span className="text-[#6F7C8E] italic">N/A</span>}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-[#6F7C8E] block">Period:</span>
                      <span className="text-white font-medium">
                        {p.pl_orbper != null ? `${Math.round(p.pl_orbper * 10) / 10} d` : <span className="text-[#6F7C8E] italic">N/A</span>}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-[#6F7C8E] block">Temp:</span>
                      <span className="text-white font-medium">
                        {p.pl_eqt != null ? `${p.pl_eqt} K` : <span className="text-[#6F7C8E] italic">N/A</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(p);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white text-[11px] font-mono cursor-pointer transition-colors text-center"
                  >
                    Quick View
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlanet(p);
                      onNavigate('dossier');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white text-black font-semibold text-[11px] font-mono cursor-pointer transition-colors text-center"
                  >
                    Open Dossier
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToComparison(p);
                    }}
                    title="Add to Compare"
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white cursor-pointer transition-colors"
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl glass-panel text-xs font-mono">
          <div className="text-[#6F7C8E]">
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] text-white disabled:opacity-30 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
