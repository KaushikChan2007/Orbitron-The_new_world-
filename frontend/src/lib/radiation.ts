import { RadiationScenarioInput, RadiationResult, CellularDamageMetrics } from '../types';

export const RADIATION_PRESETS: Record<string, { dose_rate: number; description: string; source: string }> = {
  'iss_leo': {
    dose_rate: 0.5,
    description: 'Low Earth Orbit (ISS altitude ~400 km, protected by Earth geomagnetic field)',
    source: 'UNSCEAR 2008 / NASA ISS dosimetry records'
  },
  'interplanetary_transit': {
    dose_rate: 1.8,
    description: 'Interplanetary transit (unprotected galactic cosmic rays during cruise)',
    source: 'NASA MSL RAD cruise measurements (Zeitlin et al. 2013, Science)'
  },
  'mars_surface': {
    dose_rate: 0.64,
    description: 'Martian surface (thin atmosphere and planetary shadow provide partial shielding)',
    source: 'NASA MSL RAD surface measurements (Hassler et al. 2014, Science)'
  },
  'solar_particle_event': {
    dose_rate: 25.0,
    description: 'Stellar/Solar Proton Event (acute peak coronal mass ejection)',
    source: 'Historical coronal mass ejection proxy (e.g. August 1972 event)'
  }
};

export const SHIELDING_PRESETS: Record<string, { transmission: number; label: string; material_note: string }> = {
  'none': {
    transmission: 1.0,
    label: 'No Shielding (Unshielded free space)',
    material_note: 'Direct incident flux with zero attenuation.'
  },
  'light': {
    transmission: 0.90,
    label: 'Light Shielding (~2 g/cm² aluminum / EVA spacesuit)',
    material_note: 'Stops low-energy solar protons; minimal reduction for high-energy galactic cosmic rays.'
  },
  'moderate': {
    transmission: 0.70,
    label: 'Moderate Shielding (~15 g/cm² storm shelter / regolith)',
    material_note: 'Substantial attenuation of solar particle events; secondary neutron scatter occurs.'
  },
  'heavy': {
    transmission: 0.50,
    label: 'Heavy Shielding (~45 g/cm² water-wall / lava tube habitat)',
    material_note: 'Hydrogen-rich shielding effective against primary heavy ions, but thick mass required.'
  }
};

export const DEFAULT_RADIATION_SCENARIO: RadiationScenarioInput = {
  environment_name: 'interplanetary_transit',
  duration_days: 180, // Standard 6-month Hohmann transit
  dose_rate_msv_day: 1.8,
  shielding_name: 'moderate',
  shielding_transmission: 0.70
};

/**
 * Calculate cumulative dose equivalent and cellular radiobiology damage metrics.
 */
export function calculateRadiationDose(input: RadiationScenarioInput): RadiationResult {
  const duration = Math.max(1, input.duration_days);
  const rate = Math.max(0, input.dose_rate_msv_day);
  const transmission = Math.max(0.01, Math.min(1.0, input.shielding_transmission));

  const unshielded_dose_msv = rate * duration;
  const cumulative_dose_msv = Math.round(unshielded_dose_msv * transmission * 10) / 10;
  const dose_avoided_msv = Math.round((unshielded_dose_msv - cumulative_dose_msv) * 10) / 10;
  const effective_daily_rate_msv = Math.round(rate * transmission * 100) / 100;

  // Convert mSv to mGy approximation for equivalent whole-body dose (1 Gy = 1000 mGy)
  const cumulative_dose_gy = cumulative_dose_msv / 1000.0;

  // Radiobiology: In human fibroblasts, ~35 double strand breaks (DSBs) per Gy per cell (Rothkamm & Lobrich 2003)
  const est_double_strand_breaks = Math.round(cumulative_dose_gy * 35.0 * 10) / 10;
  const gamma_h2ax_foci = Math.round(cumulative_dose_gy * 35.0 * 10) / 10;

  let repair_outlook = '';
  if (cumulative_dose_msv < 100) {
    repair_outlook = 'Low cumulative dose. Cell autonomous DNA repair pathways (NHEJ and HR) resolve >95% of single and double strand breaks within 24 hours without tissue exhaustion.';
  } else if (cumulative_dose_msv < 500) {
    repair_outlook = 'Elevated cumulative space radiation. Increased frequency of complex, clustered DNA lesions that challenge error-free homologous recombination, elevating somatic mutation frequency.';
  } else if (cumulative_dose_msv < 1000) {
    repair_outlook = 'High sub-acute threshold. Approaching the single-career astronaut radiation limit. Significant risk of hematopoietic suppression, endothelial microvascular damage, and early cataracts.';
  } else {
    repair_outlook = 'Critical lethal/sub-lethal tier (>1000 mSv). Exceeds acute radiation syndrome (ARS) threshold. Hematopoietic syndrome with bone marrow exhaustion, profound immune collapse, and intestinal crypt necrosis.';
  }

  const organ_effects: string[] = [
    `DNA Strand Kinetics: Estimated ~${est_double_strand_breaks} double-strand breaks (DSBs) induced per cell nucleus over mission duration.`,
    `Cellular Stress: Phosphorylation of histone variant H2AX forming ~${gamma_h2ax_foci} γ-H2AX repair foci per cell.`,
    'Immune System Impact: Lymphocyte apoptosis, reduced CD4+/CD8+ T-cell repertoire diversity, and cytokine dysregulation.',
    'Central Nervous System: GCR heavy ions induce synaptic dendritic spine loss and impaired hippocampal neurogenesis.'
  ];

  const cellular_metrics: CellularDamageMetrics = {
    cumulative_dose_msv,
    cumulative_dose_gy,
    est_double_strand_breaks_per_cell: est_double_strand_breaks,
    gamma_h2ax_foci_per_cell: gamma_h2ax_foci,
    cellular_repair_outlook: repair_outlook,
    organ_effects
  };

  return {
    cumulative_dose_msv,
    unshielded_dose_msv: Math.round(unshielded_dose_msv * 10) / 10,
    dose_avoided_msv,
    effective_daily_rate_msv,
    cellular_metrics,
    reference_benchmarks: [
      { name: 'Earth natural background', dose_msv: 2.4, note: 'Average annual exposure per human from radon, cosmic, terrestrial (UNSCEAR).' },
      { name: 'Annual limit for terrestrial radiation worker', dose_msv: 20.0, note: 'ICRP recommended occupational dose limit.' },
      { name: '6-Month ISS Mission', dose_msv: 90.0, note: 'Typical cumulative equivalent dose in low Earth orbit.' },
      { name: 'NASA astronaut career limit (35-year old)', dose_msv: 600.0, note: 'Current NASA permissible exposure limit based on 3% REID.' },
      { name: 'Threshold for Acute Radiation Sickness', dose_msv: 1000.0, note: 'Acute whole-body dose causing prodromal symptoms (nausea, lymphopenia).' }
    ],
    notice: (
      'Educational scenario model only. Not medical advice and not a validated aerospace radiation ' +
      'risk transport assessment. Real shielding effectiveness depends non-linearly on material ' +
      'Z-number and high-Z and energy (HZE) cosmic ray fragmentation.'
    )
  };
}
