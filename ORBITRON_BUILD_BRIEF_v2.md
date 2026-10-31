# ORBITRON — Build Brief v2 (Antigravity handoff)

**Product:** ORBITRON
**Tagline:** *Beyond Earth. Towards Humanity's Next Home.*
**Category:** AI-powered exoplanet intelligence platform (research and education prototype)
**Event:** Graviton hackathon (space theme), one-day build

> **Instruction to Antigravity:** Build a working, navigable web app, not a landing page. Every visible control must work. Use real NASA data (bundled snapshot) or clearly labelled demo data. Prioritise a reliable end-to-end demo over feature count. **Do not build anything listed under "Out of scope".** If something cannot be validated scientifically, label it hypothetical or leave it out.

---

## 1. Product in one paragraph

Orbitron lets a user **discover** known exoplanets, **analyze** what the data does and does not say about habitability, **detect** gas absorption features in a transmission spectrum automatically, **compare** a world with Earth, and explore **hypothetical** radiation scenarios for a future visit. It never claims a planet is inhabited or safe for humans. It separates **measured**, **derived**, **estimated**, **hypothetical**, and **unknown** values everywhere.

**Core journey:** Discover → Analyze → Detect → Compare → Protect

**Pitch line:** *"Of 6,000+ known exoplanets, which deserve telescope time, and what would a human visit face?"*

## 2. Scope (strict)

### Must-have (build these, in this order)
1. Mission Control (dashboard)
2. Exoplanet Explorer + planet detail
3. Habitability Analysis (transparent screening index)
4. Spectrum Lab (the automation/AI signature feature)
5. Earth Comparison (includes "Hypothetical Human Visit" context)
6. Radiation Lab (hypothetical scenarios)
7. Ask Orbitron AI (grounded)
8. About / Sources (also hosts the Roadmap)

### Should-have (only after all must-haves work end to end)
- Orbit sonification (Web Audio) for multi-planet systems
- Planet Passport card (shareable PNG)
- Recharts polish, subtle Framer Motion transitions

### Out of scope (do NOT build; list as "Roadmap" on the About page)
- Settlement Planner, Future Simulator (resource simulation)
- 3D planet/settlement visualisation, user accounts, PostgreSQL, saved workspaces, report export, route planning

## 3. Visual direction

- Reference image: `assets/orbitron_visual_direction.png` (design-direction board only; do not copy its sample numbers or any factual claim from it).
- Palette: background `#071A36` / `#061326`; panels `#0B1F3A`, `#102B4B`; text `#FFFFFF`; secondary text `#AFC2D9`; accent blue `#2775D8`; accent cyan `#4CC9E8`; light surface `#F4F7FC`; borders `#24466B`.
- Navy + white identity, not black/neon. Starfield or Earth-from-space hero with a dark overlay for readability.
- Thin orbital lines, restrained glow, rounded cards, clean charts, Lucide icons, readable text sizes.
- Desktop first; functional on tablet and mobile (sidebar becomes a drawer).
- Planet illustrations are allowed but must be labelled "Artistic representation".

## 4. Navigation

Persistent left sidebar (desktop) / drawer (mobile):
1. Mission Control
2. Exoplanet Explorer
3. Habitability Analysis
4. Spectrum Lab
5. Earth Comparison
6. Radiation Lab
7. Ask Orbitron AI
8. About / Sources

A small "Discover → Analyze → Detect → Compare → Protect" stepper is shown on planet-related screens.

## 5. Data

### 5.1 Source
NASA Exoplanet Archive, table `pscomppars` (composite parameters), via TAP:

```
https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,pl_orbper,pl_eqt,pl_insol,sy_dist,st_teff,st_rad,st_lum+from+pscomppars&format=json
```

Field notes: `pl_rade` (Earth radii), `pl_bmasse` (Earth masses; may be a minimum mass or an estimate), `pl_orbper` (days), `pl_eqt` (K), `pl_insol` (Earth flux = 1), `sy_dist` (parsec), `st_teff` (K), `st_rad` (solar radii), `st_lum` (**log10 of solar luminosity**; convert before display).

### 5.2 Offline-first design (mandatory)
- Write `scripts/fetch_planets.py` to download the query above and save `data/planets_snapshot.json` (target ~500 planets: include all of the demo planets below, plus planets that have radius and eq. temp or insolation) with `retrieved_at` and source URL.
- The app **loads the bundled snapshot by default**. Data-status badge shows **"Cached NASA Exoplanet Archive snapshot — retrieved <date>"**.
- Optional "Refresh from NASA" button (via backend proxy). On failure, keep the snapshot and show a non-blocking error.
- Never invent missing values. Show **"Not available"**. Preserve original units; any conversion is labelled.
- Each value in the UI carries a type tag: `measured` (catalogue), `derived` (formula from catalogue values), `estimated`, `hypothetical`, or `unknown`.

