// Starfleet Biometric Text-to-Speech (TTS) Voice Telemetry Service

export interface TTSAnnouncementOptions {
  pitch?: number; // 0.5 to 2.0 (default 1.0)
  rate?: number; // 0.5 to 2.0 (default 1.0)
  volume?: number; // 0.0 to 1.0 (default 1.0)
  voiceName?: string;
  prefixChime?: boolean;
}

const TTS_STORAGE_KEY = 'dr_welland_tts_enabled';
const TTS_VOLUME_KEY = 'dr_welland_tts_volume';
const TTS_RATE_KEY = 'dr_welland_tts_rate';

class TTSAnnouncerService {
  private isEnabled: boolean = true;
  private volume: number = 0.9;
  private rate: number = 1.0;
  private pitch: number = 1.05; // Slightly elevated futuristic tone
  private lastAnnouncedPhrases: Map<string, number> = new Map();
  private cooldownMs: number = 8000; // 8 seconds cooldown per unique alert phrase
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
      }
    }
  }

  private loadSettings() {
    try {
      const savedEnabled = localStorage.getItem(TTS_STORAGE_KEY);
      if (savedEnabled !== null) {
        this.isEnabled = JSON.parse(savedEnabled);
      }
      const savedVol = localStorage.getItem(TTS_VOLUME_KEY);
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
      const savedRate = localStorage.getItem(TTS_RATE_KEY);
      if (savedRate !== null) {
        this.rate = parseFloat(savedRate);
      }
    } catch (e) {
      console.error('Failed to load TTS settings:', e);
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem(TTS_STORAGE_KEY, JSON.stringify(this.isEnabled));
      localStorage.setItem(TTS_VOLUME_KEY, this.volume.toString());
      localStorage.setItem(TTS_RATE_KEY, this.rate.toString());
    } catch (e) {
      console.error('Failed to save TTS settings:', e);
    }
  }

  private populateVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveSettings();
    if (!enabled) {
      this.stop();
    }
  }

  public toggleEnabled(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
    this.saveSettings();
  }

  // Plays a Starfleet medical telemetry alert chime using Web Audio API
  public playAlertChime(severity: 'critical' | 'warning' | 'info' = 'warning') {
    if (typeof window === 'undefined' || !this.isEnabled || this.volume === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (severity === 'critical' ? 0.6 : 0.4));

      if (severity === 'critical') {
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.setValueAtTime(1760, now + 0.15); // A6 double pulse
        osc2.frequency.setValueAtTime(440, now);
      } else if (severity === 'warning') {
        osc1.frequency.setValueAtTime(528, now); // 528 Hz Solfeggio chime
        osc1.frequency.setValueAtTime(741, now + 0.12);
        osc2.frequency.setValueAtTime(264, now);
      } else {
        osc1.frequency.setValueAtTime(432, now); // 432 Hz gentle chime
        osc2.frequency.setValueAtTime(216, now);
      }

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('AudioContext chime failed:', e);
    }
  }

  // Core Speech Synthesis Method
  public speak(
    phrase: string,
    options: TTSAnnouncementOptions = {}
  ): boolean {
    if (!this.isSupported() || !this.isEnabled) return false;

    // Sanitize phrase
    const text = phrase.trim();
    if (!text) return false;

    // Check cooldown to avoid continuous repetitive speech loop
    const now = Date.now();
    const lastTime = this.lastAnnouncedPhrases.get(text);
    if (lastTime && now - lastTime < this.cooldownMs) {
      return false; // Skip redundant alert
    }

    this.lastAnnouncedPhrases.set(text, now);

    // Stop ongoing speech before announcing critical alert
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (options.prefixChime !== false) {
      this.playAlertChime(
        text.toLowerCase().includes('critical') || text.toLowerCase().includes('tachycardia')
          ? 'critical'
          : 'warning'
      );
    }

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = options.volume ?? this.volume;
        utterance.rate = options.rate ?? this.rate;
        utterance.pitch = options.pitch ?? this.pitch;

        // Select best voice if available
        const avail = this.getAvailableVoices();
        let chosenVoice = null;

        if (options.voiceName) {
          chosenVoice = avail.find((v) => v.name === options.voiceName);
        }

        if (!chosenVoice) {
          // Prefer clear English voices
          chosenVoice =
            avail.find((v) => v.name.includes('Google UK English Female') || v.name.includes('Google UK English Male')) ||
            avail.find((v) => v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Daniel')) ||
            avail.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
            avail[0] ||
            null;
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('SpeechSynthesis error:', err);
      }
    }, 150);

    return true;
  }

  // Announces critical biometric status updates
  public announceAlert(
    title: string,
    message: string,
    severity: 'critical' | 'warning' | 'info' = 'warning'
  ): void {
    if (!this.isEnabled) return;

    let spokenHeader = 'Starfleet Medical Telemetry.';
    if (severity === 'critical') {
      spokenHeader = 'Warning! Critical Biometric Deviation Detected.';
    } else if (severity === 'warning') {
      spokenHeader = 'Attention! Biometric Alert.';
    }

    // Clean text for natural speech pronunciation
    const cleanTitle = title.replace(/\/\//g, ' ').replace(/BPM/gi, 'beats per minute').replace(/SpO2/gi, 'oxygen saturation');
    const cleanMsg = message.replace(/\/\//g, ' ').replace(/BPM/gi, 'beats per minute').replace(/SpO2/gi, 'oxygen saturation');

    const fullText = `${spokenHeader} ${cleanTitle}. ${cleanMsg}`;
    this.speak(fullText, { prefixChime: true });
  }

  public testVoiceAnnouncement(): void {
    this.speak(
      'Starfleet Voice Telemetry Operational. Dr. Welland-Strong text-to-speech audio system online.',
      { prefixChime: true }
    );
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const ttsAnnouncer = new TTSAnnouncerService();
