import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Exoplanet } from '../types';

interface ResearchScatterPlotProps {
  planets: Exoplanet[];
  selectedPlanet: Exoplanet | null;
  onSelectPlanet: (planet: Exoplanet) => void;
}

export const ResearchScatterPlot: React.FC<ResearchScatterPlotProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet
}) => {
  const [xAxisKey, setXAxisKey] = useState<'pl_orbper' | 'pl_bmasse' | 'pl_insol' | 'st_teff'>('pl_orbper');
  const [yAxisKey, setYAxisKey] = useState<'pl_rade' | 'pl_eqt' | 'pl_bmasse'>('pl_rade');
  const [maxRadiusFilter, setMaxRadiusFilter] = useState<number>(4.0);

  // Filter valid data points
  const scatterData = useMemo(() => {
    return planets
      .filter((p) => {
        const x = p[xAxisKey];
        const y = p[yAxisKey];
        if (x == null || y == null || isNaN(x) || isNaN(y) || x <= 0 || y <= 0) return false;
        if (p.pl_rade && p.pl_rade > maxRadiusFilter) return false;
        return true;
      })
      .map((p) => ({
        name: p.pl_name,
        host: p.hostname,
        x: p[xAxisKey],
        y: p[yAxisKey],
        radius: p.pl_rade,
        mass: p.pl_bmasse,
        period: p.pl_orbper,
        temp: p.pl_eqt,
        flux: p.pl_insol,
        rawPlanet: p
      }));
  }, [planets, xAxisKey, yAxisKey, maxRadiusFilter]);

  const xLabels: Record<string, string> = {
    pl_orbper: 'Orbital Period (days, log scale)',
    pl_bmasse: 'Planetary Mass (Earth Masses M⊕, log scale)',
    pl_insol: 'Stellar Flux Insolation (S⊕, log scale)',
    st_teff: 'Host Star Effective Temperature (Kelvin)'
  };

  const yLabels: Record<string, string> = {
    pl_rade: 'Planetary Radius (Earth Radii R⊕)',
    pl_eqt: 'Equilibrium Temperature (Kelvin)',
    pl_bmasse: 'Planetary Mass (Earth Masses M⊕)'
  };

  return (
    <div className="p-6 rounded-[24px] glass-panel space-y-5 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] font-mono text-[#6F7C8E] uppercase tracking-wider">
            POPULATION ASTROPHYSICS & DEMOGRAPHICS
          </div>
          <h2 className="text-base sm:text-lg font-mono font-bold text-white uppercase">
            LIVE CATALOGUE EXPLORER & MASS-RADIUS DIAGRAM
          </h2>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Real-time interactive projection of NASA confirmed planets with Rogers (2015) 1.6 R⊕ rocky threshold.
          </p>
        </div>

        {/* Live Axis Selectors */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#6F7C8E] text-[11px]">X:</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-black border border-white/20 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="pl_orbper">Orbital Period (d)</option>
              <option value="pl_bmasse">Mass (M⊕)</option>
              <option value="pl_insol">Stellar Flux (S⊕)</option>
              <option value="st_teff">Star Temp (K)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6F7C8E] text-[11px]">Y:</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-black border border-white/20 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="pl_rade">Radius (R⊕)</option>
              <option value="pl_eqt">Equilibrium Temp (K)</option>
              <option value="pl_bmasse">Mass (M⊕)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[#6F7C8E] text-[11px]">Max Radius:</span>
            <input
              type="range"
              min={1.5}
              max={15}
              step={0.5}
              value={maxRadiusFilter}
              onChange={(e) => setMaxRadiusFilter(parseFloat(e.target.value))}
              className="w-20 accent-white cursor-pointer"
            />
            <span className="text-white text-[11px]">{maxRadiusFilter} R⊕</span>
          </div>
        </div>
      </div>

      {/* Dynamic Scatter Chart */}
      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 25, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              scale="log"
              domain={['auto', 'auto']}
              stroke="#A0A0A0"
              fontSize={10}
              tickFormatter={(v) => (v >= 1000 ? `${v.toFixed(0)}` : v >= 1 ? `${v.toFixed(1)}` : `${v.toFixed(2)}`)}
              label={{ value: xLabels[xAxisKey], position: 'insideBottom', offset: -15, fill: '#A0A0A0', fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              domain={['auto', 'auto']}
              stroke="#A0A0A0"
              fontSize={10}
              label={{ value: yLabels[yAxisKey], angle: -90, position: 'insideLeft', fill: '#A0A0A0', fontSize: 10 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#FFFFFF' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-black border border-white/40 rounded-xl text-xs font-mono text-white shadow-2xl space-y-1">
                      <div className="font-bold border-b border-white/20 pb-1 text-sm">{data.name}</div>
                      <div>Host Star: {data.host}</div>
                      <div>Radius: {data.radius ? `${data.radius} R⊕` : 'N/A'}</div>
                      <div>Mass: {data.mass ? `${data.mass} M⊕` : 'N/A'}</div>
                      <div>Period: {data.period ? `${data.period.toFixed(2)} d` : 'N/A'}</div>
                      <div>Temp: {data.temp ? `${data.temp} K` : 'N/A'}</div>
                      <div className="text-[10px] text-[#A0A0A0] pt-1">Click dot to inspect dossier</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {yAxisKey === 'pl_rade' && (
              <ReferenceLine
                y={1.6}
                stroke="#FFFFFF"
                strokeDasharray="4 4"
                label={{ value: 'Rogers (2015) Rocky Limit (1.6 R⊕)', fill: '#FFFFFF', fontSize: 10, position: 'top' }}
              />
            )}
            <Scatter
              name="Exoplanets"
              data={scatterData}
              fill="#FFFFFF"
              fillOpacity={0.7}
              stroke="#000000"
              strokeWidth={1}
              onClick={(e: any) => {
                if (e && e.rawPlanet) onSelectPlanet(e.rawPlanet);
                else if (e && e.payload && e.payload.rawPlanet) onSelectPlanet(e.payload.rawPlanet);
              }}
              className="cursor-pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Citation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-[#6F7C8E]">
        <div>
          Sample: <strong className="text-white">{scatterData.length}</strong> confirmed exoplanets plotted from NASA Exoplanet Archive TAP sync.
        </div>
        <div>
          Reference: Rogers, L. A. (2015) Astrophys. J. 801:41 • Kopparapu et al. (2013) Astrophys. J. 765:131
        </div>
      </div>
    </div>
  );
};