### 5.3 Demo planets
Pre-select these as featured planets. Verify each has the fields needed; swap any that are too sparse:
TRAPPIST-1 e, Proxima Cen b, TOI-700 d, LHS 1140 b, K2-18 b, Kepler-452 b.

## 6. Screens

### 6.1 Mission Control
- Hero: **"Earth is our beginning, not our limit."** + two sentences on Orbitron.
- Actions: "Explore Exoplanets" → Explorer, "Analyze a Planet" → Habitability (featured planet), "Detect Gases" → Spectrum Lab.
- Metrics computed from the loaded dataset only (total records, records with radius, records with eq. temp). No hardcoded totals.
- Featured planets (the demo list) and recently viewed (session state).
- Data-status badge (Cached / Live / Demo).

### 6.2 Exoplanet Explorer
- Search by planet or host star. Filters: radius, mass, orbital period, eq. temp, discovery method, star temperature. Sort: name, year, radius, period, distance. Pagination or "load more".
- Planet cards: name, host star, key values, data-completeness bar.
- Detail drawer/page: all fields with units, type tags, source, retrieval date, missing-data labels.
- Actions: "Analyze this planet", "Add to comparison", "Open in Spectrum Lab" (if a spectrum is available).

### 6.3 Habitability Analysis
Label everything **"Orbitron illustrative screening index"** (not a NASA score, not a probability of life).

Factors (each scored 0–1, or `null` if its input is missing; never default a missing factor to a favourable value):

| Factor | Input | Default weight | Scoring (illustrative, configurable in `config/habitability.ts`) |
|---|---|---|---|
| Stellar flux context | `pl_insol` | 0.35 | 1.0 inside conservative zone (~0.36–1.1 S⊕); linear falloff to 0 at the optimistic limits (~0.32 and ~1.77 S⊕) |
| Temperature context | `pl_eqt` | 0.25 | 1.0 for 250–300 K; linear falloff to 0 at 180 K and 380 K |
| Size / composition plausibility | `pl_rade` | 0.25 | 1.0 for ≤1.6 R⊕ (likely rocky); falls to 0 by 2.5 R⊕ |
| Host star type | `st_teff` | 0.15 | 1.0 for ~4000–6500 K; reduced for M dwarfs (flare-activity concern flagged qualitatively) and hot stars |

Rules:
- Index = weighted mean over **available** factors (weights renormalised).
- **Confidence** = share of total weight that was available. Shown separately from the index.
- If confidence < 50%, show **"Insufficient data"** instead of a number.
- The flux thresholds are approximate values from Kopparapu et al. (2013) for Sun-like stars; they depend on stellar temperature, which this prototype ignores. State this next to the result. Verify the thresholds against the paper before finalising; adjust the config if different.
- Rocky threshold ~1.6 R⊕ follows Rogers (2015); cite it.

UI: factor bar/radar chart, "Known / Estimated / Unknown" panel, "What this means", "What we do not know", visible weights, assumptions and sources panel. Caveat shown inline: *a habitable-zone location does not establish liquid water, an atmosphere, or life.*

### 6.4 Spectrum Lab (signature feature)
Purpose: automatically flag candidate molecular absorption features in a transmission spectrum, instead of doing it by eye.

Input options:
1. **Built-in demo spectra**, clearly labelled **"Synthetic demonstration spectrum, not real data"** (e.g. one with CO₂ + H₂O features, one featureless/flat for contrast).
2. **CSV upload** (columns: `wavelength_um`, `depth` and optional `error`), with validation and readable errors.
3. *Optional, if reachable in time:* a published JWST transmission spectrum from the NASA Exoplanet Archive spectra tables (for example WASP-39 b, where JWST detected CO₂ near 4.3 µm) as a **real-data validation example**, labelled with its source.

Algorithm (Python, `spectrum_engine.py`, using NumPy/SciPy; deterministic and unit-tested):
1. Normalise and fit a smooth baseline (e.g. Savitzky–Golay or low-order polynomial).
2. Compute residuals; estimate noise (use `error` if given, else robust MAD).
3. Find significant dips with `scipy.signal.find_peaks` on the inverted residual.
4. Match each dip to a configurable band table within a tolerance (default ±0.1 µm). Approximate band centres (verify against a reference such as HITRAN-derived literature before finalising): H₂O ≈ 1.4, 1.9, 2.7 µm; CH₄ ≈ 2.3, 3.3 µm; CO₂ ≈ 2.0, 4.3 µm.
5. Report for each candidate: molecule, wavelength, depth, significance (depth / noise, in σ), and a status (**"candidate"** if ≥3σ, otherwise **"weak/not significant"**).

