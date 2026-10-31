class AudioSirenService {
  private audioCtx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenInterval: any = null;
  private isPlaying = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startSiren() {
    if (this.isPlaying) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.sirenOsc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.85, this.audioCtx.currentTime);

      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      let freq = 800;
      let rising = true;
      this.sirenInterval = setInterval(() => {
        if (!this.isPlaying || !this.sirenOsc || !this.audioCtx) return;
        if (rising) {
          freq += 35;
          if (freq >= 1300) rising = false;
        } else {
          freq -= 35;
          if (freq <= 800) rising = true;
        }
        try {
          this.sirenOsc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        } catch {
          // ignore context state errors
        }
      }, 30);

      this.sirenOsc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      this.sirenOsc.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio siren start error:', e);
    }
  }

  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // cleanup ignore
      }
      this.sirenOsc = null;
    }
    this.isPlaying = false;
  }

  playChirp(success = true) {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(success ? 880 : 440, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch {
      // Audio not permitted yet
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioSiren = new AudioSirenService();

