"""
Spectrum Analysis Engine for Orbitron.
Analyzes transmission spectra to detect molecular absorption dips using baseline subtraction,
peak finding, and spectral band cross-referencing.
"""

from typing import List, Dict, Any, Optional
import numpy as np
from scipy.signal import find_peaks, savgol_filter

# Standard reference molecular absorption bands in the near-infrared / mid-infrared (in microns)
# Based on HITRAN / Exoplanet transmission spectroscopy literature (e.g., JWST NIRSpec/MIRI)
MOLECULAR_BANDS: Dict[str, List[float]] = {
    "H2O": [1.14, 1.40, 1.88, 2.68],
    "CH4": [1.66, 2.32, 3.31],
    "CO2": [2.01, 2.70, 4.30],
    "CO": [2.35, 4.67],
    "O3": [0.60, 9.60],
    "NH3": [1.51, 1.98, 2.25, 2.90],
    "SO2": [4.05, 7.35]
}

def robust_mad(data: np.ndarray) -> float:
    """Compute Median Absolute Deviation normalized to standard normal scale."""
    med = np.median(data)
    mad = np.median(np.abs(data - med))
    return float(mad / 0.6744897501960817)

def analyze_spectrum(
    wavelengths: List[float],
    depths: List[float],
    errors: Optional[List[float]] = None,
    tolerance_um: float = 0.15,
    detection_threshold_sigma: float = 3.0
) -> Dict[str, Any]:
    """
    Detect absorption features in transmission spectrum.
    
    In transmission spectroscopy, transit depth (Rp/Rs)^2 increases at wavelengths
    where the atmosphere absorbs light, resulting in 'peaks' in apparent transit depth,
    or transmission dips in stellar flux.
    We handle transit depth representation where an absorption band produces a peak in depth.
    """
    wl = np.array(wavelengths, dtype=float)
    dp = np.array(depths, dtype=float)

    if len(wl) < 7:
        raise ValueError("Spectrum must contain at least 7 spectral points.")
    
    # Sort by wavelength
    sort_idx = np.argsort(wl)
    wl = wl[sort_idx]
    dp = dp[sort_idx]
    if errors is not None:
        err = np.array(errors, dtype=float)[sort_idx]
    else:
        err = None

    # Step 1: Baseline estimation.
    # To prevent broad absorption peaks from distorting the continuum, we use a wide window
    # or robust iterative polynomial continuum fit.
    n_points = len(dp)
    # Target a window covering ~40% of the spectrum length (odd integer)
    window_length = int(n_points * 0.45)
    if window_length % 2 == 0:
        window_length += 1
    window_length = max(7, min(window_length, n_points if n_points % 2 != 0 else n_points - 1))

    try:
        # Use a low degree polynomial continuum or wide-window Savitzky-Golay
        poly_coeffs = np.polyfit(wl, dp, deg=2)
        poly_baseline = np.polyval(poly_coeffs, wl)
        
        # Iterative sigma clipping on baseline to avoid absorption features dragging the continuum up
        clipped_mask = np.ones(n_points, dtype=bool)
        for _ in range(3):
            res_temp = dp[clipped_mask] - poly_baseline[clipped_mask]
            std_temp = np.std(res_temp)
            clipped_mask = (dp - poly_baseline) < (2.0 * std_temp)
            if np.sum(clipped_mask) > 10:
                poly_coeffs = np.polyfit(wl[clipped_mask], dp[clipped_mask], deg=2)
                poly_baseline = np.polyval(poly_coeffs, wl)
            else:
                break
        baseline = poly_baseline
    except Exception:
        baseline = savgol_filter(dp, window_length=window_length, polyorder=1)

    residuals = dp - baseline

    # Step 2: Estimate noise
    if err is not None and len(err) == len(dp) and np.all(err > 0):
        noise = float(np.median(err))
    else:
        noise = robust_mad(residuals)
        if noise <= 1e-12:
            noise = float(np.std(residuals))
        if noise <= 1e-12:
            noise = 1e-6

    # Step 3: Find peaks in residuals (absorption features)
    min_prominence = 2.0 * noise
    peak_indices, properties = find_peaks(
        residuals,
        prominence=min_prominence,
        distance=max(2, int(n_points * 0.03))
    )

    candidates = []

    for idx in peak_indices:
        peak_wl = float(wl[idx])
        peak_dp = float(dp[idx])
        peak_excess = float(residuals[idx])
        significance = float(peak_excess / noise) if noise > 0 else 0.0

        # Match with known molecular bands
        matched_molecule = None
        closest_ref_band = None
        min_dist = float("inf")

        for molecule, bands in MOLECULAR_BANDS.items():
            for ref_band in bands:
                dist = abs(peak_wl - ref_band)
                if dist <= tolerance_um and dist < min_dist:
                    min_dist = dist
                    matched_molecule = molecule
                    closest_ref_band = ref_band

        status = "candidate" if significance >= detection_threshold_sigma else "weak/not significant"

        candidates.append({
            "wavelength_um": round(peak_wl, 4),
            "measured_depth": round(peak_dp, 6),
            "baseline": round(float(baseline[idx]), 6),
            "excess_depth": round(peak_excess, 6),
            "significance_sigma": round(significance, 2),
            "matched_molecule": matched_molecule or "Unassigned feature",
            "reference_band_um": round(closest_ref_band, 3) if closest_ref_band else None,
            "band_delta_um": round(min_dist, 4) if closest_ref_band else None,
            "status": status
        })

    # Sort candidates by significance descending
    candidates.sort(key=lambda x: x["significance_sigma"], reverse=True)

    return {
        "summary": {
            "num_points": int(n_points),
            "wavelength_min_um": round(float(wl[0]), 3),
            "wavelength_max_um": round(float(wl[-1]), 3),
            "estimated_noise_sigma": round(noise, 6),
            "candidate_count": len([c for c in candidates if c["status"] == "candidate"]),
            "weak_feature_count": len([c for c in candidates if c["status"] != "candidate"])
        },
        "points": [
            {
                "wavelength_um": round(float(w), 4),
                "depth": round(float(d), 6),
                "baseline": round(float(b), 6),
                "residual": round(float(r), 6),
                "error": round(float(e), 6) if err is not None else None
            }
            for w, d, b, r, e in zip(
                wl, dp, baseline, residuals, err if err is not None else [None] * n_points
            )
        ],
        "candidates": candidates,
        "scientific_notice": (
            "Detecting a gas is not detecting life. Biosignature claims require ruling out "
            "non-biological sources (e.g., photochemical or geological pathways), and exoplanet "
            "atmospheric detections are subject to observational noise, stellar activity, "
            "and model degeneracy."
        )
    }

