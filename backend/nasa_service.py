"""
NASA Exoplanet Archive Service & Habitable Candidate Enrichment Engine.
Fetches from IPAC Caltech TAP API, enriches with Kopparapu (2013) & Rogers (2015) astrophysics,
caches locally, and returns verified candidate datasets.
"""

import os
import json
import time
import math
import requests
from typing import List, Dict, Any, Optional

CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "habitable_planets_cache.json")
SNAPSHOT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "planets_snapshot.json")

NASA_TAP_URL = (
    "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?"
    "query=select+pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,pl_orbper,pl_eqt,pl_insol,sy_dist,st_teff,st_rad,st_lum"
    "+from+pscomppars+where+pl_insol+between+0.2+and+2.2+or+(pl_eqt+between+180+and+320)+or+(pl_rade+between+0.5+and+2.0)"
    "&format=json"
)

class NasaService:
    def __init__(self):
        self.cache_path = CACHE_PATH
        self.snapshot_path = SNAPSHOT_PATH

    def _calc_kopparapu_hz(self, teff: Optional[float], lum_solar: Optional[float]) -> Dict[str, Optional[float]]:
        """
        Kopparapu et al. (2013) Habitable Zone flux boundaries.
        Returns flux limits (Seff) for Conservative (Runaway Greenhouse, Maximum Greenhouse)
        and Optimistic (Recent Venus, Early Mars).
        """
        if not teff:
            return {"inner_conservative": 1.11, "outer_conservative": 0.53, "inner_optimistic": 1.76, "outer_optimistic": 0.32}

        t_star = teff - 5780.0
        # Coefficients for Runaway Greenhouse (inner conservative)
        s_inner_cons = 1.107 + 1.332e-4 * t_star + 1.58e-8 * (t_star ** 2)
        # Maximum Greenhouse (outer conservative)
        s_outer_cons = 0.356 + 6.171e-5 * t_star + 1.69e-8 * (t_star ** 2)
        # Recent Venus (inner optimistic)
        s_inner_opt = 1.776 + 2.136e-4 * t_star + 2.53e-8 * (t_star ** 2)
        # Early Mars (outer optimistic)
        s_outer_opt = 0.320 + 5.547e-5 * t_star + 1.53e-8 * (t_star ** 2)

        return {
            "inner_conservative": round(s_inner_cons, 3),
            "outer_conservative": round(s_outer_cons, 3),
            "inner_optimistic": round(s_inner_opt, 3),
            "outer_optimistic": round(s_outer_opt, 3)
        }

    def enrich_planet(self, p: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich raw NASA parameters with real astrophysical derived properties.
        """
        enriched = dict(p)
        r = p.get("pl_rade")
        m = p.get("pl_bmasse")
        insol = p.get("pl_insol")
        teff = p.get("st_teff")
        eqt = p.get("pl_eqt")

        # 1. Surface gravity & escape velocity (Rogers 2015, Earth = 1)
        if r and m and r > 0 and m > 0:
            enriched["surface_gravity_g"] = round(float(m) / (float(r) ** 2), 2)
            enriched["escape_velocity_kms"] = round(11.186 * math.sqrt(float(m) / float(r)), 2)
            enriched["bulk_density_g_cm3"] = round(5.51 * (float(m) / (float(r) ** 3)), 2)
        else:
            enriched["surface_gravity_g"] = None
            enriched["escape_velocity_kms"] = None
            enriched["bulk_density_g_cm3"] = None

        # 2. Composition Regime (Rogers 2015 1.6 R_Earth rocky limit)
        if r is not None:
            if r <= 1.25:
                enriched["composition_regime"] = "Rocky Terrestrial (High Confidence)"
            elif r <= 1.6:
                enriched["composition_regime"] = "Super-Earth (Likely Rocky, Rogers 2015)"
            elif r <= 2.5:
                enriched["composition_regime"] = "Sub-Neptune / Volatile Envelope"
            else:
                enriched["composition_regime"] = "Gas / Giant"
        else:
            enriched["composition_regime"] = "Unmeasured Radius"

        # 3. Habitable Zone Status based on Kopparapu et al. (2013)
        hz_bounds = self._calc_kopparapu_hz(teff, None)
        enriched["hz_boundaries"] = hz_bounds

        if insol is not None:
            if hz_bounds["outer_conservative"] <= insol <= hz_bounds["inner_conservative"]:
                enriched["hz_classification"] = "Conservative Habitable Zone"
                enriched["hz_score"] = 92
            elif hz_bounds["outer_optimistic"] <= insol <= hz_bounds["inner_optimistic"]:
                enriched["hz_classification"] = "Optimistic Habitable Zone"
                enriched["hz_score"] = 78
            elif insol > hz_bounds["inner_optimistic"]:
                enriched["hz_classification"] = "Too Hot (Inner Boundary Exceeded)"
                enriched["hz_score"] = 25
            else:
                enriched["hz_classification"] = "Too Cold (Outer Boundary Exceeded)"
                enriched["hz_score"] = 30
        elif eqt is not None:
            if 220 <= eqt <= 285:
                enriched["hz_classification"] = "Equilibrium Temp Habitable Band"
                enriched["hz_score"] = 70
            elif 180 <= eqt <= 320:
                enriched["hz_classification"] = "Extended Thermal Envelope"
                enriched["hz_score"] = 50
            else:
                enriched["hz_classification"] = "Thermal Boundary Exceeded"
                enriched["hz_score"] = 20
        else:
            enriched["hz_classification"] = "Insolation / Teq Unmeasured"
            enriched["hz_score"] = None

        # 4. Host Star Spectral Type & Activity Risk
        if teff:
            if teff >= 6000:
                enriched["spectral_class"] = "F-type"
                enriched["stellar_radiation_risk"] = "Moderate UV flux, low flare frequency"
            elif teff >= 5200:
                enriched["spectral_class"] = "G-type (Solar Analog)"
                enriched["stellar_radiation_risk"] = "Stable quiescent stellar wind, low flare frequency"
            elif teff >= 3700:
                enriched["spectral_class"] = "K-type (Orange Dwarf)"
                enriched["stellar_radiation_risk"] = "Low energetic flare activity, stable long-lived habitable zone"
            else:
                enriched["spectral_class"] = "M-type (Red Dwarf)"
                enriched["stellar_radiation_risk"] = "High coronal flare frequency; atmospheric erosion risk without strong dipolar magnetosphere"
        else:
            enriched["spectral_class"] = "Unknown"
            enriched["stellar_radiation_risk"] = "Stellar temperature not catalogued"

        return enriched

    def fetch_habitable_candidates(self) -> Dict[str, Any]:
        """
        Hit NASA Exoplanet Archive TAP API, enrich the data, cache locally, and return it.
        Falls back to local verified snapshot if offline or unreachable.
        """
        candidates = []
        source = "NASA Exoplanet Archive (Live TAP Query)"
        cached_time = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        try:
            resp = requests.get(NASA_TAP_URL, timeout=8)
            if resp.status_code == 200:
                raw_data = resp.json()
                if isinstance(raw_data, list) and len(raw_data) > 0:
                    candidates = raw_data
        except Exception as e:
            # Fallback to local snapshot
            pass

        if not candidates and os.path.exists(self.snapshot_path):
            with open(self.snapshot_path, "r", encoding="utf-8") as f:
                snap = json.load(f)
                planets = snap.get("planets", [])
                # Filter habitable candidates from snapshot
                candidates = [
                    p for p in planets
                    if (p.get("pl_insol") and 0.2 <= p.get("pl_insol") <= 2.2)
                    or (p.get("pl_eqt") and 180 <= p.get("pl_eqt") <= 320)
                    or (p.get("pl_rade") and 0.5 <= p.get("pl_rade") <= 2.0)
                ]
                source = "Local Cached NASA Snapshot (Enriched)"

        # Enrich all candidates
        enriched_candidates = [self.enrich_planet(p) for p in candidates]

        # Prioritize top verified habitable worlds (TRAPPIST-1 e, Proxima Cen b, Kepler-186 f, TOI-700 d, LHS 1140 b, etc.)
        def priority_key(p):
            name = p.get("pl_name", "")
            priority_names = ["TRAPPIST-1 e", "Kepler-186 f", "Proxima Cen b", "TOI-700 d", "LHS 1140 b", "K2-18 b", "Kepler-452 b", "Kepler-62 f"]
            if name in priority_names:
                return (0, priority_names.index(name))
            score = p.get("hz_score") or 0
            return (1, -score)

        enriched_candidates.sort(key=priority_key)

        result = {
            "source": source,
            "retrieved_at": cached_time,
            "count": len(enriched_candidates),
            "candidates": enriched_candidates
        }

        # Cache locally
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
        except Exception:
            pass

        return result

# Singleton instance ready for import
nasa_service = NasaService()
