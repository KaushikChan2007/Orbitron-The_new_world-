import { Exoplanet, HabitabilityConfig, HabitabilityResult, FactorScore } from '../types';
import { DEFAULT_HABITABILITY_CONFIG } from '../config/habitability';

/**
 * Score stellar insolation flux against Kopparapu et al. (2013) habitable zone limits.
 */
function scoreFlux(flux: number | undefined | null, cfg: HabitabilityConfig): FactorScore {
  if (flux == null || isNaN(flux)) {
    return {
      name: 'Stellar Insolation Flux',
      factor_key: 'pl_insol',
      raw_value: null,
      unit: 'S⊕',
      score: null,
      weight: cfg.flux_weight,
      status: 'unknown',
      explanation: 'No insolation flux recorded in catalogue.',
      source_citation: 'Kopparapu et al. (2013)'
    };
  }

  let s = 0.0;
  let status: FactorScore['status'] = 'unfavorable';
  let expl = '';

  if (flux >= cfg.flux_cons_low && flux <= cfg.flux_cons_high) {
    s = 1.0;
    status = 'optimal';
    expl = `Flux (${flux} S⊕) is inside the conservative habitable zone (${cfg.flux_cons_low}–${cfg.flux_cons_high} S⊕).`;
  } else if (flux >= cfg.flux_opt_low && flux < cfg.flux_cons_low) {
    // Linear ramp from opt_low (0.0) to cons_low (1.0)
    s = (flux - cfg.flux_opt_low) / (cfg.flux_cons_low - cfg.flux_opt_low);
    status = 'moderate';
    expl = `Flux (${flux} S⊕) is in the optimistic outer habitable zone (Early Mars boundary).`;
  } else if (flux > cfg.flux_cons_high && flux <= cfg.flux_opt_high) {
    // Linear ramp down from cons_high (1.0) to opt_high (0.0)
    s = (cfg.flux_opt_high - flux) / (cfg.flux_opt_high - cfg.flux_cons_high);
    status = 'moderate';
    expl = `Flux (${flux} S⊕) is in the optimistic inner habitable zone (Recent Venus boundary).`;
  } else {
    s = 0.0;
    status = 'unfavorable';
    expl = flux < cfg.flux_opt_low
      ? `Flux (${flux} S⊕) is too cold; beyond the outer habitable zone.`
      : `Flux (${flux} S⊕) is too intense; exceeds inner runaway greenhouse threshold.`;
  }

  return {
    name: 'Stellar Insolation Flux',
    factor_key: 'pl_insol',
    raw_value: flux,
    unit: 'S⊕',
    score: Math.max(0, Math.min(1, s)),
    weight: cfg.flux_weight,
    status,
    explanation: expl,
    source_citation: 'Kopparapu et al. (2013)'
  };
}

/**
 * Score equilibrium temperature against liquid water context (250–300 K optimal).
 */
function scoreTemperature(temp: number | undefined | null, cfg: HabitabilityConfig): FactorScore {
  if (temp == null || isNaN(temp)) {
    return {
      name: 'Equilibrium Temperature',
      factor_key: 'pl_eqt',
      raw_value: null,
      unit: 'K',
      score: null,
      weight: cfg.temp_weight,
      status: 'unknown',
      explanation: 'Equilibrium temperature not provided in catalogue.',
      source_citation: 'Standard zero-albedo radiative balance'
    };
  }

  let s = 0.0;
  let status: FactorScore['status'] = 'unfavorable';
  let expl = '';

  if (temp >= cfg.temp_cons_low && temp <= cfg.temp_cons_high) {
    s = 1.0;
    status = 'optimal';
    expl = `Equilibrium temperature (${temp} K) matches Earth-like thermal range (250–300 K).`;
  } else if (temp >= cfg.temp_opt_low && temp < cfg.temp_cons_low) {
    s = (temp - cfg.temp_opt_low) / (cfg.temp_cons_low - cfg.temp_opt_low);
    status = 'moderate';
    expl = `Equilibrium temperature (${temp} K) is cold; liquid water requires strong atmospheric greenhouse.`;
  } else if (temp > cfg.temp_cons_high && temp <= cfg.temp_opt_high) {
    s = (cfg.temp_opt_high - temp) / (cfg.temp_opt_high - cfg.temp_cons_high);
    status = 'marginal';
    expl = `Equilibrium temperature (${temp} K) is hot; surface liquid water would easily vaporize.`;
  } else {
    s = 0.0;
    status = 'unfavorable';
    expl = temp < cfg.temp_opt_low
      ? `Temperature (${temp} K) is deep cryogenic; global glaciation probable.`
      : `Temperature (${temp} K) exceeds 380 K; hostile to organic macromolecules.`;
  }

  return {
    name: 'Equilibrium Temperature',
    factor_key: 'pl_eqt',
    raw_value: temp,
    unit: 'K',
    score: Math.max(0, Math.min(1, s)),
    weight: cfg.temp_weight,
    status,
    explanation: expl,
    source_citation: 'Planetary equilibrium temperature (A=0, f=1)'
  };
}