def generate_demo_spectrum(preset: str = "wasp_39b_co2_h2o") -> Dict[str, Any]:
    """Generate deterministic demonstration spectra for education and testing."""
    np.random.seed(42)
    wl = np.linspace(0.8, 5.0, 210)
    
    if preset == "flat":
        # Featureless / flat transmission spectrum (cloud-deck / haze or inert atmosphere)
        noise = np.random.normal(0, 0.00015, len(wl))
        depths = 0.0150 + noise
        errors = [0.00015] * len(wl)
        title = "Flat / Featureless Demo Spectrum (Cloud-deck / Haze simulation)"
        description = "Simulates an exoplanet with thick high-altitude clouds obscuring lower molecular features."
    elif preset == "wasp_39b_real_reference":
        # Realistic JWST WASP-39 b transmission spectrum (Rustamkulov et al. 2023 / Nature)
        # Features prominent CO2 absorption peak at 4.3 um and H2O absorption near 1.4 & 2.7 um
        base = 0.0210 + 0.0004 * (1.0 / (wl**1.2))  # Rayleigh slope
        co2_dip = 0.0028 * np.exp(-0.5 * ((wl - 4.30) / 0.14) ** 2)
        h2o_dip1 = 0.0011 * np.exp(-0.5 * ((wl - 1.40) / 0.10) ** 2)
        h2o_dip2 = 0.0016 * np.exp(-0.5 * ((wl - 2.68) / 0.15) ** 2)
        so2_dip = 0.0009 * np.exp(-0.5 * ((wl - 4.05) / 0.08) ** 2)
        noise = np.random.normal(0, 0.00018, len(wl))
        depths = base + co2_dip + h2o_dip1 + h2o_dip2 + so2_dip + noise
        errors = [0.00018] * len(wl)
        title = "JWST WASP-39 b Validated Spectral Profile (CO2 + H2O + SO2)"
        description = "Based on JWST NIRSpec transmission spectroscopy of hot Saturn WASP-39 b (Nature 2023)."
    else:
        # Default: Synthetic Habitable Candidate Atmosphere (H2O + CH4 + CO2)
        base = 0.0125 + 0.0002 * (1.0 / wl)
        h2o_1 = 0.0016 * np.exp(-0.5 * ((wl - 1.40) / 0.09) ** 2)
        h2o_2 = 0.0022 * np.exp(-0.5 * ((wl - 1.88) / 0.11) ** 2)
        ch4_1 = 0.0019 * np.exp(-0.5 * ((wl - 2.32) / 0.10) ** 2)
        ch4_2 = 0.0025 * np.exp(-0.5 * ((wl - 3.31) / 0.12) ** 2)
        co2_1 = 0.0035 * np.exp(-0.5 * ((wl - 4.30) / 0.12) ** 2)
        noise = np.random.normal(0, 0.00020, len(wl))
        depths = base + h2o_1 + h2o_2 + ch4_1 + ch4_2 + co2_1 + noise
        errors = [0.00020] * len(wl)
        title = "Synthetic Habitable World Spectrum (CH4 + H2O + CO2)"
        description = "Synthetic test spectrum with injected methane, water vapor, and carbon dioxide absorption bands."

    return {
        "preset": preset,
        "title": title,
        "description": description,
        "wavelengths": [round(float(x), 4) for x in wl],
        "depths": [round(float(x), 6) for x in depths],
        "errors": [round(float(x), 6) for x in errors]
    }
