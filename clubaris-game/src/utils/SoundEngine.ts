class SoundEngine {
  private ctx: AudioContext | null = null;
  private crowdNode: AudioBufferSourceNode | null = null;
  private crowdGain: GainNode | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext can only be created after a user gesture in most browsers
    // We will initialize it lazily when the first sound plays
  }

  private initCtx() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        this.isEnabled = false;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playWhistle() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // First short whistle
    this.playTone(2500, 'sine', 0.1, t);
    this.playTone(2000, 'sine', 0.1, t);

    // Main whistle
    this.playTone(2500, 'sine', 0.4, t + 0.15);
    this.playTone(2000, 'sine', 0.4, t + 0.15);
  }

  playFinalWhistle() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.playTone(2500, 'sine', 0.2, t);
    this.playTone(2500, 'sine', 0.2, t + 0.4);
    this.playTone(2500, 'sine', 0.8, t + 0.8);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    // Vibrato
    osc.frequency.linearRampToValueAtTime(freq + 100, startTime + duration / 2);
    osc.frequency.linearRampToValueAtTime(freq, startTime + duration);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
    gain.gain.setValueAtTime(0.5, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playKick() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Low punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);

    // Noise snap
    const noiseBuffer = this.createNoiseBuffer(0.1);
    if (!noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  playGoalCheer() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 4.0;
    const buffer = this.createNoiseBuffer(duration);
    if (!buffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(800, t + 1.0);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.5); // cheer swells up
    gain.gain.setValueAtTime(0.8, t + duration - 1.0);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(t);
  }

  playMissGroan() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 2.0;
    const buffer = this.createNoiseBuffer(duration);
    if (!buffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(300, t + 1.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.2); 
    gain.gain.linearRampToValueAtTime(0, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(t);
  }

  startCrowdAmbient() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    if (this.crowdNode) return; // already playing

    const duration = 10.0;
    const buffer = this.createNoiseBuffer(duration);
    if (!buffer) return;

    this.crowdNode = this.ctx.createBufferSource();
    this.crowdNode.buffer = buffer;
    this.crowdNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.crowdGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2.0); // fade in

    this.crowdNode.connect(filter);
    filter.connect(this.crowdGain);
    this.crowdGain.connect(this.ctx.destination);

    this.crowdNode.start();
  }

  stopCrowdAmbient() {
    if (this.crowdGain && this.ctx) {
        this.crowdGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0); // fade out
    }
    if (this.crowdNode) {
        setTimeout(() => {
            if (this.crowdNode) {
                try { this.crowdNode.stop(); } catch(e){}
                this.crowdNode = null;
            }
        }, 1000);
    }
  }
}

export const soundEngine = new SoundEngine();
