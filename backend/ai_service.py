"""
Grounded & Open-World AI Assistant Service for Orbitron.
Integrates Google Gemini / Gemma LLMs with an open-world reasoning prompt,
while providing a deterministic, scientifically rigorous fallback engine.
"""

import os
import re
import socket
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Ensure IPv4 resolution on Windows to avoid IPv6 socket timeouts
try:
    from urllib3.util import connection
    connection.allowed_gai_family = lambda: socket.AF_INET
except Exception:
    pass

def get_effective_gemini_key(user_key: Optional[str] = None) -> Optional[str]:
    """
    Resolve the active Gemini API key from explicit parameter,
    current environment, or by reloading the .env file if updated on disk.
    """
    if user_key and user_key.strip():
        return user_key.strip().strip('"').strip("'")

    key = os.getenv("GEMINI_API_KEY")
    if key and key.strip():
        return key.strip().strip('"').strip("'")

    # Dynamically check/reload .env in case user just saved their key
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        ".env"
    ]
    for p in env_paths:
        if os.path.exists(p):
            load_dotenv(dotenv_path=p, override=True)
            reloaded_key = os.getenv("GEMINI_API_KEY")
            if reloaded_key and reloaded_key.strip():
                return reloaded_key.strip().strip('"').strip("'")
    return None

SYSTEM_PROMPT = """You are the Orbitron Science & Astrophysics Intelligence Assistant, an advanced open-world scientific cognitive agent.
You possess deep multidisciplinary expertise across:
- Observational & Theoretical Astrophysics (exoplanet demographics, transit photometry, radial velocity, Doppler spectroscopy)
- Planetary Science & Climatology (habitable zone boundaries, runaway greenhouse effect, cloud feedback mechanisms, carbonate-silicate cycle)
- Astrobiology & Extremophile Microbiology (Deinococcus radiodurans, tardigrades, subsurface lithoautotrophic ecosystems, biosignature false positives)
- Radiobiology & Space Medicine (cosmic radiation dosimetry, DNA double-strand breaks, gamma-H2AX foci, cardiovascular fluid shifts, osteopenia)
- ECLSS & Space Habitat Engineering (closed-loop oxygen recycling, Sabatier reaction, regolith radiation shielding, water reclamation)
- General Physics & Science (general relativity, quantum mechanics, stellar nucleosynthesis, thermodynamic limits)

OPERATING DIRECTIVES:
1. OPEN-WORLD REASONING: Freely reason, compute, explain, and contrast ANY question the user asks, whether it concerns a specific exoplanet, Solar System planets (Uranus, Mars, Jupiter, Venus), general microbiology, molecular biology, human space physiology, theoretical physics, or philosophical inquiries.
2. EMPIRICAL HONESTY: Always distinguish empirically measured parameters from derived models or hypothetical conditions.
3. OUTPUT FORMAT: Respond directly with clear, structured markdown. Do NOT include meta-commentary, scratchpad drafts, or self-correction markers.
"""

def clean_llm_reply(text: str) -> str:
    """Strip internal chain-of-thought or draft scratchpads if present in output."""
    if not text:
        return ""
    # If there is a markdown header, slice from the header
    header_match = re.search(r'(#{1,4}\s+[^\n]+)', text)
    if header_match:
        return text[header_match.start():].strip()

    # If the text has bulleted draft paragraphs like "*   *Paragraph 1:"
    if "Paragraph 1" in text:
        idx = text.find("Paragraph 1")
        body = text[idx:]
        cleaned_lines = []
        for line in body.split("\n"):
            c = re.sub(r'^\s*[*+-]\s*', '', line).strip()
            c = re.sub(r'^\*+|\*+$', '', c).strip()
            if c:
                cleaned_lines.append(c)
        if cleaned_lines:
            return "\n\n".join(cleaned_lines)

    # If the response contains draft markers
    if "Draft 1:" in text or "Draft 2:" in text or "*Draft" in text:
        parts = re.split(r'\*?\s*\*?Draft\s*\d+\s*:?\*?', text)
        if len(parts) > 1:
            candidate = parts[-1].strip()
            candidate = re.split(r'\(Self-correction|\(Check|\*?\s*\*?Constraint', candidate)[0].strip()
            return candidate.strip("* ")

    # If text echoes "Direct Answer:"
    direct_match = re.search(r'(?:Direct Answer|Final Answer|Response):\s*(.*)', text, re.DOTALL | re.IGNORECASE)
    if direct_match:
        ans = direct_match.group(1).strip()
        ans = re.split(r'\(Self-correction|\(Check', ans)[0].strip()
        return ans.strip("* ")

    # Clean leading bullet metadata lines (User Question, Persona, Role, Constraint)
    lines = text.split("\n")
    filtered = []
    skipping = True
    for l in lines:
        stripped = l.strip()
        if skipping and any(stripped.startswith(k) for k in [
            "*   Question:", "*   Persona:", "*   Format:", "*   Constraint:",
            "*   Role:", "*   User:", "*   Target:", "*   Subject:"
        ]):
            continue
        skipping = False
        filtered.append(l)

    cleaned = "\n".join(filtered).strip()
    return cleaned if cleaned else text.strip()

