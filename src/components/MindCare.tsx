import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  Play,
  Square,
  Waves,
  Sparkles,
  Wind,
  ShieldCheck,
  Bell,
  Clock,
  Check,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  X,
  Headphones,
  Radio,
  Sliders,
  Activity,
  Zap,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Heart,
  Gauge,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  DailyReminder,
  getSavedReminders,
  saveReminders,
  addReminder,
  deleteReminder,
  checkDueReminders,
  playStarfleetChime,
  requestNotificationPermission,
  triggerSystemNotification,
} from '../services/reminderService';
import { NavTab, BiometricProfile } from '../types';

interface MindCareProps {
  biometrics?: BiometricProfile;
  setBiometrics?: React.Dispatch<React.SetStateAction<BiometricProfile>>;
  onNavigateTab?: (tab: NavTab) => void;
}

export interface SoundscapeTrack {
  id: string;
  title: string;
  subtitle: string;
  category: 'Binaural Theta' | 'Alpha Flow' | 'Delta Rest' | 'Solfeggio Ambient' | 'Schumann Resonance';
  binauralFreqHz: number;
  carrierFreqHz: number;
  solfeggioOverlayHz: number;
  stressImpactEstimate: string;
  description: string;
  color: string;
  borderColor: string;
  bgGlow: string;
}

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'theta_cortisol_drop',
    title: 'Theta Cortisol Release Stream',
    subtitle: '6.5 Hz Binaural Beat • 432 Hz Solfeggio Carrier',
    category: 'Binaural Theta',
    binauralFreqHz: 6.5,
    carrierFreqHz: 200,
    solfeggioOverlayHz: 432,
    stressImpactEstimate: '-20% to -35% Stress Index',
    description: 'Generates a 6.5 Hz binaural theta entrainment panned across stereo channels. Suppresses sympathetic HPA-axis arousal and lowers recorded cortisol stressIndex.',
    color: 'purple',
    borderColor: 'border-purple-500/40 hover:border-purple-500/80',
    bgGlow: 'bg-purple-500/10 text-purple-300',
  },
  {
    id: 'alpha_coherence_flow',
    title: 'Alpha Coherence & Flow Stream',
    subtitle: '10.0 Hz Binaural Beat • 528 Hz Miracle Harmonic',
    category: 'Alpha Flow',
    binauralFreqHz: 10.0,
    carrierFreqHz: 220,
    solfeggioOverlayHz: 528,
    stressImpactEstimate: '-15% to -25% Stress Index',
    description: 'Promotes alpha-band cortical synchronization (10.0 Hz). Replaces cognitive overwhelm with calm focus and improved HRV resilience.',
    color: 'cyan',
    borderColor: 'border-cyan-500/40 hover:border-cyan-500/80',
    bgGlow: 'bg-cyan-500/10 text-cyan-300',
  },
  {
    id: 'delta_deep_parasympathetic',
    title: 'Delta Parasympathetic Restorative',
    subtitle: '3.5 Hz Binaural Beat • 285 Hz Tissue Repair',
    category: 'Delta Rest',
    binauralFreqHz: 3.5,
    carrierFreqHz: 150,
    solfeggioOverlayHz: 285,
    stressImpactEstimate: '-25% to -40% Stress Index',
    description: 'Deep delta wave entrainment (3.5 Hz) designed for rapid vagal recovery, sleep architecture prep, and mitochondrial energy restoration.',
    color: 'indigo',
    borderColor: 'border-indigo-500/40 hover:border-indigo-500/80',
    bgGlow: 'bg-indigo-500/10 text-indigo-300',
  },
  {
    id: 'schumann_earth_resonance',
    title: 'Schumann Earth Ionosphere Pulse',
    subtitle: '7.83 Hz Fundamental • Organic Pink Noise Wave',
    category: 'Schumann Resonance',
    binauralFreqHz: 7.83,
    carrierFreqHz: 136.1,
    solfeggioOverlayHz: 396,
    stressImpactEstimate: '-18% to -30% Stress Index',
    description: 'Harmonizes human electromagnetic bio-fields with Earth’s 7.83 Hz ionospheric Schumann pulse to soothe sympathetic nerve tension.',
    color: 'emerald',
    borderColor: 'border-emerald-500/40 hover:border-emerald-500/80',
    bgGlow: 'bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'gamma_synaptic_clarity',
    title: 'Gamma Synaptic Integration Stream',
    subtitle: '40.0 Hz Binaural Beat • 741 Hz Intuitive Focus',
    category: 'Binaural Theta',
    binauralFreqHz: 40.0,
    carrierFreqHz: 250,
    solfeggioOverlayHz: 741,
    stressImpactEstimate: '-12% to -20% Stress Index',
    description: '40 Hz gamma frequency entrainment for clearing synaptic fog, balancing default mode network rumination, and elevating neural coherence.',
    color: 'rose',
    borderColor: 'border-rose-500/40 hover:border-rose-500/80',
    bgGlow: 'bg-rose-500/10 text-rose-300',
  },
];