/**
 * Score planetary radius / composition plausibility (Rogers 2015 threshold: <= 1.6 R⊕).
 */
function scoreRadius(radius: number | undefined | null, cfg: HabitabilityConfig): FactorScore {
  if (radius == null || isNaN(radius)) {
    return {
      name: 'Planetary Radius (Rocky Plausibility)',
      factor_key: 'pl_rade',
      raw_value: null,
      unit: 'R⊕',
      score: null,
      weight: cfg.size_weight,
      status: 'unknown',
      explanation: 'Planetary radius not observed (e.g. radial-velocity only discovery).',
      source_citation: 'Rogers, L. A. (2015)'
    };
  }

  let s = 0.0;
  let status: FactorScore['status'] = 'unfavorable';
  let expl = '';

  if (radius <= cfg.rocky_threshold_rade) {
    s = 1.0;
    status = 'optimal';
    expl = `Radius (${radius} R⊕) is <= 1.6 R⊕; statistically consistent with a rocky silicates/iron mantle.`;
  } else if (radius < cfg.rocky_max_rade) {
    // Linear falloff from 1.6 R_earth down to 2.5 R_earth
    s = (cfg.rocky_max_rade - radius) / (cfg.rocky_max_rade - cfg.rocky_threshold_rade);
    status = 'marginal';
    expl = `Radius (${radius} R⊕) lies in the transition radius valley; likely possesses volatile gas envelope.`;
  } else {
    s = 0.0;
    status = 'unfavorable';
    expl = `Radius (${radius} R⊕) >= 2.5 R⊕ indicates a mini-Neptune or gas giant with deep supercritical volatiles.`;
  }

  return {
    name: 'Planetary Radius (Rocky Plausibility)',
    factor_key: 'pl_rade',
    raw_value: radius,
    unit: 'R⊕',
    score: Math.max(0, Math.min(1, s)),
    weight: cfg.size_weight,
    status,
    explanation: expl,
    source_citation: 'Rogers (2015) Astrophys. J. 801:41'
  };
}

/**
 * Score host star temperature and stellar activity context.
 */
function scoreHostStar(st_teff: number | undefined | null, cfg: HabitabilityConfig): FactorScore {
  if (st_teff == null || isNaN(st_teff)) {
    return {
      name: 'Host Star Type & Spectral Context',
      factor_key: 'st_teff',
      raw_value: null,
      unit: 'K',
      score: null,
      weight: cfg.star_weight,
      status: 'unknown',
      explanation: 'Host star effective temperature not recorded.',
      source_citation: 'Stellar spectral classification'
    };
  }

  let s = 0.0;
  let status: FactorScore['status'] = 'unfavorable';
  let expl = '';

  if (st_teff >= cfg.star_teff_low && st_teff <= cfg.star_teff_high) {
    s = 1.0;
    status = 'optimal';
    expl = `Host star temperature (${st_teff} K, G/K-dwarf) offers stable quiescent luminosity and long main-sequence lifespan.`;
  } else if (st_teff < cfg.star_teff_low) {
    // M dwarf penalty due to frequent coronal mass ejections / flare activity
    s = Math.max(0.4, (st_teff / cfg.star_teff_low) * 0.7);
    status = 'moderate';
    expl = `Host star is a cool red dwarf (${st_teff} K, M-dwarf). Close proximity implies tidal locking and high stellar flare vulnerability.`;
  } else {
    // Hot star > 6500 K (F/A type)
    s = Math.max(0.2, 1.0 - (st_teff - cfg.star_teff_high) / 3000.0);
    status = 'marginal';
    expl = `Host star is hot (${st_teff} K, F/A star) with elevated UV radiation and shortened stellar lifespan (<3 Gyr).`;
  }

  return {
    name: 'Host Star Type & Spectral Context',
    factor_key: 'st_teff',
    raw_value: st_teff,
    unit: 'K',
    score: Math.max(0, Math.min(1, s)),
    weight: cfg.star_weight,
    status,
    explanation: expl,
    source_citation: 'Main sequence spectral characteristics'
  };
}

