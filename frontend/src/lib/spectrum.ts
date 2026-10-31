import { SpectrumAnalysisResponse, SpectralFeature } from '../types';

export function getClientDemoSpectrum(preset: string): SpectrumAnalysisResponse {
  const points: { wavelength_um: number; depth: number; baseline: number; residual: number; error: number | null }[] = [];
  const candidates: SpectralFeature[] = [];
  const n = 140;

  for (let i = 0; i < n; i++) {
    const wl = 0.8 + (4.4 / n) * i;
    const base = 0.0210 + 0.0004 * (1.0 / Math.pow(wl, 1.2));
    let excess = 0.0;

    if (preset === 'wasp_39b_real_reference') {
      const co2 = 0.0028 * Math.exp(-0.5 * Math.pow((wl - 4.30) / 0.14, 2));
      const h2o_1 = 0.0011 * Math.exp(-0.5 * Math.pow((wl - 1.40) / 0.10, 2));
      const h2o_2 = 0.0016 * Math.exp(-0.5 * Math.pow((wl - 2.68) / 0.15, 2));
      const so2 = 0.0009 * Math.exp(-0.5 * Math.pow((wl - 4.05) / 0.08, 2));
      excess = co2 + h2o_1 + h2o_2 + so2;
    } else if (preset === 'wasp_39b_co2_h2o') {
      const co2 = 0.0035 * Math.exp(-0.5 * Math.pow((wl - 4.30) / 0.12, 2));
      const h2o = 0.0016 * Math.exp(-0.5 * Math.pow((wl - 1.40) / 0.09, 2));
      const ch4 = 0.0025 * Math.exp(-0.5 * Math.pow((wl - 3.31) / 0.12, 2));
      excess = co2 + h2o + ch4;
    } else {
      // Flat demo
      excess = 0;
    }

    // Pseudo-random noise with fixed seed pattern
    const noise = Math.sin(i * 12.9898 + 78.233) * 0.00015;
    const depth = base + excess + noise;
    const roundedWl = Math.round(wl * 1000) / 1000;
    const roundedDepth = Math.round(depth * 1000000) / 1000000;
    const roundedBase = Math.round(base * 1000000) / 1000000;
    const roundedRes = Math.round((depth - base) * 1000000) / 1000000;

    points.push({
      wavelength_um: roundedWl,
      depth: roundedDepth,
      baseline: roundedBase,
      residual: roundedRes,
      error: 0.00018
    });
  }

  if (preset === 'wasp_39b_real_reference') {
    candidates.push(
      {
        wavelength_um: 4.30,
        measured_depth: 0.0242,
        baseline: 0.0211,
        excess_depth: 0.0028,
        significance_sigma: 15.5,
        matched_molecule: 'CO2',
        reference_band_um: 4.30,
        band_delta_um: 0.0,
        status: 'candidate'
      },
      {
        wavelength_um: 2.68,
        measured_depth: 0.0228,
        baseline: 0.0212,
        excess_depth: 0.0016,
        significance_sigma: 8.9,
        matched_molecule: 'H2O',
        reference_band_um: 2.68,
        band_delta_um: 0.0,
        status: 'candidate'
      },
      {
        wavelength_um: 1.40,
        measured_depth: 0.0224,
        baseline: 0.0213,
        excess_depth: 0.0011,
        significance_sigma: 6.1,
        matched_molecule: 'H2O',
        reference_band_um: 1.40,
        band_delta_um: 0.0,
        status: 'candidate'
      },
      {
        wavelength_um: 4.05,
        measured_depth: 0.0220,
        baseline: 0.0211,
        excess_depth: 0.0009,
        significance_sigma: 5.0,
        matched_molecule: 'SO2',
        reference_band_um: 4.05,
        band_delta_um: 0.0,
        status: 'candidate'
      }
    );
  } else if (preset === 'wasp_39b_co2_h2o') {
    candidates.push(
      {
        wavelength_um: 4.30,
        measured_depth: 0.0249,
        baseline: 0.0211,
        excess_depth: 0.0035,
        significance_sigma: 17.5,
        matched_molecule: 'CO2',
        reference_band_um: 4.30,
        band_delta_um: 0.0,
        status: 'candidate'
      },
      {
        wavelength_um: 3.31,
        measured_depth: 0.0238,
        baseline: 0.0211,
        excess_depth: 0.0025,
        significance_sigma: 12.5,
        matched_molecule: 'CH4',
        reference_band_um: 3.31,
        band_delta_um: 0.0,
        status: 'candidate'
      },
      {
        wavelength_um: 1.40,
        measured_depth: 0.0229,
        baseline: 0.0213,
        excess_depth: 0.0016,
        significance_sigma: 8.0,
        matched_molecule: 'H2O',
        reference_band_um: 1.40,
        band_delta_um: 0.0,
        status: 'candidate'
      }
    );
  }

  return {
    summary: {
      num_points: n,
      wavelength_min_um: 0.8,
      wavelength_max_um: 5.2,
      estimated_noise_sigma: 0.00018,
      candidate_count: candidates.length,
      weak_feature_count: 0
    },
    points,
    candidates,
    scientific_notice:
      'Detecting a gas is not detecting life. Biosignature claims require ruling out non-biological sources, and exoplanet-atmosphere detections are often disputed.'
  };
}
