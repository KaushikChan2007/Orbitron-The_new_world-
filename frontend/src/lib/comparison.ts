import { Exoplanet, HumanVisitMetrics } from '../types';

export const EARTH_BASELINE = {
  pl_name: 'Earth',
  hostname: 'Sun',
  discoverymethod: 'Native home',
  disc_year: 0,
  pl_rade: 1.0,
  pl_bmasse: 1.0,
  pl_orbper: 365.25,
  pl_eqt: 255,      // Earth equilibrium temp without greenhouse (~-18 °C)
  pl_insol: 1.0,
  sy_dist: 0.0,
  st_teff: 5778,
  st_rad: 1.0,
  st_lum: 0.0
};

/**
 * Calculate derived mechanical and environmental parameters for a hypothetical human visit.
 * Returns null if mass or radius is missing, honoring catalogue integrity.
 */
export function calculateHumanVisitMetrics(planet: Exoplanet): HumanVisitMetrics {
  const m = planet.pl_bmasse;
  const r = planet.pl_rade;

  const unmeasured = [
    'Atmospheric pressure & composition (unconfirmed without direct in-situ probing or high-SNR spectra)',
    'Global magnetosphere / planetary magnetic dynamo',
    'Surface ionizing radiation flux',
    'Volcanic & tectonic activity'
  ];

  if (m == null || r == null || m <= 0 || r <= 0) {
    return {
      surface_gravity_g: null,
      escape_velocity_kms: null,
      bulk_density_g_cm3: null,
      flux_relative_to_earth: planet.pl_insol ?? null,
      eq_temp_k: planet.pl_eqt ?? null,
      plain_language_bullets: [
        'Surface gravity and bulk density cannot be determined because one or both fundamental physical parameters (mass and radius) are unmeasured in the archive.',
        'Radial velocity detections frequently record only minimum mass (m*sin(i)), and transit observations record radius without mass unless transit timing variations or follow-up radial velocity are obtained.'
      ],
      unmeasured_factors: unmeasured
    };
  }

  // g = (M/M_earth) / (R/R_earth)^2
  const g = m / (r * r);

  // v_esc = 11.186 * sqrt( (M/M_earth) / (R/R_earth) ) km/s
  const v_esc = 11.186 * Math.sqrt(m / r);

  // rho = 5.514 * (M/M_earth) / (R/R_earth)^3 g/cm^3
  const rho = 5.514 * (m / (r * r * r));

  const bullets: string[] = [];

  // Gravity plain-language description
  const gRound = Math.round(g * 100) / 100;
  if (gRound > 1.8) {
    bullets.push(
      `Surface gravity is extreme (~${gRound}× Earth). A 75 kg human would weigh ~${Math.round(75 * gRound)} kg. Severe cardiovascular stress, rapid fluid pooling, and impaired ambulation.`
    );
  } else if (gRound > 1.2) {
    bullets.push(
      `Surface gravity is elevated (~${gRound}× Earth). Locomotion would feel noticeably heavy; increased musculoskeletal fatigue and cardiovascular exertion.`
    );
  } else if (gRound >= 0.8) {
    bullets.push(
      `Surface gravity is near-Earth normal (~${gRound}× Earth). Biomechanically comfortable for human locomotion with minimal immediate vestibular disruption.`
    );
  } else {
    bullets.push(
      `Surface gravity is low (~${gRound}× Earth). Prolonged habitation would induce progressive osteopenia (bone density loss) and muscle atrophy without active physical countermeasures.`
    );
  }

  // Escape velocity note
  bullets.push(
    `Escape velocity is ~${Math.round(v_esc * 100) / 100} km/s (Earth: 11.19 km/s). ${
      v_esc > 14
        ? 'High propellant mass fraction required for surface ascent and orbital insertion.'
        : 'Surface ascent energy requirements are comparable to or less demanding than Earth.'
    }`
  );

  // Density note
  const rhoRound = Math.round(rho * 100) / 100;
  if (rhoRound >= 5.0) {
    bullets.push(
      `Bulk density is ~${rhoRound} g/cm³ (Earth: 5.51 g/cm³), consistent with an iron-silicate differentiated terrestrial body.`
    );
  } else if (rhoRound >= 3.0) {
    bullets.push(
      `Bulk density is ~${rhoRound} g/cm³, suggesting substantial water/volatile mass fraction or a smaller metallic core than Earth.`
    );
  } else {
    bullets.push(
      `Bulk density is low (~${rhoRound} g/cm³), indicating an extensive volatile envelope or supercritical hydrosphere (sub-Neptune / water-rich world).`
    );
  }

  return {
    surface_gravity_g: gRound,
    escape_velocity_kms: Math.round(v_esc * 100) / 100,
    bulk_density_g_cm3: rhoRound,
    flux_relative_to_earth: planet.pl_insol ?? null,
    eq_temp_k: planet.pl_eqt ?? null,
    plain_language_bullets: bullets,
    unmeasured_factors: unmeasured
  };
}
