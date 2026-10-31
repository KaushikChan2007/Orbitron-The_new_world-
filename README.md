# Orbitron: The New World

> *Orbitron is a tool designed to make the reach of human existence more vast and help us become an interstellar species.*

# ORBITRON — Cinematic Exoplanet Intelligence & Biomolecular Anatomy Platform

> **Hero Headline:** **EXPLORE. ANALYZE. ENDURE.**  
> **Tagline:** *Beyond Earth. Towards Humanity's Next Home.*  
> **Event:** Graviton Hackathon (Space Theme) — Build Brief v3  

ORBITRON merges exoplanet discovery with deep-space human radiobiology:
1. **Exoplanet Intelligence:** Real NASA archival composite parameters (`pscomppars` via TAP) determining what the data says and does *not* say about candidate worlds.
2. **Biomolecular Anatomy Lab (Hero Feature):** Investigating how deep-space cosmic radiation (GCR/SPE) and microgravity alter human biology from DNA double-strand breaks to whole-body organ systems.

---

## 🛰️ Live Server URLs

- **Web App (Frontend):** [http://localhost:5173](http://localhost:5173) (or `http://127.0.0.1:5173`)
- **Science API (Backend):** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🎨 Design & Layout (Brief v3 Specification)

- **Palette:** Cinematic near-black `#05070D` → `#0A0F1C`, high-contrast white `#F5F7FA`, silver `#9AA7B8`, nominal system mint `#9EE6B0`, and cautionary amber `#F2994A`. No saturated blue/neon gradients.
- **Top Navigation:** Floating pill navigation bar (`1. Mission Control`, `2. Exoplanet Explorer`, `3. Habitability Analysis`, `4. Anatomy Lab`, `5. Compare Grid`, `6. Spectrum Lab`, `7. Settlement`, `8. Sources`) with Ask AI toggle.
- **Mission Control Deck:** High-impact hero headline, realistic 3D static planet with atmospheric glow and orbital rings, pinned target badge (`KEPLER-186F`), vertical metrics rail, and an interconnected 4-card glass grid.
- **Interactions:** Smooth scale lifts, subtle lighting on hover, and hidden scrollbars for clean immersion.

---

## 🔬 Core Platform Modules

1. **Mission Control:**
   - Real-time dataset telemetry: curated from 520 NASA TAP archive worlds.
   - Interconnected status grid: Archive Completeness, Benchmark Target, Live System Scan (radar sweep), and Mission Pipeline.
2. **Exoplanet Explorer (`pages/Explorer.tsx`):**
   - Filter by radius classification (Rocky $\le 1.6\ R_\oplus$, Sub-Neptune, Giant), discovery method, mass, and period.
   - Clean card grid layout with live completeness bars and quick-access dossier buttons.
3. **Habitability Analysis (`pages/Dossier.tsx`):**
   - Dual-track astronomical ruler comparing the Solar System against target stars.
   - Mikko Tuomi et al. (2013) & Kopparapu et al. (2013) cloud feedback boundaries (100% clouds, 50% clouds, No clouds, Habitable Zone, $\text{CO}_2$ clouds).
   - Kopparapu et al. (2013) & Rogers (2015) transparent habitability screening with parameter confidence.
   - Derived surface mechanics ($g$, $v_{esc}$, $\rho$) and unmeasured parameter identification.
4. **Biomolecular Anatomy Lab (`pages/AnatomyLab.tsx` — HERO MODULE):**
   - Environment presets: Deep-space transit (Mars cruise $0.48\text{ mGy/d}, 1.84\text{ mSv/d}$, Zeitlin 2013), Mars surface ($0.21\text{ mGy/d}, 0.64\text{ mSv/d}$, Hassler 2014), ISS LEO, and Solar Particle Events.
   - **Tab 1 — DNA Damage:** Animated DNA strand break simulation with $\sim 35\text{ DSBs/Gy}$ baseline and NHEJ/HR repair kinetics.
   - **Tab 2 — Cellular Foci:** Calibration grid ($0\text{–}1000\text{ mGy}$) of $\gamma\text{-H2AX}$ foci formation.
   - **Tab 3 — Immune System:** T-cell suppression and latent viral reactivation analysis.
   - **Tab 4 — Nervous System:** Heavy-ion central nervous system effects alongside microgravity SANS ocular syndrome.
5. **Comparison Matrix (`pages/Comparison.tsx`):**
   - Multi-target side-by-side scientific grid matrix with Earth (Sol III) baseline constants.
   - Live differential percentage calculations across radius, mass, gravity, insolation flux, and equilibrium temperature.
   - AI-powered comparative differentiator synthesis with deep scientific takeaways.
6. **Spectrum Lab (`pages/SpectrumLab.tsx`):**
   - Automated transmission spectrum gas absorption detection ($H_2O, CO_2, CH_4, O_3$).
7. **Ask Orbitron AI:**
   - Multi-model reasoning engine powered by Google Gemini/Gemma models with grounded astronomical telemetry.