const SOLFEGGIO_FREQUENCIES = [
  { freq: 174, name: '174 Hz // Natural Anesthetic', desc: 'Relieves physical tension and gives cellular structures a sense of security.' },
  { freq: 285, name: '285 Hz // Quantum Cognition', desc: 'Facilitates tissue restructuring and mitochondrial rejuvenation.' },
  { freq: 396, name: '396 Hz // Liberation from Fear', desc: 'Liberates guilt, anxiety, and subconscious fear patterns.' },
  { freq: 417, name: '417 Hz // Undoing Traumatic Imprints', desc: 'Facilitates emotional change and clears trauma responses.' },
  { freq: 432, name: '432 Hz // Universal Harmonic', desc: 'Deep cosmic alignment, cardiac coherence, and parasympathetic shift.' },
  { freq: 528, name: '528 Hz // DNA Repair & Bio-Field Sync', desc: 'Transformation, cellular repair, and elevated life force energy.' },
  { freq: 639, name: '639 Hz // Interconnectedness', desc: 'Enhances harmonic relationships and emotional balance.' },
  { freq: 741, name: '741 Hz // Intuitive Awakening', desc: 'Cleanses cellular toxins and electromagnetic smog.' },
];

export interface MindCareBreathingMode {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
}

const BREATHING_MODES: MindCareBreathingMode[] = [
  { id: 'box', name: 'Box Breathing (4-4-4-4)', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Equalized autonomic stabilization.' },
  { id: 'relax', name: 'Deep Relaxation (4-7-8)', inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: 'High vagal stimulation via extended exhalation.' },
  { id: 'energize', name: 'Energy Activation (6-2-6-2)', inhale: 6, hold1: 2, exhale: 6, hold2: 2, description: 'Sympathetic balance and alertness.' },
  { id: 'vagal_brake', name: 'Vagal Brake Pacing (4-2-8-2)', inhale: 4, hold1: 2, exhale: 8, hold2: 2, description: 'Somatic deceleration for high heart rates (> 80 BPM).' },
  { id: 'coherence_01hz', name: 'Heart Coherence (5.5-0-5.5-0)', inhale: 5.5, hold1: 0, exhale: 5.5, hold2: 0, description: '0.1 Hz Baroreflex resonance for peak HRV amplitude.' },
];

export const MindCare: React.FC<MindCareProps> = ({ biometrics, setBiometrics, onNavigateTab }) => {
  // Solfeggio Single Tone State
  const [activeFreq, setActiveFreq] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Real-Time Biometric Auto-Adjustment State
  const [isAutoAdjustmentActive, setIsAutoAdjustmentActive] = useState<boolean>(true);
  const [liveHeartRate, setLiveHeartRate] = useState<number>(biometrics?.heartRate || 74);
  const [liveHrv, setLiveHrv] = useState<number>(biometrics?.hrv || 62);
  const [adaptationStatus, setAdaptationStatus] = useState<string>(
    'System synchronized to baseline cardiac pace (74 BPM / 62 ms). Resonant pacing active.'
  );
  const [adaptivePacingLabel, setAdaptivePacingLabel] = useState<string>('Resonant Coherence (5.5s / 5.5s)');

  // Guided Breathwork State
  const [selectedMode, setSelectedMode] = useState<MindCareBreathingMode>(BREATHING_MODES[0]);
  const [breathState, setBreathState] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(selectedMode.inhale);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [stressReduction, setStressReduction] = useState(0);

  // Ambient Soundscape Player Engine State
  const [activeSoundscapeTrack, setActiveSoundscapeTrack] = useState<SoundscapeTrack | null>(SOUNDSCAPE_TRACKS[0]);
  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [soundscapeVolume, setSoundscapeVolume] = useState<number>(0.6);
  const [enableBinauralLayer, setEnableBinauralLayer] = useState<boolean>(true);
  const [enablePinkNoiseLayer, setEnablePinkNoiseLayer] = useState<boolean>(true);
  const [enableSubBassLayer, setEnableSubBassLayer] = useState<boolean>(true);
  const [enableSolfeggioLayer, setEnableSolfeggioLayer] = useState<boolean>(true);
  const [customBinauralOffset, setCustomBinauralOffset] = useState<number>(6.5);
  const [soundscapeTimer, setSoundscapeTimer] = useState<number>(0);
  const [stressReductionPoints, setStressReductionPoints] = useState<number>(0);

  // Daily recurring reminders state
  const [reminders, setReminders] = useState<DailyReminder[]>(getSavedReminders());
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [activePrompt, setActivePrompt] = useState<DailyReminder | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'mindcare' | 'remedy' | 'somatic'>('mindcare');
  const [newTime, setNewTime] = useState('12:00');
  const [newDesc, setNewDesc] = useState('');

  // Audio Context Refs for Single Tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Web Audio Context Refs for Multi-Layer Ambient Soundscape Synthesizer
  const soundscapeCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const solfeggioOscRef = useRef<OscillatorNode | null>(null);
  const subBassOscRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const soundscapeMasterGainRef = useRef<GainNode | null>(null);
  const binauralGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const subBassGainRef = useRef<GainNode | null>(null);
  const solfeggioGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
  }, []);

  // Check every 25 seconds if a reminder matches current time
  useEffect(() => {
    const interval = setInterval(() => {
      checkDueReminders((r) => {
        setActivePrompt(r);
      });
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Timer for Soundscape live stress reduction feedback
  useEffect(() => {
    let timerInterval: any = null;
    if (isSoundscapePlaying) {
      timerInterval = setInterval(() => {
        setSoundscapeTimer((prev) => prev + 1);
        setStressReductionPoints((prev) => Math.min(35, prev + 1));
      }, 3000);
    } else {
      setSoundscapeTimer(0);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isSoundscapePlaying]);

  // Dynamic Volume Updates
  useEffect(() => {
    if (soundscapeMasterGainRef.current && soundscapeCtxRef.current) {
      try {
        soundscapeMasterGainRef.current.gain.setValueAtTime(
          soundscapeVolume,
          soundscapeCtxRef.current.currentTime
        );
      } catch (e) {}
    }
  }, [soundscapeVolume]);

  // Dynamic Layer Toggles
  useEffect(() => {
    if (soundscapeCtxRef.current) {
      const now = soundscapeCtxRef.current.currentTime;
      if (binauralGainRef.current) binauralGainRef.current.gain.setValueAtTime(enableBinauralLayer ? 0.25 : 0, now);
      if (noiseGainRef.current) noiseGainRef.current.gain.setValueAtTime(enablePinkNoiseLayer ? 0.04 : 0, now);
      if (subBassGainRef.current) subBassGainRef.current.gain.setValueAtTime(enableSubBassLayer ? 0.06 : 0, now);
      if (solfeggioGainRef.current) solfeggioGainRef.current.gain.setValueAtTime(enableSolfeggioLayer ? 0.08 : 0, now);
    }
  }, [enableBinauralLayer, enablePinkNoiseLayer, enableSubBassLayer, enableSolfeggioLayer]);

  // Sync live HR & HRV with incoming biometrics prop
  useEffect(() => {
    if (biometrics) {
      setLiveHeartRate(biometrics.heartRate);
      setLiveHrv(biometrics.hrv);
    }
  }, [biometrics?.heartRate, biometrics?.hrv]);

  // Dynamic Real-Time Auto-Adjustment Effect for Ambient Soundscape Frequency & Breathing Pacing
  useEffect(() => {
    if (!isAutoAdjustmentActive) return;

    let targetBinauralHz = 6.5;
    let targetSolfeggioHz = 528;
    let newAdaptivePacingMode = BREATHING_MODES[0];
    let statusMsg = '';

    if (liveHeartRate > 80 || liveHrv < 48) {
      // Sympathetic surge / tachycardia alert -> Deepen into Theta / Delta & Extended Exhale
      targetBinauralHz = Math.max(3.5, Number((7.0 - (liveHeartRate - 75) * 0.12).toFixed(1)));
      targetSolfeggioHz = 396; // Cortisol liberation & vagal grounding
      newAdaptivePacingMode = BREATHING_MODES[3]; // Vagal Brake 4-2-8-2
      statusMsg = `Elevated cardiac pace (${liveHeartRate} BPM) / low HRV (${liveHrv} ms): Auto-deepening soundscape to ${targetBinauralHz} Hz Theta and engaging 8s Vagal Exhale.`;
      setAdaptivePacingLabel('Vagal Brake (4s Inhale • 8s Exhale)');
    } else if (liveHeartRate >= 62 && liveHeartRate <= 80 && liveHrv >= 48) {
      // Autonomic equilibrium -> 0.1 Hz Resonant Pacing & Alpha Coherence Flow
      targetBinauralHz = 10.0;
      targetSolfeggioHz = 528; // Transformation & cardiac coherence
      newAdaptivePacingMode = BREATHING_MODES[4]; // Heart Coherence 5.5-0-5.5-0
      statusMsg = `Cardiac rhythm in equilibrium (${liveHeartRate} BPM / ${liveHrv} ms HRV): Tuning soundscape to 10.0 Hz Alpha Coherence and 5.5s Resonant Rhythm (~0.1 Hz).`;
      setAdaptivePacingLabel('Heart Coherence 0.1 Hz (5.5s In • 5.5s Out)');
    } else {
      // Resting bradycardia or deep rest -> Gentle Alpha & Box Stabilizer
      targetBinauralHz = 7.83; // Schumann resonance
      targetSolfeggioHz = 432;
      newAdaptivePacingMode = BREATHING_MODES[0];
      statusMsg = `Resting baseline (${liveHeartRate} BPM): Stabilizing soundscape at 7.83 Hz Earth Schumann Resonance and 4s Box Breathing.`;
      setAdaptivePacingLabel('Box Stabilization (4s-4s-4s-4s)');
    }

    setCustomBinauralOffset(targetBinauralHz);
    setSelectedMode(newAdaptivePacingMode);
    setAdaptationStatus(statusMsg);

    // Smoothly modulate Web Audio synthesis oscillator frequencies in real-time
    if (soundscapeCtxRef.current && isSoundscapePlaying && activeSoundscapeTrack) {
      try {
        const now = soundscapeCtxRef.current.currentTime;
        if (rightOscRef.current) {
          rightOscRef.current.frequency.setTargetAtTime(
            activeSoundscapeTrack.carrierFreqHz + targetBinauralHz,
            now,
            0.6
          );
        }
        if (solfeggioOscRef.current) {
          solfeggioOscRef.current.frequency.setTargetAtTime(targetSolfeggioHz, now, 0.6);
        }
      } catch (err) {
        console.warn('Audio node frequency modulation failed:', err);
      }
    }
  }, [liveHeartRate, liveHrv, isAutoAdjustmentActive, isSoundscapePlaying, activeSoundscapeTrack]);

  // Dynamic Binaural Beat Frequency Offset Adjustment
  useEffect(() => {
    if (rightOscRef.current && soundscapeCtxRef.current && activeSoundscapeTrack) {
      try {
        rightOscRef.current.frequency.setValueAtTime(
          activeSoundscapeTrack.carrierFreqHz + customBinauralOffset,
          soundscapeCtxRef.current.currentTime
        );
      } catch (e) {}
    }
  }, [customBinauralOffset, activeSoundscapeTrack]);

  const handleSimulateSurge = () => {
    setLiveHeartRate(94);
    setLiveHrv(38);
    if (setBiometrics) {
      setBiometrics((b) => ({ ...b, heartRate: 94, hrv: 38, stressIndex: 58 }));
    }
  };

  const handleSimulateCalm = () => {
    setLiveHeartRate(68);
    setLiveHrv(76);
    if (setBiometrics) {
      setBiometrics((b) => ({ ...b, heartRate: 68, hrv: 76, stressIndex: 24 }));
    }
  };

  const handleSimulateRest = () => {
    setLiveHeartRate(56);
    setLiveHrv(85);
    if (setBiometrics) {
      setBiometrics((b) => ({ ...b, heartRate: 56, hrv: 85, stressIndex: 18 }));
    }
  };

  const handleCompleteBreathingCycle = () => {
    setCompletedCycles((c) => c + 1);
    setStressReduction((s) => Math.min(35, s + 5));

    // Biofeedback recovery loop: completing breath cycles naturally calms HR and boosts HRV
    if (isAutoAdjustmentActive) {
      setLiveHeartRate((prevHr) => {
        const nextHr = Math.max(58, prevHr - 1);
        if (setBiometrics) {
          setBiometrics((prevBio) => ({ ...prevBio, heartRate: nextHr }));
        }
        return nextHr;
      });
      setLiveHrv((prevHrv) => {
        const nextHrv = Math.min(95, prevHrv + 2);
        if (setBiometrics) {
          setBiometrics((prevBio) => ({ ...prevBio, hrv: nextHrv }));
        }
        return nextHrv;
      });
    }
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleTimeChange = (id: string, newTimeStr: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, time: newTimeStr } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = deleteReminder(id);
    setReminders(updated);
  };

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const updated = addReminder({
      title: newTitle.trim(),
      type: newType,
      time: newTime,
      enabled: true,
      description: newDesc.trim() || 'Custom holistic health prompt.',
    });
    setReminders(updated);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      triggerSystemNotification(
        'Starfleet Telemetry Notifications Active',
        'You will now receive daily recurring prompts for MindCare sessions and natural remedy intake.'
      );
    }
  };

  const handleTestChime = (rem: DailyReminder) => {
    playStarfleetChime();
    setActivePrompt(rem);
    triggerSystemNotification(rem.title, rem.description);
  };

  // Breathing timer cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;

        if (breathState === 'Inhale') {
          if (selectedMode.hold1 > 0) {
            setBreathState('Hold');
            return selectedMode.hold1;
          } else {
            setBreathState('Exhale');
            return selectedMode.exhale;
          }
        } else if (breathState === 'Hold') {
          setBreathState('Exhale');
          return selectedMode.exhale;
        } else if (breathState === 'Exhale') {
          if (selectedMode.hold2 > 0) {
            setBreathState('Rest');
            return selectedMode.hold2;
          } else {
            handleCompleteBreathingCycle();
            setBreathState('Inhale');
            return selectedMode.inhale;
          }
        } else {
          handleCompleteBreathingCycle();
          setBreathState('Inhale');
          return selectedMode.inhale;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathState, selectedMode, liveHeartRate, liveHrv, isAutoAdjustmentActive]);

  // Single Solfeggio Tone Controls
  const toggleTone = (freq: number) => {
    if (isPlaying && activeFreq === freq) {
      stopTone();
    } else {
      startTone(freq);
    }
  };

  const startTone = (freq: number) => {
    stopTone();
    stopSoundscape();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      oscRef.current = audioCtxRef.current.createOscillator();
      gainRef.current = audioCtxRef.current.createGain();

      oscRef.current.type = 'sine';
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gainRef.current.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);

      oscRef.current.connect(gainRef.current);
      gainRef.current.connect(audioCtxRef.current.destination);
      oscRef.current.start();

      setActiveFreq(freq);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setActiveFreq(null);
  };

  // Multi-Layer Soundscape Synthesizer Controls
  const stopSoundscape = () => {
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); leftOscRef.current.disconnect(); } catch (e) {}
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); rightOscRef.current.disconnect(); } catch (e) {}
      rightOscRef.current = null;
    }
    if (solfeggioOscRef.current) {
      try { solfeggioOscRef.current.stop(); solfeggioOscRef.current.disconnect(); } catch (e) {}
      solfeggioOscRef.current = null;
    }
    if (subBassOscRef.current) {
      try { subBassOscRef.current.stop(); subBassOscRef.current.disconnect(); } catch (e) {}
      subBassOscRef.current = null;
    }
    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); noiseNodeRef.current.disconnect(); } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (soundscapeCtxRef.current) {
      try { soundscapeCtxRef.current.close(); } catch (e) {}
      soundscapeCtxRef.current = null;
    }
    setIsSoundscapePlaying(false);
  };

  const startSoundscape = (track: SoundscapeTrack) => {
    stopSoundscape();
    stopTone();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      soundscapeCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(soundscapeVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      soundscapeMasterGainRef.current = masterGain;

      // 1. Binaural Beats Layer
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(enableBinauralLayer ? 0.25 : 0.0, ctx.currentTime);
      bGain.connect(masterGain);
      binauralGainRef.current = bGain;

      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(track.carrierFreqHz, ctx.currentTime);

      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(track.carrierFreqHz + customBinauralOffset, ctx.currentTime);

      if (ctx.createStereoPanner) {
        const pannerL = ctx.createStereoPanner();
        pannerL.pan.setValueAtTime(-0.95, ctx.currentTime);
        leftOsc.connect(pannerL);
        pannerL.connect(bGain);

        const pannerR = ctx.createStereoPanner();
        pannerR.pan.setValueAtTime(0.95, ctx.currentTime);
        rightOsc.connect(pannerR);
        pannerR.connect(bGain);
      } else {
        leftOsc.connect(bGain);
        rightOsc.connect(bGain);
      }

      leftOsc.start();
      rightOsc.start();
      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;

      // 2. Solfeggio Layer
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(enableSolfeggioLayer ? 0.08 : 0.0, ctx.currentTime);
      sGain.connect(masterGain);
      solfeggioGainRef.current = sGain;

      const solfOsc = ctx.createOscillator();
      solfOsc.type = 'sine';
      solfOsc.frequency.setValueAtTime(track.solfeggioOverlayHz, ctx.currentTime);
      solfOsc.connect(sGain);
      solfOsc.start();
      solfeggioOscRef.current = solfOsc;

      // 3. Sub-Bass Resonator (55 Hz)
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(enableSubBassLayer ? 0.06 : 0.0, ctx.currentTime);
      subGain.connect(masterGain);
      subBassGainRef.current = subGain;

      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, ctx.currentTime);
      subOsc.connect(subGain);
      subOsc.start();
      subBassOscRef.current = subOsc;

      // 4. Organic Pink Noise Ocean Rain Layer
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(enablePinkNoiseLayer ? 0.04 : 0.0, ctx.currentTime);
      nGain.connect(masterGain);
      noiseGainRef.current = nGain;

      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      whiteNoiseSource.connect(filter);
      filter.connect(nGain);
      whiteNoiseSource.start();
      noiseNodeRef.current = whiteNoiseSource;

      setActiveSoundscapeTrack(track);
      setCustomBinauralOffset(track.binauralFreqHz);
      setIsSoundscapePlaying(true);
    } catch (err) {
      console.error('Soundscape synth error:', err);
    }
  };

  const handleToggleSoundscapeTrack = (track: SoundscapeTrack) => {
    if (isSoundscapePlaying && activeSoundscapeTrack?.id === track.id) {
      stopSoundscape();
    } else {
      startSoundscape(track);
    }
  };

  useEffect(() => {
    return () => {
      stopTone();
      stopSoundscape();
    };
  }, []);

  const formatTimerMinSec = (secTotal: number) => {
    const mins = Math.floor(secTotal / 60);
    const secs = secTotal % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs">
            <HeartPulse className="w-3.5 h-3.5 text-purple-400" />
            <span>MIND CARE & RECURRING HEALTH SCHEDULE</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Ambient Soundscape Engine & Somatic Breathwork
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Stream frequency-specific binaural beats and multi-layer acoustic soundscapes engineered to down-regulate high stressIndex metrics, practice guided somatic breathing, and configure daily automated health prompts.
          </p>
        </div>
      </div>

      {/* Active Reminder Notification Banner */}
      {activePrompt && (
        <div className="bg-purple-950/50 border border-purple-500/50 rounded-2xl p-5 flex items-start justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-mono font-bold text-sm text-purple-200">
                DAILY PROMPT // {activePrompt.title}
              </div>
              <p className="text-xs font-mono text-slate-300">{activePrompt.description}</p>
              <div className="flex items-center gap-3 pt-2">
                {activePrompt.type === 'remedy' && onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('remedies');
                      setActivePrompt(null);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    View Prescribed Remedies
                  </button>
                )}
                {activePrompt.type === 'mindcare' && (
                  <button
                    onClick={() => {
                      if (SOUNDSCAPE_TRACKS[0]) startSoundscape(SOUNDSCAPE_TRACKS[0]);
                      setActivePrompt(null);
                    }}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Stream Theta Cortisol Release Soundscape
                  </button>
                )}
                <button
                  onClick={() => setActivePrompt(null)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Biometric Auto-Adjustment HUD & Telemetry Deck */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-cyan-950/70 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest font-bold">
                  AUTONOMIC BIOFEEDBACK ENGINE
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  isAutoAdjustmentActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {isAutoAdjustmentActive ? 'AUTO-TUNING ACTIVE' : 'MANUAL OVERRIDE'}
                </span>
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1">
                Real-Time Dynamic Biometric Auto-Adjustment
              </h3>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                Dynamically modulates ambient soundscape frequencies and breathing guide pacing based on real-time Heart Rate (BPM) and HRV fluctuations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            {/* Auto-tuning toggle switch */}
            <button
              type="button"
              onClick={() => setIsAutoAdjustmentActive(!isAutoAdjustmentActive)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-lg ${
                isAutoAdjustmentActive
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-950/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAutoAdjustmentActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{isAutoAdjustmentActive ? 'Auto-Adjustment: ON' : 'Auto-Adjustment: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Sensor Monitors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Live Heart Rate */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Heart className={`w-3.5 h-3.5 ${liveHeartRate > 80 ? 'text-rose-500 animate-ping' : 'text-rose-400 animate-pulse'}`} />
                Monitored Heart Rate
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                liveHeartRate > 80
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : liveHeartRate < 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {liveHeartRate > 80 ? 'TACHY / ELEVATED' : liveHeartRate < 60 ? 'BRADYCARDIA' : 'EQUILIBRIUM'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{liveHeartRate}</span>
              <span className="text-slate-400 text-xs">BPM</span>
            </div>
            <input
              type="range"
              min="50"
              max="125"
              value={liveHeartRate}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLiveHeartRate(val);
                if (setBiometrics) setBiometrics((b) => ({ ...b, heartRate: val }));
              }}
              className="w-full accent-rose-500 cursor-pointer pt-1"
              title="Adjust live heart rate to witness frequency & breathing auto-adaptation"
            />
          </div>

          {/* Live HRV */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                Vagal HRV Resilience
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                liveHrv < 48
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {liveHrv < 48 ? 'VAGAL FATIGUE' : 'HIGH RESERVE'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{liveHrv}</span>
              <span className="text-slate-400 text-xs">ms</span>
            </div>
            <input
              type="range"
              min="20"
              max="105"
              value={liveHrv}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLiveHrv(val);
                if (setBiometrics) setBiometrics((b) => ({ ...b, hrv: val }));
              }}
              className="w-full accent-cyan-500 cursor-pointer pt-1"
              title="Adjust live HRV to witness autonomic soundscape auto-adaptation"
            />
          </div>

          {/* Dynamically Modulated Frequency */}
          <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] text-purple-300 uppercase tracking-wider font-bold flex items-center justify-between">
              <span>Binaural Carrier Modulation</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-purple-200 tracking-tight">
              {customBinauralOffset.toFixed(1)} <span className="text-xs font-normal text-purple-300">Hz</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {customBinauralOffset <= 4.0 ? 'Delta Slow-Wave' : customBinauralOffset <= 8.0 ? 'Theta Vagal Brake' : 'Alpha Coherence Flow'}
            </div>
          </div>

          {/* Dynamically Modulated Pacing */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] text-cyan-300 uppercase tracking-wider font-bold flex items-center justify-between">
              <span>Adaptive Breathing Pacing</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-base font-bold text-cyan-200 tracking-tight leading-snug">
              {selectedMode.name.split(' (')[0]}
            </div>
            <div className="text-[11px] text-slate-400">
              {adaptivePacingLabel}
            </div>
          </div>
        </div>

        {/* Real-time Physiological Adaptation Status Callout */}
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5 text-xs font-mono text-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-spin-slow" />
            <span className="leading-relaxed">{adaptationStatus}</span>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Simulate:</span>
            <button
              type="button"
              onClick={handleSimulateSurge}
              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Test response to high heart rate surge (94 BPM)"
            >
              Surge (94 BPM)
            </button>
            <button
              type="button"
              onClick={handleSimulateCalm}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Test response to autonomic calm & coherence (68 BPM)"
            >
              Coherence (68 BPM)
            </button>
            <button
              type="button"
              onClick={handleSimulateRest}
              className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Test response to deep resting state (56 BPM)"
            >
              Deep Rest (56 BPM)
            </button>
          </div>
        </div>
      </div>

      {/* Ambient Soundscape & Binaural Beats Player Engine Section */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                <span>AMBIENT SOUNDSCAPE & BINAURAL BEAT STREAMER</span>
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Web Audio API frequency synthesis: Binaural beats (Theta/Alpha/Delta) + Organic Pink Noise + Solfeggio Harmonics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span>Target Impact: -{stressReductionPoints || 12}% stressIndex</span>
            </div>
          </div>
        </div>

        {/* Active Player Deck */}
        {activeSoundscapeTrack && (
          <div className="bg-slate-950/90 border border-purple-500/40 rounded-xl p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase font-bold">
                    {activeSoundscapeTrack.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {activeSoundscapeTrack.stressImpactEstimate}
                  </span>
                </div>
                <h4 className="text-xl font-bold font-mono text-white flex items-center gap-3">
                  <span>{activeSoundscapeTrack.title}</span>
                  {isSoundscapePlaying && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-5 bg-purple-400 rounded animate-pulse" />
                      <span className="w-1.5 h-7 bg-cyan-400 rounded animate-pulse delay-75" />
                      <span className="w-1.5 h-4 bg-purple-400 rounded animate-pulse delay-150" />
                    </span>
                  )}
                </h4>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  {activeSoundscapeTrack.description}
                </p>
              </div>

              {/* Player Controls Deck */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shrink-0 lg:w-96">
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Radio className={`w-4 h-4 ${isSoundscapePlaying ? 'text-purple-400 animate-spin' : 'text-slate-500'}`} />
                    <span>{isSoundscapePlaying ? 'STREAMING ACTIVE' : 'PAUSED'}</span>
                  </div>
                  <span className="text-purple-300 font-bold">
                    {formatTimerMinSec(soundscapeTimer)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleSoundscapeTrack(activeSoundscapeTrack)}
                    className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      isSoundscapePlaying
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/50'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
                    }`}
                  >
                    {isSoundscapePlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>STOP SOUNDSCAPE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>STREAM SOUNDSCAPE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Master Volume Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      {soundscapeVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                      Master Volume
                    </span>
                    <span className="text-cyan-300 font-bold">{Math.round(soundscapeVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={soundscapeVolume}
                    onChange={(e) => setSoundscapeVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Binaural Beat Custom Frequency Tuning Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                      Binaural Beat Entrainment
                    </span>
                    <span className="text-purple-300 font-bold">{customBinauralOffset.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.5"
                    value={customBinauralOffset}
                    onChange={(e) => setCustomBinauralOffset(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                    <span>Delta (1-4 Hz)</span>
                    <span>Theta (4-8 Hz)</span>
                    <span>Alpha (8-13 Hz)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer Toggles Mixer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Layer Acoustic Soundscape Mixer</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setEnableBinauralLayer(!enableBinauralLayer)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    enableBinauralLayer
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[11px] font-bold">Binaural Beat</span>
                  <span className={`w-2 h-2 rounded-full ${enableBinauralLayer ? 'bg-purple-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setEnablePinkNoiseLayer(!enablePinkNoiseLayer)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    enablePinkNoiseLayer
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[11px] font-bold">Pink Ocean Rain</span>
                  <span className={`w-2 h-2 rounded-full ${enablePinkNoiseLayer ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setEnableSubBassLayer(!enableSubBassLayer)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    enableSubBassLayer
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[11px] font-bold">55Hz Sub-Bass</span>
                  <span className={`w-2 h-2 rounded-full ${enableSubBassLayer ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setEnableSolfeggioLayer(!enableSolfeggioLayer)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    enableSolfeggioLayer
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[11px] font-bold">Solfeggio Overlay</span>
                  <span className={`w-2 h-2 rounded-full ${enableSolfeggioLayer ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Soundscape Track Selection Grid */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            SELECT SOUNDSCAPE PRESET // BINAURAL CORTISOL MITIGATION
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOUNDSCAPE_TRACKS.map((track) => {
              const isSelected = activeSoundscapeTrack?.id === track.id;
              const isTrackPlaying = isSoundscapePlaying && isSelected;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setActiveSoundscapeTrack(track);
                    setCustomBinauralOffset(track.binauralFreqHz);
                    if (isSoundscapePlaying && !isTrackPlaying) {
                      startSoundscape(track);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isTrackPlaying
                      ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/40'
                      : isSelected
                      ? 'bg-slate-950/90 border-purple-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-purple-500/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${track.bgGlow}`}>
                        {track.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {track.stressImpactEstimate}
                      </span>
                    </div>

                    <h5 className="font-mono font-bold text-sm text-white">{track.title}</h5>
                    <div className="text-[11px] font-mono text-purple-300">{track.subtitle}</div>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">
                      {track.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Carrier: {track.carrierFreqHz}Hz • Beat: {track.binauralFreqHz}Hz
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSoundscapeTrack(track);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTrackPlaying
                          ? 'bg-rose-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Stream</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Guided Breathing Visualizer & Stress Index Counter */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-400 font-mono flex items-center gap-2">
                <Wind className="w-5 h-5 text-purple-400" />
                Guided Breathwork
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                -{stressReduction}% Stress
              </span>
            </div>

            {/* Breathing Mode Selector */}
            <div className="grid grid-cols-1 gap-2">
              {BREATHING_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode);
                    setBreathState('Inhale');
                    setBreathTimer(mode.inhale);
                  }}
                  className={`px-3 py-2 rounded-xl font-mono text-xs transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedMode.id === mode.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{mode.name}</span>
                </button>
              ))}
            </div>

            {/* Breathing Circle Animation & Timing Indicators */}
            <div className="relative w-52 h-52 mx-auto flex items-center justify-center my-4">
              <div
                className={`absolute inset-0 rounded-full border-2 border-purple-500/40 transition-all duration-1000 ${
                  breathState === 'Inhale'
                    ? 'scale-115 bg-purple-500/25 shadow-lg shadow-purple-500/20'
                    : breathState === 'Exhale'
                    ? 'scale-85 bg-purple-500/5'
                    : 'scale-100 bg-purple-500/10'
                }`}
              />
              <div className="z-10 space-y-1">
                <div className="text-xs font-mono text-purple-300 uppercase tracking-widest">{breathState}</div>
                <div className="text-4xl font-bold font-mono text-white">{breathTimer}s</div>
                <div className="text-[10px] font-mono text-slate-400">Cycles: {completedCycles}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Autonomic Equilibrium Stable</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Solfeggio Frequency Generator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-purple-400 font-mono flex items-center gap-2">
                <Waves className="w-5 h-5 text-purple-400" />
                Solfeggio Frequency Generator
              </h3>
              {isPlaying && (
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Playing {activeFreq} Hz
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOLFEGGIO_FREQUENCIES.map((item) => {
                const isSelected = activeFreq === item.freq;
                return (
                  <div
                    key={item.freq}
                    onClick={() => toggleTone(item.freq)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-inner'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-sm text-white">{item.name}</div>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'bg-purple-500 text-slate-950' : 'bg-slate-900 text-purple-400 border border-slate-800'
                      }`}
                    >
                      {isSelected ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Recurring Schedule & Prompts Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>RECURRING HEALTH SCHEDULE & PROMPTS</span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mt-1">
              Daily MindCare & Remedy Intake Reminders
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Automated Starfleet acoustic chime and push notifications prompting you throughout the day.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-purple-400" />}
              <span>{showAddForm ? 'Cancel' : 'Add Scheduled Prompt'}</span>
            </button>

            {!permissionGranted ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                Enable Push Notifications
              </button>
            ) : (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                <Check className="w-4 h-4" /> Push Notifications Active
              </span>
            )}
          </div>
        </div>

        {/* Add Custom Reminder Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomReminder}
            className="bg-slate-950/90 border border-purple-500/40 rounded-xl p-5 space-y-4 animate-fadeIn"
          >
            <div className="font-mono font-bold text-sm text-purple-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>CONFIGURE NEW RECURRING DAILY HEALTH PROMPT</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">PROMPT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Adaptogenic Reishi Elixir"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="mindcare">MindCare Session (Breath / Solfeggio)</option>
                  <option value="remedy">Natural Remedy Intake</option>
                  <option value="somatic">Somatic Alignment / Bodyfix</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">DAILY TIME (HH:MM)</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">INSTRUCTION / PROTOCOL DETAILS</label>
              <input
                type="text"
                placeholder="e.g. Dissolve 1 tsp organic Reishi mushroom extract in warm water for vagal tone."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-xs rounded-lg transition-colors border border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-all shadow-md shadow-purple-500/20 cursor-pointer"
              >
                Save to Daily Schedule
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-xl border transition-all ${
                rem.enabled
                  ? 'bg-slate-950/80 border-purple-500/30'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      rem.enabled ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="font-mono font-bold text-sm text-white">{rem.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={rem.time}
                    onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      rem.enabled
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {rem.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 font-mono">{rem.description}</p>

              <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Schedule: {rem.time} Daily // Type: {rem.type}
                </span>
                <button
                  type="button"
                  onClick={() => handleTestChime(rem)}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Chime & Prompt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
