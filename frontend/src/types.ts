export type DataTag = 'measured' | 'derived' | 'estimated' | 'hypothetical' | 'unknown';

export interface Exoplanet {
  pl_name: string;
  hostname: string;
  discoverymethod?: string;
  disc_year?: number;
  pl_rade?: number;   // Earth radii
  pl_bmasse?: number; // Earth masses
  pl_orbper?: number; // days
  pl_eqt?: number;    // Kelvin
  pl_insol?: number;  // Earth flux = 1
  sy_dist?: number;   // parsecs
  st_teff?: number;   // Kelvin
  st_rad?: number;    // Solar radii
  st_lum?: number;    // log10 solar luminosity
}

export interface HabitabilityConfig {
  flux_weight: number;
  temp_weight: number;
  size_weight: number;
  star_weight: number;
  flux_opt_low: number;
  flux_cons_low: number;
  flux_cons_high: number;
  flux_opt_high: number;
  temp_opt_low: number;
  temp_cons_low: number;
  temp_cons_high: number;
  temp_opt_high: number;
  rocky_threshold_rade: number;
  rocky_max_rade: number;
  star_teff_low: number;
  star_teff_high: number;
}

export interface FactorScore {
  name: string;
  factor_key: string;
  raw_value: number | null;
  unit: string;
  score: number | null;
  weight: number;
  status: 'optimal' | 'moderate' | 'marginal' | 'unfavorable' | 'unknown';
  explanation: string;
  source_citation: string;
}

export interface HabitabilityResult {
  index: number | null;       // 0 - 100 scale, or null if insufficient data
  confidence: number;         // 0 - 100 percentage
  status: 'Screened Candidate' | 'Marginal Candidate' | 'Unfavorable Context' | 'Insufficient data';
  factors: Record<string, FactorScore>;
  known_fields: string[];
  estimated_fields: string[];
  unknown_fields: string[];
  scientific_caveat: string;
}

export interface HumanVisitMetrics {
  surface_gravity_g: number | null;
  escape_velocity_kms: number | null;
  bulk_density_g_cm3: number | null;
  flux_relative_to_earth: number | null;
  eq_temp_k: number | null;
  plain_language_bullets: string[];
  unmeasured_factors: string[];
}

export interface RadiationScenarioInput {
  environment_name: string;
  duration_days: number;
  dose_rate_msv_day: number;
  shielding_name: string;
  shielding_transmission: number;
}

export interface CellularDamageMetrics {
  cumulative_dose_msv: number;
  cumulative_dose_gy: number;
  est_double_strand_breaks_per_cell: number;
  gamma_h2ax_foci_per_cell: number;
  cellular_repair_outlook: string;
  organ_effects: string[];
}

export interface RadiationResult {
  cumulative_dose_msv: number;
  unshielded_dose_msv: number;
  dose_avoided_msv: number;
  effective_daily_rate_msv: number;
  cellular_metrics: CellularDamageMetrics;
  reference_benchmarks: { name: string; dose_msv: number; note: string }[];
  notice: string;
}

export interface SpectralFeature {
  wavelength_um: number;
  measured_depth: number;
  baseline: number;
  excess_depth: number;
  significance_sigma: number;
  matched_molecule: string;
  reference_band_um: number | null;
  band_delta_um: number | null;
  status: 'candidate' | 'weak/not significant';
}

export interface SpectrumAnalysisResponse {
  summary: {
    num_points: number;
    wavelength_min_um: number;
    wavelength_max_um: number;
    estimated_noise_sigma: number;
    candidate_count: number;
    weak_feature_count: number;
  };
  points: {
    wavelength_um: number;
    depth: number;
    baseline: number;
    residual: number;
    error: number | null;
  }[];
  candidates: SpectralFeature[];
  scientific_notice: string;
}

export interface ExtremophileData {
  species: string;
  class: string;
  primary_resistance: string;
  radiation_tolerance_gy: number;
  human_lethal_dose_gy: number;
  survival_ratio_vs_human: number;
  cellular_mechanism: string;
  space_exposure_data: string;
  habitable_envelope: {
    temperature_c: string;
    water_activity_aw: string;
    ph_range: string;
  };
}