/**
 * Calculate the Orbitron illustrative habitability screening index.
 */
export function calculateHabitability(
  planet: Exoplanet,
  config: HabitabilityConfig = DEFAULT_HABITABILITY_CONFIG
): HabitabilityResult {
  const fFlux = scoreFlux(planet.pl_insol, config);
  const fTemp = scoreTemperature(planet.pl_eqt, config);
  const fSize = scoreRadius(planet.pl_rade, config);
  const fStar = scoreHostStar(planet.st_teff, config);

  const factorList = [fFlux, fTemp, fSize, fStar];

  const totalDefaultWeight = factorList.reduce((acc, f) => acc + f.weight, 0);
  const availableFactors = factorList.filter((f) => f.score !== null);
  const availableWeight = availableFactors.reduce((acc, f) => acc + f.weight, 0);

  // Confidence is share of total weight available (0 to 100%)
  const confidence = Math.round((availableWeight / totalDefaultWeight) * 100);

  const known_fields: string[] = [];
  const estimated_fields: string[] = [];
  const unknown_fields: string[] = [];

  if (planet.pl_insol != null) known_fields.push('pl_insol (Stellar flux)');
  else unknown_fields.push('pl_insol (Stellar flux)');

  if (planet.pl_rade != null) known_fields.push('pl_rade (Planetary radius)');
  else unknown_fields.push('pl_rade (Planetary radius)');

  if (planet.st_teff != null) known_fields.push('st_teff (Host star temperature)');
  else unknown_fields.push('st_teff (Host star temperature)');

  if (planet.pl_eqt != null) estimated_fields.push('pl_eqt (Equilibrium temperature, assumes A=0)');
  else unknown_fields.push('pl_eqt (Equilibrium temperature)');

  // Always unknown in current astronomical catalogues for unprobed exoplanets
  unknown_fields.push('Atmospheric surface pressure', 'Surface liquid water inventory', 'Planetary magnetic dynamo');

  // Rule: If confidence < 50%, return null index and show "Insufficient data"
  if (confidence < 50 || availableFactors.length === 0) {
    return {
      index: null,
      confidence,
      status: 'Insufficient data',
      factors: {
        flux: fFlux,
        temperature: fTemp,
        size: fSize,
        host_star: fStar
      },
      known_fields,
      estimated_fields,
      unknown_fields,
      scientific_caveat: (
        'Insufficient empirical data to compute habitability index (<50% parameter confidence). ' +
        'Orbitron does not default missing values to favorable assumptions.'
      )
    };
  }

  // Renormalized weighted sum
  const weightedSum = availableFactors.reduce((acc, f) => acc + (f.score! * f.weight), 0);
  const rawIndex = (weightedSum / availableWeight) * 100;
  const index = Math.round(rawIndex * 10) / 10;

  let status: HabitabilityResult['status'] = 'Unfavorable Context';
  if (index >= 70) {
    status = 'Screened Candidate';
  } else if (index >= 45) {
    status = 'Marginal Candidate';
  }

  return {
    index,
    confidence,
    status,
    factors: {
      flux: fFlux,
      temperature: fTemp,
      size: fSize,
      host_star: fStar
    },
    known_fields,
    estimated_fields,
    unknown_fields,
    scientific_caveat: (
      'Orbitron illustrative screening index only. A habitable-zone location does NOT establish ' +
      'liquid water, an atmosphere, or life. Flux boundaries are based on Kopparapu et al. (2013) ' +
      'and 1.6 R⊕ rocky threshold on Rogers (2015).'
    )
  };
}
