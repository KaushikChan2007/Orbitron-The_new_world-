import { HabitabilityConfig } from '../types';

/**
 * Orbitron Illustrative Habitability Screening Configuration
 * 
 * Based on:
 * - Kopparapu et al. (2013) Habitable Zones around Main-Sequence Stars
 * - Rogers (2015) Most 1.6 Earth-radius Planets are not Rocky
 */
export const DEFAULT_HABITABILITY_CONFIG: HabitabilityConfig = {
  flux_weight: 0.35,
  temp_weight: 0.25,
  size_weight: 0.25,
  star_weight: 0.15,

  // Kopparapu (2013) flux boundaries in Earth flux units (S_sun = 1.0)
  flux_opt_low: 0.32,    // Early Mars limit
  flux_cons_low: 0.36,   // Maximum Greenhouse limit
  flux_cons_high: 1.10,  // Runaway Greenhouse limit (conservative)
  flux_opt_high: 1.77,   // Recent Venus limit (optimistic)

  // Equilibrium temperature boundaries in Kelvin
  temp_opt_low: 180.0,
  temp_cons_low: 250.0,
  temp_cons_high: 300.0,
  temp_opt_high: 380.0,

  // Radius boundaries in Earth radii (Rogers 2015)
  rocky_threshold_rade: 1.6, // <= 1.6 R_earth likely rocky
  rocky_max_rade: 2.5,       // >= 2.5 R_earth volatile-dominated sub-Neptune/gas

  // Host star effective temperature in Kelvin
  star_teff_low: 4000.0,     // K-dwarf boundary
  star_teff_high: 6500.0     // F-dwarf boundary
};
