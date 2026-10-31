import React, { useState } from 'react';
import {
  Home,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Wind,
  Apple,
  Shield,
  Zap,
  RotateCcw
} from 'lucide-react';
import habitatConfig from '../config/habitat.json';

interface SettlementProps {
  onNavigate: (view: string) => void;
}

export const Settlement: React.FC<SettlementProps> = ({ onNavigate }) => {
  const [crewSize, setCrewSize] = useState(6);
  const [missionDays, setMissionDays] = useState(500);
  const [useClosedLoop, setUseClosedLoop] = useState(true);

  // Consumables mass balance (NASA BVAD Baseline Values for Exploration Life Support)
  const totalPersonDays = crewSize * missionDays;
  const rawO2Kg = Math.round(totalPersonDays * habitatConfig.consumables_per_person_day_kg.oxygen);
  const rawWaterKg = Math.round(totalPersonDays * habitatConfig.consumables_per_person_day_kg.drinking_food_water);
  const rawFoodKg = Math.round(totalPersonDays * habitatConfig.consumables_per_person_day_kg.dry_food);

  // ECLSS closed-loop mass reduction
  const effectiveO2Kg = useClosedLoop ? Math.round(rawO2Kg * (1 - habitatConfig.recovery_efficiencies.oxygen_recovery_pct / 100)) : rawO2Kg;
  const effectiveWaterKg = useClosedLoop ? Math.round(rawWaterKg * (1 - habitatConfig.recovery_efficiencies.water_recovery_pct / 100)) : rawWaterKg;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1520px] mx-auto text-white font-sans">
      {/* Header */}
      <div className="p-5 rounded-[24px] glass-panel flex flex-wrap items-center justify-between gap-4 font-mono">
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
            SURFACE EXPLORATION & LIFE SUPPORT ARCHITECTURE
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-white" />
            <span>SETTLEMENT HABITAT NEEDS ESTIMATOR</span>
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/20 text-xs text-neutral-300">
          <span>NASA BVAD Standards (TP-2015-218570)</span>
        </div>
      </div>

      {/* Dome Colony Hero Banner */}
      <div className="relative h-64 sm:h-80 rounded-[28px] overflow-hidden border border-white/20 shadow-2xl bg-black">
        <img
          src="/assets/habitat.jpg"
          alt="Surface Bio-Dome Settlement Architecture"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

        <div className="absolute bottom-6 left-6 z-10 max-w-xl space-y-1 font-mono">
          <span className="text-[10px] text-neutral-300 uppercase font-bold tracking-wider">
            CLOSED-LOOP ECLSS HABITAT CONCEPT
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Planetary Surface Settlement Model
          </h2>
          <p className="text-xs text-neutral-300 font-sans">
            Concept needs estimator, not an engineering design. Closed-loop life support balancing atmospheric pressure, water purification recycling, and caloric replenishment.
          </p>
          <div className="text-[9px] text-neutral-400 pt-1">
            Artistic representation • Grounded in NASA exploration metrics
          </div>
        </div>
      </div>

      {/* Grid: Estimator Controls (Left) & Consumables Budget (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Controls (Cols 1-4) */}
        <div className="lg:col-span-4 p-5 rounded-[22px] glass-panel space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              MISSION PROFILE PARAMETERS
            </span>
            <button
              onClick={() => {
                setCrewSize(6);
                setMissionDays(500);
                setUseClosedLoop(true);
              }}
              className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Crew Size:</span>
              <span className="text-white font-bold">{crewSize} crew members</span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              value={crewSize}
              onChange={(e) => setCrewSize(parseInt(e.target.value) || 6)}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>2 crew</span>
              <span>6 (Standard)</span>
              <span>24 crew</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Surface Stay Duration:</span>
              <span className="text-white font-bold">{missionDays} days</span>
            </div>
            <input
              type="range"
              min={30}
              max={1500}
              step={10}
              value={missionDays}
              onChange={(e) => setMissionDays(parseInt(e.target.value) || 500)}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>30 d</span>
              <span>500 d (Conjunction)</span>
              <span>1500 d</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
              <input
                type="checkbox"
                checked={useClosedLoop}
                onChange={(e) => setUseClosedLoop(e.target.checked)}
                className="accent-white w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-bold">Enable ECLSS Catalytic Recycling Loop</span>
            </label>
            <p className="text-[10px] text-neutral-400 mt-1 font-sans">
              {useClosedLoop
                ? 'Sabatier catalytic reactor + UPA distillation (98% water recovery, 85% oxygen loop enabled).'
                : 'Open-loop consumable expendables (massive launch payload mass penalty).'}
            </p>
          </div>
        </div>

        {/* Consumables Results (Cols 5-12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-[22px] glass-panel space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ESTIMATED MASS-BALANCE CONSUMABLES
              </span>
              <span className="text-[10px] text-neutral-300">
                {totalPersonDays.toLocaleString()} Person-Days Total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-white">
                  <Wind className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold">Oxygen Supply</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {effectiveO2Kg.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {useClosedLoop ? 'After 85% Sabatier catalytic loop' : 'Unrecycled direct mass'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-white">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold">Hydration Water</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {effectiveWaterKg.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {useClosedLoop ? 'After 98% catalytic UPA loop' : 'Unrecycled direct mass'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-white">
                  <Apple className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold">Caloric Nutrition</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {rawFoodKg.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Dry stable rations (0.62 kg/person/day)
                </div>
              </div>
            </div>
          </div>

          {/* Subsystems Readiness Checklist */}
          <div className="p-5 rounded-[22px] glass-panel space-y-3 text-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              SURFACE ARCHITECTURE SUB-SYSTEM CHECKLIST
            </span>
            <div className="space-y-2">
              {habitatConfig.subsystem_checklist.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3 text-[11px]">
                  <div className="space-y-0.5">
                    <div className="text-white font-bold">{item.name}</div>
                    <div className="text-neutral-300 font-sans">{item.required}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold bg-white text-black shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};