def generate_fallback_response(message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate an intelligent, domain-rich scientific response when an external LLM
    API key is not configured or during offline operations.
    """
    planet = (context or {}).get("selected_planet", {})
    habitability = (context or {}).get("habitability", {})

    p_name = planet.get("pl_name", "TRAPPIST-1 e")
    host = planet.get("hostname", "its host star")
    rad = planet.get("pl_rade")
    mass = planet.get("pl_bmasse")
    eqt = planet.get("pl_eqt")
    insol = planet.get("pl_insol")
    dist = planet.get("sy_dist")

    msg_lower = message.lower()

    # Topic: Solar System Ice Giants (Uranus, Neptune)
    if "uranus" in msg_lower or "neptune" in msg_lower or "ice giant" in msg_lower:
        text = (
            "### Planetary Analysis: Human Habitation on Uranus & Ice Giants\n\n"
            "**Can humans inhabit Uranus?**\n"
            "**No, human habitation directly on Uranus is scientifically impossible with any foreseeable technology.**\n\n"
            "**Primary Biophysical & Engineering Barriers:**\n"
            "1. **Absence of a Solid Surface:** Uranus is an ice giant composed predominantly of a supercritical fluid mantle of water, ammonia, and methane ices over a small rocky silicate core. There is no terra firma to establish a surface settlement.\n"
            "2. **Crushing Atmospheric Pressures:** As you descend through the hydrogen-helium-methane atmosphere, barometric pressure rapidly escalates from 1 bar into thousands of bars, pulverizing any structural pressure vessel.\n"
            "3. **Cryogenic Temperatures:** Uranus records the lowest atmospheric temperatures in the Solar System, plunging to **-224 °C (49 K)** due to negligible internal thermal heat output.\n"
            "4. **Severe Insolation Deficit:** Orbiting at ~19.2 AU from Sol, Uranus receives less than **0.27% of Earth's solar irradiance**, rendering photovoltaic power generation unviable.\n\n"
            "**Potential Alternative:** Theoretical future exploration would rely strictly on subterranean bases on Uranus's large icy moons (such as **Titania**, **Oberon**, or **Ariel**), utilizing nuclear fission/fusion power and local water ice extraction."
        )

    # Topic: Microbiology & Extremophiles
    elif any(k in msg_lower for k in ["microbio", "bacteria", "extremophile", "deinococcus", "tardigrade", "organism", "cellular"]):
        text = (
            "### Astrobiology & Microbiology in Extreme Space Environments\n\n"
            "**Key Biological Model Organisms:**\n"
            "- ***Deinococcus radiodurans*:** An extremophilic bacterium capable of surviving acute gamma radiation doses exceeding **5,000 Gy (500,000 rads)** with no loss of viability. It accomplishes this through an extraordinary multi-copy genome architecture and an ultrarapid RecA-dependent double-strand break (DSB) DNA repair system.\n"
            "- ***Chroococcidiopsis* (Cyanobacteria):** Capable of surviving inside endolithic microhabitats under high UV fluxes and desiccation, serving as an analogue for potential Martian or exoplanetary surface organisms.\n"
            "- **Tardigrades (Panarthropoda):** Enter reversible cryptobiosis (anhydrobiosis), expressing unique damage suppressor (Dsup) proteins that physically associate with chromatin to protect DNA against hydroxyl radical attacks caused by cosmic radiation.\n\n"
            "**Takeaway for Exoplanet Habitability:**\n"
            "Microbial life can endure ionizing environments and thermodynamic extremes far broader than human physiology can tolerate, suggesting that biosignatures may persist on worlds unsuitable for unshielded human exploration."
        )

    # Topic: DNA Damage & Radiobiology
    elif any(k in msg_lower for k in ["dna", "radiation", "double-strand", "dsb", "repair", "mutation", "mgy", "msv"]):
        text = (
            "### Radiobiology & Molecular DNA Strand Dynamics\n\n"
            "**1. Radiation Track Structure & Damage Topology:**\n"
            "- High-Linear Energy Transfer (LET) galactic cosmic rays (HZE ions like $^{56}\\text{Fe}$) create densely ionizing core tracks. Unlike sparsely ionizing medical X-rays, HZE particles produce complex, clustered DNA lesions within 1–2 helical turns.\n"
            "- A single unshielded cosmic radiation transit through a cell nucleus produces multiple localized double-strand breaks (DSBs), measured experimentally by **$\\gamma$-H2AX phosphorylation foci** (Rothkamm & Löbrich, 2003).\n\n"
            "**2. Cellular Repair Pathways:**\n"
            "- **Non-Homologous End Joining (NHEJ):** The dominant fast repair pathway in human cells; prone to small deletions and genomic rearrangements.\n"
            "- **Homologous Recombination (HR):** High-fidelity template-directed repair, restricted primarily to late S/G2 cell cycle phases.\n\n"
            "**Dosimetric Threshold:** In deep space transit without geomagnetic protection, astronauts face ~0.5 to 1.8 mSv/day, accumulating permissible career radiation limits within single multi-year exploration missions."
        )

    # Topic: Cloud Feedback & Habitable Zone (Mikko Tuomi et al. 2013 / Kopparapu 2013)
    elif any(k in msg_lower for k in ["cloud", "tuomi", "feedback", "habitable zone", "hz", "kopparapu", "albedo"]):
        text = (
            "### Cloud Feedback & Circumstellar Habitable Zone Dynamics\n\n"
            "**Astrophysical Framework (Mikko Tuomi et al. 2013 & Kopparapu et al. 2013):**\n"
            "- **Inner Boundary (Runaway Greenhouse):** Without clouds, a terrestrial world reaches the water-loss and runaway greenhouse threshold at ~0.95–1.04 AU around a solar-type star ($S_{\\text{eff}} \\approx 1.06 S_\\oplus$).\n"
            "- **100% Water Cloud Coverage:** Dense dayside water clouds increase the planet's Bond albedo ($A_B$), reflecting incident stellar irradiance back to space. This shifts the habitable zone inner edge significantly closer to the star (~0.55–0.72 AU in the Solar System, or inward to the orbit of HD 40307 g around K-type stars).\n"
            "- **Outer Boundary (Maximum Greenhouse):** Around 1.67 AU (Sol), $\\text{CO}_2$ condensation begins. Beyond this, $\\text{CO}_2$ ice clouds reflect solar radiation faster than they trap thermal infrared, terminating greenhouse warming.\n\n"
            "**Current Research Implication:** Planets previously discounted as 'too close' to their host star may harbor liquid water if persistent convective cloud decks cover their sub-stellar points."
        )

    # Topic: Specific Planet Overview
    elif any(k in msg_lower for k in ["trappist", "kepler", "proxima", "toi", "lhs"]):
        text = (
            f"### Empirical Telemetry Profile: **{p_name}**\n\n"
            f"- **Host Star:** {host} at distance {round(dist, 1) if dist else 'N/A'} parsecs.\n"
            f"- **Physical Dimensions:** Radius: {f'{rad} R⊕' if rad else 'Not measured'}, Mass: {f'{mass} M⊕' if mass else 'Not measured'}.\n"
            f"- **Insolation Flux:** {f'{insol} S⊕ (Earth = 1.0)' if insol else 'Not available'}.\n"
            f"- **Equilibrium Temperature:** {f'{eqt} K' if eqt else 'Not available'} (zero Bond albedo assumption).\n"
            f"- **Rocky Probability:** {('High (R < 1.6 R⊕, Rogers 2015)' if rad and rad <= 1.6 else 'Volatile/Gas rich envelope likely') if rad else 'Indeterminate'}.\n\n"
            "**Exploration Recommendation:** Navigate to **Habitability Analysis** to review how this world aligns along the Tuomi et al. cloud feedback ruler."
        )

    # General Open-World Scientific Inquiry
    else:
        text = (
            f"### Orbitron Open-World Scientific Analysis\n\n"
            f"**Inquiry:** *\"{message}\"*\n\n"
            "Orbitron connects real NASA exoplanet composite telemetry with radiobiological research and space exploration physics.\n\n"
            "**Key Considerations for this Topic:**\n"
            "- **Astrobiological Limits:** Surface habitability requires thermodynamic stability for liquid water, barometric atmospheric retention, and tolerable ionizing radiation fluxes.\n"
            "- **Interdisciplinary Cross-Links:** Astrophysical discoveries directly dictate biological limits—stellar flare frequency determines DNA lesion induction rates, and planetary surface gravity governs cardiovascular fluid shifts.\n\n"
            "> *Tip: Your `GEMINI_API_KEY` is loaded. If an external model is rate-limited, Orbitron automatically provides this grounded empirical synthesis.*"
        )

    return {
        "reply": text,
        "mode": "fallback",
        "model": "Orbitron Grounded Science Engine (Deterministic)",
        "grounding_sources": [
            "NASA Exoplanet Archive (Composite Parameters pscomppars)",
            "Mikko Tuomi et al. (2013) Habitable-zone super-Earths & Cloud Feedback",
            "Kopparapu et al. (2013) Astrophysical Journal 765:131",
            "Rothkamm & Löbrich (2003) PNAS 100:5057 (DNA Double-Strand Breaks)",
            "Rogers (2015) Astrophysical Journal 801:41 (Rocky Planet Thresholds)"
        ]
    }

def chat_with_orbitron(
    message: str,
    context: Optional[Dict[str, Any]] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Handle user query with open-world reasoning. If an API key is in .env or passed,
    calls Google Generative Language models with open-world instructions.
    """
    effective_key = get_effective_gemini_key(api_key)

    if not effective_key:
        return generate_fallback_response(message, context)

    # Candidate models ordered by verified availability and response speed on user keys
    candidate_models = [
        "gemma-4-26b-a4b-it",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemma-4-31b-it",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    for model_name in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={effective_key}"
            prompt_content = (
                f"{SYSTEM_PROMPT}\n\n"
                f"[Active Application Context]: {context}\n\n"
                f"[User Inquiry]: {message}\n\n"
                f"Please provide your direct scientific response in clean markdown:"
            )
            is_fast = "gemma" in model_name
            payload = {
                "contents": [{"parts": [{"text": prompt_content}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 350 if is_fast else 500
                }
            }
            resp = requests.post(url, json=payload, timeout=18 if is_fast else 15)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        cleaned = clean_llm_reply(parts[0]["text"])
                        if cleaned:
                            return {
                                "reply": cleaned,
                                "mode": "live_llm",
                                "model": f"Google AI Engine ({model_name})",
                                "grounding_sources": [
                                    "Google Generative Language Model",
                                    "NASA Exoplanet Archive Composite Data",
                                    "Orbitron Active Telemetry Buffer"
                                ]
                            }
            elif resp.status_code == 429:
                print(f"Model {model_name} rate limited (429), trying next candidate...")
                continue
            elif resp.status_code == 404:
                # Model not enabled on this specific key tier, try next
                continue
            else:
                print(f"Model {model_name} returned status {resp.status_code}")
        except Exception as e:
            print(f"Error querying {model_name}: {e}")
            continue

    return generate_fallback_response(message, context)

def generate_comparative_differentiator_insights(
    planets: List[Dict[str, Any]],
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesize deep comparative differentiators between Earth and a set of exoplanets.
    """
    effective_key = get_effective_gemini_key(api_key)
    planet_names = [p.get("pl_name", "Unknown") for p in planets]

    candidate_models = [
        "gemma-4-26b-a4b-it",
        "gemini-3.8-flash",
        "gemini-flash-latest"
    ]

    if effective_key:
        for model_name in candidate_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={effective_key}"
                prompt = (
                    f"You are the Orbitron Chief Astrobiologist and Planetary Scientist. "
                    f"Perform a comprehensive comparative differentiator analysis comparing Earth (Sol III) with the following target exoplanets: {', '.join(planet_names)}.\n\n"
                    f"Dataset Context:\n{planets}\n\n"
                    f"Please structure your differentiator analysis with:\n"
                    f"1. Executive Summary & Core Divergences\n"
                    f"2. Physical & Bulk Composition Differentiators (Mass, Radius, Density, Rogers 2015 rocky threshold)\n"
                    f"3. Stellar Radiation & Habitable Zone Dynamics (Kopparapu 2013 & Tuomi 2013 cloud feedback boundaries)\n"
                    f"4. Human Gravitational & Biological Adaptation Feasibility (Cardiovascular, Osteopenia, GCR dose)\n"
                    f"5. Key Scientific Unknowns & Required Future Telescope Observations"
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800}
                }
                resp = requests.post(url, json=payload, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        cleaned = clean_llm_reply(text)
                        if cleaned:
                            return {
                                "source": f"Google AI Engine ({model_name} - Live Synthesis)",
                                "insights_markdown": cleaned
                            }
            except Exception as e:
                print(f"Synthesis error with {model_name}: {e}")

    # Deterministic high-level scientific fallback differentiator
    sections = [
        f"### Orbitron Comparative Differentiator Briefing: Earth vs {', '.join(planet_names)}",
        "",
        "#### 1. Core Physical Divergence & Composition",
        "Terrestrial Earth maintains a 1.00 R⊕ and 1.00 M⊕ baseline with mean uncompressed silicate/iron density of 5.51 g/cm³. By comparison:",
    ]
    for p in planets:
        r = p.get("pl_rade")
        m = p.get("pl_bmasse")
        name = p.get("pl_name")
        is_rocky = r and r <= 1.6
        sections.append(
            f"- **{name}:** Radius {f'{r} R⊕' if r else 'N/A'}, Mass {f'{m} M⊕' if m else 'N/A'}. "
            f"Classified as {'Rocky Super-Earth (Rogers 2015 threshold)' if is_rocky else 'Volatile/Sub-Neptune envelope likely'}. "
            f"{'Surface gravitational pull is comparable to Earth.' if r and m and 0.8 <= (m/(r*r)) <= 1.25 else 'Significant gravitational divergence from Earth baseline.'}"
        )

    sections.extend([
        "",
        "#### 2. Habitable Zone & Cloud Feedback Differentiators (Tuomi et al. / Kopparapu et al.)",
        "- **Earth:** Occupies 1.00 AU inside Sol's conservative habitable zone with ~50% global cloud fraction maintaining liquid oceans.",
        "- **Exoplanet Targets:** Stellar flux and equilibrium temperatures depend heavily on host star spectral type (M-dwarfs emit high EUV and flare fluxes; G-dwarfs provide stable visible continua). Cloud feedback can expand inner habitability limits inward.",
        "",
        "#### 3. Human Biomedical Trade-Offs",
        "- **Fluid Hydrostatics:** Worlds with surface gravity >1.2g induce increased ventricular preload and peripheral edema.",
        "- **Radiation Exposure:** In the absence of an intrinsic dipolar geodynamo and thick barometric atmosphere (~101 kPa), cosmic ray equivalent doses can exceed 1.0 mSv/day.",
        "",
        "> *Tip: Add your `GEMINI_API_KEY` in `.env` to generate customized multi-model reasoning briefings on demand.*"
    ])

    return {
        "source": "Orbitron Deterministic Comparative Engine",
        "insights_markdown": "\n".join(sections)
    }
