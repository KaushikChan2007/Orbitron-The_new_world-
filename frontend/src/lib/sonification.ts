/**
 * Web Audio Orbit Sonification Engine for multi-planet systems (e.g. TRAPPIST-1).
 * Maps orbital periods to harmonic acoustic frequencies and triggers pulses
 * reflecting relative orbital resonance.
 * 
 * Artistic sonification, not an acoustic recording.
 */

export interface SystemPlanetOrbit {
  name: string;
  period_days: number;
  radius_earth: number;
}

export class OrbitSonifier {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalIds: number[] = [];
  private gainNode: GainNode | null = null;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSystem(planets: SystemPlanetOrbit[]) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.isPlaying = true;

    // Sort by orbital period ascending (closest to star has highest pitch and fastest tempo)
    const sorted = [...planets].sort((a, b) => a.period_days - b.period_days);
    const minPeriod = Math.max(0.1, sorted[0]?.period_days || 1.0);

    sorted.forEach((planet, index) => {
      // Map period (logarithmic) to musical frequency between 220 Hz and 880 Hz
      // Shorter period = higher pitch
      const freq = 660 / Math.pow(planet.period_days / minPeriod, 0.35);

      // Pulse rate in ms (scaled for real-time human listening: shortest orbit ~1.5s)
      const pulseIntervalMs = Math.min(6000, Math.max(800, 1500 * (planet.period_days / minPeriod)));

      // Trigger first note immediately, then recurring
      this.triggerTone(freq, 0.4);

      const intervalId = window.setInterval(() => {
        if (this.isPlaying) {
          this.triggerTone(freq, 0.35);
        }
      }, pulseIntervalMs);

      this.intervalIds.push(intervalId);
    });
  }

  private triggerTone(frequency: number, durationSec: number) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(env);
    env.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + durationSec + 0.1);
  }

  public stop() {
    this.isPlaying = false;
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const systemSonifier = new OrbitSonifier();
