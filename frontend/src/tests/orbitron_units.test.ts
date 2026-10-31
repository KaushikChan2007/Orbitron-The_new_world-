import { describe, it, expect } from 'vitest';
import { calculateHabitability } from '../lib/habitability';
import { calculateHumanVisitMetrics, EARTH_BASELINE } from '../lib/comparison';
import { calculateRadiationDose, DEFAULT_RADIATION_SCENARIO } from '../lib/radiation';
import { Exoplanet } from '../types';

describe('Orbitron Scientific Unit Test Anchors', () => {
  it('Earth inputs (M=1, R=1) must give g=1, v_esc ≈ 11.19 km/s, rho ≈ 5.51 g/cm³', () => {
    const metrics = calculateHumanVisitMetrics(EARTH_BASELINE);
    expect(metrics.surface_gravity_g).toBe(1.0);
    expect(metrics.escape_velocity_kms).toBeCloseTo(11.19, 1);
    expect(metrics.bulk_density_g_cm3).toBeCloseTo(5.51, 1);
  });

  it('A planet with missing mass or radius must return null derived metrics and not fabricate', () => {
    const sparsePlanet: Exoplanet = {
      pl_name: 'Sparse World',
      hostname: 'Sparse Star'
    };
    const metrics = calculateHumanVisitMetrics(sparsePlanet);
    expect(metrics.surface_gravity_g).toBeNull();
    expect(metrics.escape_velocity_kms).toBeNull();
    expect(metrics.bulk_density_g_cm3).toBeNull();
    expect(metrics.plain_language_bullets[0]).toContain('cannot be determined');
  });

  it('A planet with all 4 habitability inputs missing must return Insufficient data', () => {
    const blankPlanet: Exoplanet = {
      pl_name: 'Unknown 1',
      hostname: 'Star 1'
    };
    const res = calculateHabitability(blankPlanet);
    expect(res.index).toBeNull();
    expect(res.confidence).toBe(0);
    expect(res.status).toBe('Insufficient data');
  });

  it('Radiation output must change when duration, dose rate or shielding changes', () => {
    const base = calculateRadiationDose(DEFAULT_RADIATION_SCENARIO);

    // Change duration
    const longer = calculateRadiationDose({
      ...DEFAULT_RADIATION_SCENARIO,
      duration_days: DEFAULT_RADIATION_SCENARIO.duration_days * 2
    });
    expect(longer.cumulative_dose_msv).toBeGreaterThan(base.cumulative_dose_msv);

    // Change shielding
    const heavyShield = calculateRadiationDose({
      ...DEFAULT_RADIATION_SCENARIO,
      shielding_transmission: 0.50
    });
    expect(heavyShield.cumulative_dose_msv).toBeLessThan(base.cumulative_dose_msv);

    // Change dose rate
    const higherRate = calculateRadiationDose({
      ...DEFAULT_RADIATION_SCENARIO,
      dose_rate_msv_day: 10.0
    });
    expect(higherRate.cumulative_dose_msv).toBeGreaterThan(base.cumulative_dose_msv);
  });

  it('TRAPPIST-1 e has valid habitability score with high confidence', () => {
    const trappist1e: Exoplanet = {
      pl_name: 'TRAPPIST-1 e',
      hostname: 'TRAPPIST-1',
      pl_rade: 0.92,
      pl_bmasse: 0.692,
      pl_orbper: 6.10,
      pl_eqt: 249.7,
      pl_insol: 0.646,
      st_teff: 2566
    };
    const res = calculateHabitability(trappist1e);
    expect(res.confidence).toBe(100);
    expect(res.index).not.toBeNull();
    expect(res.index!).toBeGreaterThan(60);
    expect(res.status).toBe('Screened Candidate');
  });
});