Output UI: spectrum chart with annotated bands, results table, and a mandatory notice: *"Detecting a gas is not detecting life. Biosignature claims require ruling out non-biological sources, and exoplanet-atmosphere detections are often disputed."* Never output a "probability of life".

### 6.5 Earth Comparison (+ Hypothetical Human Visit context)
- Select planets from Explorer (up to 3) against Earth. Side-by-side panels + table with units + chart + "Known/Unknown" markers + a concise summary. "Copy summary" button.
- Earth baseline (cite NASA Earth Fact Sheet): radius 1 R⊕, mass 1 M⊕, orbital period 365.25 d, insolation 1, equilibrium temperature ≈ 255 K, g = 1.
- **"Hypothetical Human Visit" panel** (derived values only; this is *not* a survivability score), computed from catalogue values with Earth = 1:
  - Surface gravity (relative): `g = (M/M⊕) / (R/R⊕)²`
  - Escape velocity: `v_esc = 11.186 × sqrt((M/M⊕) / (R/R⊕)) km/s`
  - Bulk density: `ρ = 5.514 × (M/M⊕) / (R/R⊕)³ g/cm³`
  - Stellar flux (`pl_insol`) and equilibrium temperature as given
  - Needs both mass and radius; otherwise show "Not available". Note that `pl_bmasse` can be a minimum mass.
  - Plain-language bullets, e.g. "gravity would feel ~X× Earth's", always followed by what is unknown (atmosphere, surface, magnetic field, radiation).

### 6.6 Radiation Lab (hypothetical scenarios)
Inputs: environment preset (ISS-like orbit, interplanetary transit, Mars-like surface, custom), duration (days), dose-rate assumption **with units**, shielding preset (none / light / moderate / heavy), mission profile (optional).

Calculation (TypeScript, pure functions, unit-tested):
- `cumulative_dose = dose_rate × duration × shielding_transmission`
- Shielding transmission values are **illustrative assumptions**, shown and editable (e.g. 1.0 / 0.9 / 0.7 / 0.5). State plainly that real shielding effectiveness depends on material, thickness, and radiation type, and that thin shields do not reduce galactic cosmic rays linearly.
- Keep **absorbed dose (Gy)**, **equivalent dose (Sv)** and **effective dose (Sv)** distinct. The prototype works in **mSv (dose equivalent)** and says so; never mix units.

Reference values (show only if you can verify them from the cited source; otherwise omit): Earth average natural background ≈ 2.4 mSv/year (UNSCEAR); ISS crew ≈ 0.5 mSv/day order of magnitude; Mars cruise ≈ 1.8 mSv/day and Mars surface ≈ 0.6–0.7 mSv/day (NASA MSL RAD measurements); NASA career exposure limit (current NASA standard). Cite each; do not present approximate numbers as precise.

Planet link (honest version): when a planet is selected, show its **stellar flux and host star type as context** and a qualitative flag for M-dwarf flare activity. **Do not convert stellar flux into an ionising-radiation dose and do not state any measured surface radiation for an exoplanet; it is unknown.**

Output UI: dose-accumulation chart over time, input vs output separation, shielding explanation, limitation panel, **Reset scenario** button. Mandatory notice: *educational scenario model, not medical advice and not a validated mission radiation-risk assessment.* No cancer-probability or DNA-damage numbers.

