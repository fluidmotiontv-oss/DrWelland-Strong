import * as Tone from 'tone';

class AudioService {
  private synth: Tone.PolySynth | null = null;
  private noise: Tone.Noise | null = null;
  private filter: Tone.AutoFilter | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    // 432Hz Base Frequency
    // Standard A4 is 440Hz. 432Hz is slightly lower.
    Tone.getContext().lookAhead = 0.1;
    
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 1
      }
    }).toDestination();

    // Harmonic pulse effects
    const reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.4
    }).toDestination();
    
    this.synth.connect(reverb);

    // "Skunky beats in the trees" - procedural rhythm
    // We'll use a noise synth for a crunchy, organic wood-block like sound
    this.filter = new Tone.AutoFilter("8n").start().toDestination();
    this.noise = new Tone.Noise("pink").connect(this.filter);
    
    // Procedural beat
    const drum = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" }
    }).toDestination();

    const hat = new Tone.MetalSynth({
      envelope: { attack: 0.01, decay: 0.1, release: 0.1 },
      modulationIndex: 32,
      resonance: 4000
    } as any).toDestination();

    const loop = new Tone.Loop(time => {
      drum.triggerAttackRelease("C1", "8n", time);
      if (Math.random() > 0.5) {
        hat.triggerAttackRelease("16n", time + 0.1);
      }
    }, "4n").start(0);

    Tone.Transport.bpm.value = 88; // Laid back "skunky" tempo
    
    this.isInitialized = true;
  }

  playNodePulse(frequency: number = 432) {
    if (!this.synth) return;
    this.synth.triggerAttackRelease(frequency, "4n");
  }

  playHarmonicChord() {
    if (!this.synth) return;
    // Harmonic series based on 432Hz
    const root = 432;
    const fifth = root * 1.5;
    const octave = root * 2;
    this.synth.triggerAttackRelease([root, fifth, octave], "2n");
  }

  startBackgroundAmbience() {
    if (!this.noise || !this.filter) return;
    // Low volume pink noise with auto-filter for "rustling trees" vibe
    this.noise.volume.value = -35;
    this.noise.start();
    Tone.Transport.start();
  }

  stopBackgroundAmbience() {
    if (this.noise) this.noise.stop();
    Tone.Transport.stop();
  }
}

export const audioService = new AudioService();
