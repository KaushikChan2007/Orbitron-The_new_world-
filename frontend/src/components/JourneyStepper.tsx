import React from 'react';
import { Compass, Activity, LineChart, SplitSquareVertical, ShieldCheck, ChevronRight } from 'lucide-react';

export type JourneyStep = 'discover' | 'analyze' | 'detect' | 'compare' | 'protect';

interface JourneyStepperProps {
  currentStep: JourneyStep;
  onNavigate: (step: JourneyStep) => void;
  selectedPlanetName?: string;
}

const STEPS: { id: JourneyStep; label: string; icon: React.ElementType }[] = [
  { id: 'discover', label: '1. Discover', icon: Compass },
  { id: 'analyze', label: '2. Analyze', icon: Activity },
  { id: 'detect', label: '3. Detect', icon: LineChart },
  { id: 'compare', label: '4. Compare', icon: SplitSquareVertical },
  { id: 'protect', label: '5. Protect', icon: ShieldCheck },
];

export const JourneyStepper: React.FC<JourneyStepperProps> = ({
  currentStep,
  onNavigate,
  selectedPlanetName
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-cyan-400 font-semibold tracking-wider uppercase text-[11px]">Scientific Journey:</span>
        {selectedPlanetName && (
          <span className="text-slate-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded text-[11px]">
            Target: <strong className="text-white">{selectedPlanetName}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-xs">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onNavigate(step.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-xs">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
