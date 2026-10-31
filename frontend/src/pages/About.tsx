import React from 'react';
import {
  Info,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface AboutProps {
  retrievedAt?: string;
}

export const About: React.FC<AboutProps> = ({ retrievedAt = '2026-10-31' }) => {
  const glossary = [
    {
      term: 'Exoplanet (Extrasolar Planet)',
      definition: 'A planet situated outside our Solar System orbiting another star, stellar remnant, or brown dwarf.'
    },
    {
      term: 'Circumstellar Habitable Zone (HZ)',
      definition: 'The orbital distance range around a host star where an Earth-like planet with an atmosphere could support liquid surface water (Kopparapu et al. 2013).'
    },
    {
      term: 'Planetary Equilibrium Temperature (Teq)',
      definition: 'The theoretical temperature of a planet calculated assuming pure blackbody radiative equilibrium with its host star, typically calculated assuming Bond albedo = 0 and uniform heat redistribution.'
    },
    {
      term: 'Transmission Spectroscopy',
      definition: 'An observational technique measuring the slight variation in apparent transit depth as starlight filters through an exoplanet’s upper atmospheric annulus at discrete wavelengths.'
    },
    {
      term: 'Molecular Absorption Band',
      definition: 'A characteristic spectral fingerprint where specific molecules (e.g. CO₂ at 4.3 µm, H₂O at 1.4 & 2.7 µm, CH₄ at 2.3 & 3.3 µm) absorb electromagnetic photons.'
    },
    {
      term: 'Equivalent Dose (mSv)',
      definition: 'A measure of radiation dose that weights the absorbed physical energy (Gy) by the biological effectiveness of different radiation types (e.g. gamma rays vs. heavy cosmic ions).'
    },
    {
      term: 'γ-H2AX Foci',
      definition: 'Phosphorylated histone variant molecules that assemble rapidly at sites of DNA double-strand breaks (DSBs), serving as a standard quantitative biomarker for cellular ionizing radiation stress.'
    },
    {
      term: 'Data Completeness',
      definition: 'The percentage of diagnostic parameters (radius, mass, period, temperature, flux, distance, stellar temperature) empirically verified in the NASA Exoplanet Archive.'
    }
  ];

  const citations = [
    {
      title: 'NASA Exoplanet Archive (pscomppars)',
      ref: 'Akeson et al. (2013) PASP 125, 989.',
      url: 'https://exoplanetarchive.ipac.caltech.edu/'
    },
    {
      title: 'Habitable Zones around Main-Sequence Stars',
      ref: 'Kopparapu, R. K., et al. (2013), Astrophysical Journal, 765:131.',
      url: 'https://doi.org/10.1088/0004-637X/765/2/131'
    },
    {
      title: 'Most 1.6 Earth-radius Planets are not Rocky',
      ref: 'Rogers, L. A. (2015), Astrophysical Journal, 801:41.',
      url: 'https://doi.org/10.1088/0004-637X/801/1/41'
    },
    {
      title: 'Identification of Carbon Dioxide in an Exoplanet Atmosphere (JWST)',
      ref: 'JWST Transiting Exoplanet Community Early Release Science Team (Rustamkulov et al., Nature 2023).',
      url: 'https://doi.org/10.1038/s41586-022-05269-w'
    },
    {
      title: 'Measurements of Energetic Particle Radiation on Mars (MSL RAD)',
      ref: 'Zeitlin, C. et al. (2013) Science 340, 1080; Hassler et al. (2014) Science 343.',
      url: 'https://doi.org/10.1126/science.1235989'
    },
    {
      title: 'Evidence for a Lack of DNA Double-Strand Break Repair in Irradiation of Human Fibroblasts',
      ref: 'Rothkamm, K. & Löbrich, M. (2003) Proc. Natl. Acad. Sci. USA 100:5057.',
      url: 'https://doi.org/10.1073/pnas.0830918100'
    }
  ];

  const roadmapItems = [
    {
      title: 'Settlement Planner & Closed-Loop ECLSS Mass-Balance Simulator',
      phase: 'Phase 3 Roadmap',
      desc: 'Simulating life support consumables, oxygen recycling, hydroponic biological yields, and wastewater purification loops.'
    },
    {
      title: 'Future Planetary Resource & In-Situ Resource Utilization (ISRU)',
      phase: 'Phase 3 Roadmap',
      desc: 'Sabatier methanation reactors, regolith water extraction, and atmospheric CO₂ cracking.'
    },
    {
      title: 'Interactive 3D Volumetric Planet & Magnetosphere Visualizer',
      phase: 'Phase 4 Roadmap',
      desc: 'Real-time WebGL rendering of planetary magnetospheres, day/night terminators, and stellar wind shock fronts.'
    },
    {
      title: 'Full Monte-Carlo Radiation Transport (GEANT4 / HZETRN)',
      phase: 'Phase 4 Roadmap',
      desc: 'Microdosimetric track-structure modeling for high-Z cosmic ions passing through biological tissue.'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16 text-white font-sans">
      {/* Header */}
      <div className="p-6 rounded-[24px] glass-panel space-y-3 font-mono">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-white" />
          <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
            ABOUT ORBITRON & SCIENTIFIC SOURCES
          </h1>
        </div>
        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
          ORBITRON is an exoplanet intelligence and laboratory analytics platform engineered for rigorous educational exploration.
          We distinguish verified astronomical measurements from derived mechanics and theoretical models.
        </p>
      </div>

      {/* What Orbitron Claims vs Does NOT Claim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[24px] glass-panel space-y-3 font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>What Orbitron Does</span>
          </h3>
          <ul className="space-y-2 text-xs text-neutral-300 font-sans leading-relaxed list-disc list-inside">
            <li>Curates verified physical parameters from the NASA Exoplanet Archive composite table.</li>
            <li>Calculates transparent, reproducible screening indices based on peer-reviewed astrophysical models.</li>
            <li>Detects statistically significant transmission absorption features using signal processing.</li>
            <li>Translates raw astrophysical data into human-comprehensible mechanical and radiobiological metrics.</li>
            <li>Demarcates data values into Measured, Derived, Estimated, Hypothetical, and Unknown tags.</li>
          </ul>
        </div>

        <div className="p-6 rounded-[24px] glass-panel space-y-3 font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>What Orbitron Never Claims</span>
          </h3>
          <ul className="space-y-2 text-xs text-neutral-300 font-sans leading-relaxed list-disc list-inside">
            <li>Never claims any exoplanet is confirmed to have surface liquid water or an atmosphere without direct proof.</li>
            <li>Never outputs a speculative "probability of life" or claims an exoplanet is inhabited.</li>
            <li>Never converts atmospheric gas detections (CO₂, CH₄) into biological proof.</li>
            <li>Never claims a world is safe for human visitation; surface radiation and weather are unknown.</li>
            <li>Never fabricates missing values; shows "Not available" when archive fields are absent.</li>
          </ul>
        </div>
      </div>

      {/* Scientific Citations & Data Provenance */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase">PEER-REVIEWED SCIENTIFIC SOURCES</h3>
            <p className="text-xs text-neutral-400 font-sans">All algorithms and baselines follow published literature.</p>
          </div>
          <span className="text-[10px] text-white bg-white/10 px-2.5 py-1 rounded border border-white/20 uppercase font-bold">
            Snapshot: {retrievedAt.split('T')[0]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {citations.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-black border border-white/10 hover:border-white transition-all flex flex-col justify-between space-y-1.5 group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-white group-hover:underline">
                  {c.title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white shrink-0" />
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">{c.ref}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
        <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase">
          <BookOpen className="w-5 h-5 text-white" />
          <span>ASTROPHYSICAL & RADIOBIOLOGICAL GLOSSARY</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
          {glossary.map((g, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
              <h4 className="font-mono font-bold text-white text-xs">{g.term}</h4>
              <p className="text-neutral-300 text-[11px] leading-relaxed">{g.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Roadmap */}
      <div className="p-6 rounded-[24px] glass-panel space-y-4 font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-white" />
          <h3 className="text-base font-bold text-white uppercase">ORBITRON FUTURE ROADMAP</h3>
        </div>
        <p className="text-xs text-neutral-400 font-sans">
          Advanced modules planned for subsequent phases (deliberately out of scope for the core screening prototype).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {roadmapItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">{item.title}</h4>
                <span className="text-[10px] text-neutral-400 uppercase">{item.phase}</span>
              </div>
              <p className="text-[11px] font-sans text-neutral-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="p-5 rounded-2xl bg-black border border-white/10 text-center text-xs font-mono text-neutral-400 space-y-1">
        <div className="text-white font-bold">ORBITRON — Built for Graviton Hackathon (Space Theme)</div>
        <div className="text-[11px] text-neutral-400">
          Powered by NASA Exoplanet Archive, FastAPI, React, TypeScript, and SciPy.
        </div>
      </div>
    </div>
  );
};