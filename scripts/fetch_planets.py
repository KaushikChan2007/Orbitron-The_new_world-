#!/usr/bin/env python3
"""
Fetch exoplanet composite parameters from the NASA Exoplanet Archive via TAP API
and generate a high-completeness offline snapshot for Orbitron.
"""

import json
import os
import sys
from datetime import datetime, timezone
import requests

TAP_URL = (
    "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?"
    "query=select+pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,"
    "pl_orbper,pl_eqt,pl_insol,sy_dist,st_teff,st_rad,st_lum+from+pscomppars"
    "&format=json"
)

DEMO_PLANETS = [
    "TRAPPIST-1 e",
    "Proxima Cen b",
    "TOI-700 d",
    "LHS 1140 b",
    "K2-18 b",
    "Kepler-452 b",
    "Kepler-186 f",
    "WASP-39 b",
    "TRAPPIST-1 b",
    "TRAPPIST-1 c",
    "TRAPPIST-1 d",
    "TRAPPIST-1 f",
    "TRAPPIST-1 g",
    "TRAPPIST-1 h",
    "Kepler-22 b",
    "Kepler-1649 c",
    "Ross 128 b",
    "GJ 1061 d",
    "Wolf 1061 c",
    "Teegarden's Star b",
    "55 Cnc e",
    "HD 209458 b",
    "GJ 1214 b",
    "HAT-P-7 b",
    "WASP-12 b"
]

def fetch_planets():
    print(f"Connecting to NASA Exoplanet Archive TAP API...")
    try:
        resp = requests.get(TAP_URL, timeout=30)
        resp.raise_for_status()
        raw_planets = resp.json()
        print(f"Retrieved {len(raw_planets)} total planet records from NASA TAP.")
    except Exception as e:
        print(f"Failed to query live TAP API: {e}", file=sys.stderr)
        return None

    # Index by pl_name
    by_name = {p.get("pl_name", "").strip(): p for p in raw_planets if p.get("pl_name")}

    selected = []
    seen = set()

    # 1. First ensure all demo planets are included if present
    for demo_name in DEMO_PLANETS:
        # Exact match or case-insensitive match
        match = by_name.get(demo_name)
        if not match:
            for k, v in by_name.items():
                if k.lower() == demo_name.lower():
                    match = v
                    break
        if match and match["pl_name"] not in seen:
            selected.append(match)
            seen.add(match["pl_name"])

    # 2. Select planets with high data completeness (radius AND eq temp OR insolation)
    high_quality = []
    other_quality = []
    for p in raw_planets:
        name = p.get("pl_name")
        if not name or name in seen:
            continue
        has_radius = p.get("pl_rade") is not None
        has_eqt = p.get("pl_eqt") is not None
        has_insol = p.get("pl_insol") is not None
        has_mass = p.get("pl_bmasse") is not None

        if has_radius and (has_eqt or has_insol):
            if has_mass:
                high_quality.append(p)
            else:
                other_quality.append(p)

    # Sort high quality by distance (closest first for interest) or discovery year
    high_quality.sort(key=lambda x: (x.get("sy_dist") is None, x.get("sy_dist") or 999999))
    other_quality.sort(key=lambda x: (x.get("sy_dist") is None, x.get("sy_dist") or 999999))

    # Target ~500 planets
    target_count = 520
    for p in high_quality:
        if len(selected) >= target_count:
            break
        selected.append(p)
        seen.add(p["pl_name"])

    for p in other_quality:
        if len(selected) >= target_count:
            break
        selected.append(p)
        seen.add(p["pl_name"])

    now_iso = datetime.now(timezone.utc).isoformat()
    output_data = {
        "metadata": {
            "retrieved_at": now_iso,
            "source_name": "NASA Exoplanet Archive (pscomppars table via TAP)",
            "source_url": TAP_URL,
            "total_catalogue_records": len(raw_planets),
            "snapshot_records": len(selected),
            "notes": (
                "Composite planet and stellar parameters. pl_rade in Earth radii, "
                "pl_bmasse in Earth masses, pl_orbper in days, pl_eqt in K, "
                "pl_insol in Earth insolation (Earth=1), sy_dist in parsecs, "
                "st_teff in K, st_rad in solar radii, st_lum in log10(solar luminosity)."
            )
        },
        "planets": selected
    }

    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "planets_snapshot.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print(f"Successfully saved {len(selected)} exoplanets to {out_path}")
    return output_data

if __name__ == "__main__":
    fetch_planets()