### 6.7 Ask Orbitron AI
- Backend endpoint `POST /api/ai/chat`. LLM provider and key via environment variables on the backend only (never in frontend code).
- The request includes a **grounding context** built by the frontend: the selected planet record, computed habitability result, spectrum result, comparison and radiation outputs.
- System prompt rules: answer only from the supplied context and general well-established science; say "the data doesn't support that" when appropriate; never invent measurements; never present hypothetical scenarios as observed; suggest the next module to open.
- Without a key: a rule-based fallback (explain the planet's values, factors, missing data, and next step) with a visible **"Demo assistant"** label.
- Suggested prompt chips: "Explain this planet's data", "Why is confidence low?", "What does this spectrum show?", "What would a visit face?".

### 6.8 About / Sources
What Orbitron does and does not claim; data sources with links and retrieval date; limitations; glossary (exoplanet, habitable zone, equilibrium temperature, transmission spectrum, absorption band, dose, shielding, data completeness); team credits (editable placeholder); **Roadmap** (Settlement Planner, Future Simulator, 3D visualisation, accounts, validated radiation transport).

## 7. Should-have details (only after Section 2 must-haves pass)

- **Orbit sonification:** for a selected multi-planet system (e.g. TRAPPIST-1), Web Audio plays one pitch per planet mapped from orbital period (log scale), pulsing at relative orbital rates, with play/stop. Label **"Artistic sonification, not a recording"**.
- **Planet Passport:** a shareable card (name, host, key values, screening status, confidence, Earth comparison) exportable as PNG, labelled as a screening summary.

## 8. Architecture

**Frontend:** React + TypeScript + Vite, Tailwind, React Router, Recharts, Lucide React, Framer Motion (light use).
**Calculations (TypeScript, pure functions with Vitest tests):** habitability, comparison/derived values, radiation.
**Backend (FastAPI, kept minimal):**
- `GET /api/health`
- `GET /api/planets`, `GET /api/planets/{id}` (serve the snapshot; optional refresh)
- `POST /api/spectrum/analyze` (spectrum engine in Python)
- `POST /api/ai/chat`
- `GET /api/sources`

No database; the snapshot JSON is the data store.

**Suggested structure:**
```
orbitron/
  data/planets_snapshot.json
  scripts/fetch_planets.py
  backend/{main.py, spectrum_engine.py, ai_service.py, tests/}
  frontend/src/{pages, components, lib/{habitability,comparison,radiation}.ts, config/, tests/}
  assets/orbitron_visual_direction.png
  README.md   # exact run commands
```

## 9. Scientific integrity rules (mandatory)

- Real public sources where possible; store source name, URL, retrieval time, original units.
- Never fabricate or silently default a value. Show "Not available".
- Tag values as measured / derived / estimated / hypothetical / unknown.
- Keep limitations beside each result, not only on the About page.
- Habitable-zone position ≠ liquid water or life. Earth-like size or temperature ≠ Earth-like conditions.
- Exoplanet surface conditions and radiation environments are unknown; never imply otherwise.
- Detecting a gas ≠ detecting life.
- The screening index is illustrative, not an official classification.
- AI output must not override underlying data or calculations.

## 10. UX requirements

- Loading, error, empty and success states on every data-driven screen.
- Form validation with understandable errors; sensible defaults so the demo works immediately; **Reset** on calculators.
- Charts have axis labels, units and tooltips.
- No fake live counters, fake notifications, or dead buttons/toggles.
- Responsive; accessible contrast and keyboard focus.

## 11. Build order and checkpoints

1. **Foundation:** scaffold frontend + backend, design tokens, routing, sidebar, `/api/health` connectivity.
2. **Data:** `fetch_planets.py`, snapshot, Explorer, search/filter/sort, detail drawer, data-status badge.
3. **Analysis:** habitability engine + UI, Earth Comparison + Human Visit panel, unit tests.
4. **Spectrum Lab:** demo spectra, CSV upload, detection engine, chart, tests.
5. **Radiation Lab:** calculator, chart, references (verified only), reset, tests.
6. **AI:** grounded chat + labelled fallback.
7. **Mission Control + About/Sources**, then polish and responsive checks.
8. **Should-haves** (sonification, passport) only if everything above passes.

After each phase: run the app, exercise the screen, fix bugs before moving on.

**Unit-test anchors:** Earth inputs (M=1, R=1) must give g = 1, v_esc ≈ 11.19 km/s, ρ ≈ 5.51 g/cm³. A planet with all four habitability inputs missing must return "Insufficient data". Radiation output must change when duration, dose rate or shielding changes. A synthetic spectrum with a dip planted at 4.3 µm must be detected as CO₂ and a flat spectrum must produce no candidates.

## 12. Demo script (about 4 minutes, 5 steps)

1. **Mission Control:** pitch line; point to the data-status badge.
2. **Explorer → TRAPPIST-1 e:** show real catalogue values and a missing field; click "Analyze".
3. **Habitability:** index + confidence + "what we do not know".
4. **Spectrum Lab:** run the demo spectrum, watch features get flagged, then show the "gas ≠ life" notice.
5. **Earth Comparison + Radiation Lab:** gravity vs Earth, then change shielding and watch the dose change; close with Ask Orbitron AI explaining the limits.

## 13. Acceptance checklist

- [ ] App starts with documented commands (README).
- [ ] Frontend ↔ backend connected; app works with the bundled snapshot and no internet.
- [ ] Explorer search/filter/sort and detail drawer work; units, sources and missing values shown.
- [ ] Habitability shows factors, confidence, and "Insufficient data" when appropriate.
- [ ] Spectrum Lab detects planted features and shows the "gas ≠ life" notice.
- [ ] Earth Comparison works; Human Visit values match test anchors.
- [ ] Radiation Lab output changes with inputs; units and assumptions visible; Reset works.
- [ ] Ask Orbitron AI is grounded and labelled when running in fallback mode.
- [ ] All navigation and buttons work; responsive on mobile and desktop.
- [ ] The full demo script runs without a live API call.

## 14. Final instruction

Build **ORBITRON** as a cohesive, premium, science-focused app. Working end to end beats decorative. Do not stop at a landing page. Do not add out-of-scope features. When in doubt, label it, defer it, or leave it out rather than imply certainty the data does not support.
