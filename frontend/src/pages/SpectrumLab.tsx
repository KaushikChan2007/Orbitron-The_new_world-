import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Sparkles,
  Compass,
  Upload,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { SpectrumAnalysisResponse, SpectralFeature } from '../types';
import { getClientDemoSpectrum } from '../lib/spectrum';

interface SpectrumLabProps {
  onNavigate: (tab: string) => void;
  selectedPlanetName?: string;
}

export const SpectrumLab: React.FC<SpectrumLabProps> = ({
  onNavigate,
  selectedPlanetName
}) => {
  const [preset, setPreset] = useState<string>('wasp_39b_real_reference');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SpectrumAnalysisResponse | null>(null);
  const [customCsvError, setCustomCsvError] = useState<string | null>(null);
  const [showResiduals, setShowResiduals] = useState<boolean>(false);

  // Load preset spectrum and analyze
  const loadAndAnalyzePreset = async (selectedPreset: string) => {
    setIsLoading(true);
    setCustomCsvError(null);
    try {
      const demoRes = await fetch(`/api/spectrum/demo/${selectedPreset}`);
      if (!demoRes.ok) throw new Error('API offline');
      const demoData = await demoRes.json();

      const analyzeRes = await fetch('/api/spectrum/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wavelengths: demoData.wavelengths,
          depths: demoData.depths,
          errors: demoData.errors,
          detection_threshold_sigma: 3.0
        })
      });

      if (!analyzeRes.ok) throw new Error('Analysis failed');
      const result: SpectrumAnalysisResponse = await analyzeRes.json();
      setAnalysisResult(result);
    } catch {
      // Graceful offline fallback to client spectral engine
      setAnalysisResult(getClientDemoSpectrum(selectedPreset));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAndAnalyzePreset(preset);
  }, [preset]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomCsvError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 8) {
          throw new Error('CSV must contain a header and at least 7 spectral points.');
        }

        const header = lines[0].toLowerCase().split(',');
        const wlIdx = header.findIndex((h) => h.includes('wave') || h.includes('wl') || h.includes('lambda'));
        const dpIdx = header.findIndex((h) => h.includes('depth') || h.includes('flux') || h.includes('transit'));
        const errIdx = header.findIndex((h) => h.includes('err') || h.includes('unc') || h.includes('sigma'));

        if (wlIdx === -1 || dpIdx === -1) {
          throw new Error('CSV header must contain "wavelength" and "depth" columns.');
        }

        const wavelengths: number[] = [];
        const depths: number[] = [];
        const errors: number[] = [];

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length > Math.max(wlIdx, dpIdx)) {
            const w = parseFloat(parts[wlIdx]);
            const d = parseFloat(parts[dpIdx]);
            if (!isNaN(w) && !isNaN(d)) {
              wavelengths.push(w);
              depths.push(d);
              if (errIdx !== -1 && parts[errIdx]) {
                const err = parseFloat(parts[errIdx]);
                errors.push(!isNaN(err) ? err : 0.0001);
              }
            }
          }
        }

        if (wavelengths.length < 5) {
          throw new Error('Insufficient valid numeric rows parsed from CSV.');
        }

        setIsLoading(true);
        setPreset('custom');

        const analyzeRes = await fetch('/api/spectrum/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wavelengths,
            depths,
            errors: errors.length > 0 ? errors : undefined,
            detection_threshold_sigma: 3.0
          })
        });

        if (!analyzeRes.ok) throw new Error('Spectral pipeline rejected file');
        const result: SpectrumAnalysisResponse = await analyzeRes.json();
        setAnalysisResult(result);
      } catch (err: any) {
        setCustomCsvError(err.message || 'Error processing custom spectral file.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1520px] mx-auto text-white font-sans">
      {/* The Electromagnetic Spectrum Reference Banner */}
      <div className="rounded-[24px] overflow-hidden border border-white/15 bg-black/95 relative shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/60 backdrop-blur-md">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Astrophysical Radiation & Exoplanet Observation Windows
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span>The Electromagnetic Spectrum</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400">
            Exoplanet Atmospheric Window: <span className="text-white font-bold">Infrared 0.6 – 28 μm (JWST NIRSpec / MIRI)</span>
          </div>
        </div>

        {/* High-Resolution Spectrum Graphic */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.5/1] max-h-[440px] bg-black flex items-center justify-center overflow-hidden">
          <img
            src="/assets/electromagnetic-spectrum.png"
            alt="The Electromagnetic Spectrum: All Wavelengths. All Around Us."
            className="w-full h-full object-contain filter contrast-105"
          />
        </div>

        {/* Spectral Domain Bands Callout Grid */}
        <div className="p-4 bg-black/80 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">Radio Waves</span>
            <span className="text-white font-bold text-[11px]">10³ m (1 km)</span>
            <span className="text-[9px] text-neutral-500 block">Pulsars / SKA</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">Microwaves</span>
            <span className="text-white font-bold text-[11px]">10⁻¹ m (10 cm)</span>
            <span className="text-[9px] text-neutral-500 block">ALMA Sub-mm</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-0.5">
            <span className="text-[9px] text-amber-300 uppercase block font-bold">Infrared (Core)</span>
            <span className="text-white font-bold text-[11px]">10⁻³ – 10⁻⁶ m</span>
            <span className="text-[9px] text-amber-200 block">JWST / H₂O & CO₂</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">Visible Light</span>
            <span className="text-white font-bold text-[11px]">380 – 750 nm</span>
            <span className="text-[9px] text-neutral-500 block">Hubble / Transits</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">Ultraviolet</span>
            <span className="text-white font-bold text-[11px]">10⁻⁸ m (10 nm)</span>
            <span className="text-[9px] text-neutral-500 block">Stellar Flares & Ly-α</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">X-Rays</span>
            <span className="text-white font-bold text-[11px]">10⁻¹⁰ m (0.01 nm)</span>
            <span className="text-[9px] text-neutral-500 block">Chandra / Corona</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-neutral-400 uppercase block">Gamma Rays</span>
            <span className="text-white font-bold text-[11px]">10⁻¹² m (1 pm)</span>
            <span className="text-[9px] text-neutral-500 block">Fermi / Cosmic Rays</span>
          </div>
        </div>
      </div>


      {/* Top Header Card */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
              ATMOSPHERIC SPECTROSCOPY CORE
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-white" />
              <span>TRANSMISSION SPECTRUM & MOLECULAR ABSORPTION ENGINE</span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Continuum baseline fitting and molecular absorption candidate screening (CO₂, H₂O, CH₄, SO₂).
            </p>
          </div>

          {/* Preset Selector & Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="wasp_39b_real_reference">WASP-39b (JWST ERS Real Reference)</option>
              <option value="wasp_96b_water_demonstration">WASP-96b (H2O Demonstration)</option>
              <option value="flat_cloud_deck_demonstration">Flat Continuum / Cloud Deck</option>
              {preset === 'custom' && <option value="custom">Custom Uploaded CSV</option>}
            </select>

            {/* CSV Upload button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white text-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload CSV</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Source provenance label */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-white/10 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Dataset Mode:</span>
            {preset === 'wasp_39b_real_reference' ? (
              <span className="text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                Validated Real Reference (NASA / JWST ERS, Nature 2023)
              </span>
            ) : preset === 'custom' ? (
              <span className="text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                User Provided Custom Spectrum
              </span>
            ) : (
              <span className="text-neutral-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">
                Synthetic demonstration spectrum, not real archival data
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={showResiduals}
                onChange={(e) => setShowResiduals(e.target.checked)}
                className="rounded accent-white cursor-pointer"
              />
              <span>View Baseline Subtracted Residuals</span>
            </label>
          </div>
        </div>

        {customCsvError && (
          <div className="p-3 rounded-lg bg-black border border-white/30 text-white text-xs">
            {customCsvError}
          </div>
        )}
      </div>

      {/* Mandatory Scientific Integrity Notice */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/15 text-xs text-neutral-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <div className="font-bold text-white font-mono text-[11px] uppercase tracking-wider">
            Mandatory Spectroscopic & Astrobiological Notice
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong>Detecting a gas is not detecting life.</strong> Biosignature candidate claims require rigorously ruling out abiotic pathways (e.g., photochemical synthesis, volcanic serpentinization, mantle outgassing). Furthermore, exoplanet atmospheric detections are subject to stellar activity contamination and model degeneracies. Orbitron <strong>never</strong> outputs an arbitrary "probability of life".
          </p>
        </div>
      </div>

      {/* Spectrum Chart */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase">
              {showResiduals ? 'RESIDUAL EXCESS (DIP DEPTH - CONTINUUM BASELINE)' : 'TRANSMISSION SPECTRUM & SMOOTH POLYNOMIAL BASELINE FIT'}
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              {showResiduals
                ? 'Excess transit depth indicating atmospheric molecular absorption relative to continuum'
                : 'Apparent transit depth (Rp/Rs)² plotted against wavelength (µm)'}
            </p>
          </div>
          {analysisResult && (
            <div className="text-xs text-neutral-400 flex items-center gap-3">
              <span>Points: <strong className="text-white">{analysisResult.summary.num_points}</strong></span>
              <span>Noise (σ): <strong className="text-white">{analysisResult.summary.estimated_noise_sigma}</strong></span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-neutral-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-white" />
            Fitting baseline and scanning absorption bands...
          </div>
        ) : analysisResult ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={analysisResult.points}
                margin={{ top: 10, right: 20, bottom: 25, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="wavelength_um"
                  stroke="#888888"
                  fontSize={10}
                  label={{ value: 'Wavelength (µm)', position: 'insideBottom', offset: -15, fill: '#888888', fontSize: 10 }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  domain={['auto', 'auto']}
                  label={{
                    value: showResiduals ? 'Excess (Rp/Rs)²' : 'Transit Depth (Rp/Rs)²',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#888888',
                    fontSize: 10
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-black border border-white/40 rounded-xl text-xs font-mono text-white shadow-xl space-y-1">
                          <div className="font-bold border-b border-white/20 pb-0.5">{data.wavelength_um} µm</div>
                          <div>Depth: {data.depth}</div>
                          <div>Baseline: {data.baseline}</div>
                          <div>Excess: {data.residual}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {showResiduals ? (
                  <>
                    <ReferenceLine y={0} stroke="#888888" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="residual"
                      stroke="#FFFFFF"
                      dot={false}
                      strokeWidth={2}
                      name="Residuals"
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="depth"
                      stroke="#FFFFFF"
                      dot={false}
                      strokeWidth={1.8}
                      name="Observed Depth"
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#888888"
                      dot={false}
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                      name="Continuum Baseline"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      {/* Detection Results Table */}
      {analysisResult && (
        <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white uppercase">
                FLAGGED CANDIDATE ABSORPTION FEATURES
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Screened absorption dips matched against published molecular band centres (±0.15 µm).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-white text-black font-bold uppercase text-[10px]">
                Candidates (≥3σ): {analysisResult.summary.candidate_count}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10 uppercase text-[10px]">
                Weak (&lt;3σ): {analysisResult.summary.weak_feature_count}
              </span>
            </div>
          </div>

          {analysisResult.candidates.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-black border border-white/10 text-xs text-neutral-400 space-y-1">
              <p className="text-white font-bold">No candidate features above detection threshold (3.0σ).</p>
              <p>Spectrum is consistent with a flat continuum or high-altitude cloud deck.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-neutral-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate Molecule</th>
                    <th className="p-3">Wavelength (µm)</th>
                    <th className="p-3">Reference Band</th>
                    <th className="p-3">Excess Depth</th>
                    <th className="p-3">Significance (σ)</th>
                    <th className="p-3">Detection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {analysisResult.candidates.map((cand, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>{cand.matched_molecule}</span>
                      </td>
                      <td className="p-3 text-white font-bold">{cand.wavelength_um} µm</td>
                      <td className="p-3 text-neutral-400">
                        {cand.reference_band_um ? `${cand.reference_band_um} µm (Δ ${cand.band_delta_um} µm)` : 'N/A'}
                      </td>
                      <td className="p-3">{cand.excess_depth}</td>
                      <td className="p-3">
                        <span className="font-bold text-white">
                          {cand.significance_sigma}σ
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-white/20 bg-white/10 text-white">
                          {cand.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};