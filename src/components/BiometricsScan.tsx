import React, { useState, useEffect } from 'react';
import {
  BiometricProfile,
  DiagnosticReport,
  HistoricalBiometric,
  DailyJournalEntry,
  NavTab,
  SmartAlertRule,
  QuickMetricKey,
} from '../types';
import { fetchDiagnosis } from '../services/healthApi';
import { ttsAnnouncer } from '../services/ttsAnnouncerService';
import { VoiceTelemetryControl } from './VoiceTelemetryControl';
import {
  getSavedJournalEntries,
  addJournalEntry,
  deleteJournalEntry,
  getSleepQualityLabel,
  getSleepRecoveryDescriptor,
  getEnergyLevelDescriptor,
} from '../services/journalService';
import {
  getSavedSmartAlerts,
  saveSmartAlerts,
  addSmartAlert,
  updateSmartAlert,
  deleteSmartAlert,
  resetDefaultSmartAlerts,
  evaluateSmartAlertRules,
} from '../services/smartAlertsService';
import {
  Activity,
  Heart,
  Zap,
  Shield,
  Waves,
  Cpu,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Download,
  Cloud,
  Target,
  Bell,
  X,
  Award,
  Flame,
  Wind,
  Gauge,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Info,
  Sliders,
  BookOpen,
  Moon,
  Sun,
  BatteryCharging,
  Smile,
  PenLine,
  Calendar,
  History,
  Save,
  Clock,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Droplet,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Radio,
  Edit3,
  UserCheck,
  Eye,
  Maximize2,
  Minimize2,
  Crosshair,
  FolderArchive,
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RadarChart } from './RadarChart';
import { BiometricArchiveSection } from './BiometricArchiveSection';

interface BiometricsScanProps {
  biometrics: BiometricProfile;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricProfile>>;
  report: DiagnosticReport | null;
  setReport: React.Dispatch<React.SetStateAction<DiagnosticReport | null>>;
  cloudHistory?: any[] | null;
  onNavigateTab?: (tab: NavTab) => void;
}

interface QuickMetricDetail {
  key: QuickMetricKey;
  channel: string;
  name: string;
  shortName: string;
  unit: string;
  min: number;
  max: number;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgGlow: string;
  textColor: string;
  normalRange: string;
  targetKey?: 'targetHeartRate' | 'targetHrv' | 'targetNeural' | 'targetVitality';
  system: string;
  physiology: string;
  clinicalSignificance: string;
  interpretation: (val: any) => string;
  status: (val: any) => { label: string; badge: string };
  remedy: string;
  frequencyHz: number;
  somaticExercise: string;
}

export const QUICK_METRICS: QuickMetricDetail[] = [
  {
    key: 'heartRate',
    channel: 'SENS-01',
    name: 'Cardiovascular Frequency',
    shortName: 'Heart Rate',
    unit: 'BPM',
    min: 50,
    max: 140,
    icon: Heart,
    color: 'rose',
    borderColor: 'border-rose-500/30 hover:border-rose-500/60',
    bgGlow: 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20',
    textColor: 'text-rose-400',
    normalRange: '60 - 80 BPM',
    targetKey: 'targetHeartRate',
    system: 'Cardiovascular & Sinoatrial Pacing',
    physiology:
      'Regulates left ventricular stroke output and systemic perfusion. Modulated dynamically by autonomic innervation from the cardiac branches of the vagus nerve (cranial nerve X).',
    clinicalSignificance:
      'Resting heart rate reflects myocardial oxygen demand and autonomic balance. A low-to-moderate rate indicates efficient stroke volume and cardiovascular endurance.',
    interpretation: (val: number) =>
      val < 60
        ? 'Bradycardia detected: Resting rate is unusually low; assess for vagotonic state or sinus bradycardia.'
        : val > 100
        ? 'Tachycardia detected: Elevated cardiac pace indicating sympathetic arousal, caffeine load, or dehydration.'
        : 'Optimal resting sinus rhythm with balanced vagal modulation and low myocardial workload.',
    status: (val: number) =>
      val < 60
        ? { label: 'BRADYCARDIA', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
        : val > 100
        ? { label: 'TACHYCARDIA', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
        : { label: 'OPTIMAL', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    remedy: 'Hawthorn Berry (Crataegus) extract & CoQ10 for myocardial contractile strength.',
    frequencyHz: 528,
    somaticExercise: 'Extended exhale breathing (4 sec inhale, 8 sec exhale) to stimulate cardiac vagal braking.',
  },
  {
    key: 'hrv',
    channel: 'SENS-02',
    name: 'Heart Rate Variability (RMSSD)',
    shortName: 'HRV Resilience',
    unit: 'ms',
    min: 20,
    max: 120,
    icon: Waves,
    color: 'cyan',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
    bgGlow: 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20',
    textColor: 'text-cyan-300',
    normalRange: '50 - 90 ms',
    targetKey: 'targetHrv',
    system: 'Autonomic Nervous System & Vagal Tone',
    physiology:
      'Measures beat-to-beat variability originating from respiratory sinus arrhythmia (RSA). Directly correlates with parasympathetic nervous system flexibility.',
    clinicalSignificance:
      'Higher HRV correlates with systemic longevity, stress resilience, emotional regulation, and rapid physiological recovery between physical or cognitive exertion.',
    interpretation: (val: number) =>
      val >= 60
        ? 'High autonomic resilience: Parasympathetic vagal tone is robust, indicating ready physiological adaptation.'
        : val >= 40
        ? 'Moderate autonomic reserve: Baseline maintenance adequate, but nervous system recovery is advised.'
        : 'Sympathetic dominance alert: Suppressed variability reflecting autonomic fatigue and cumulative allostatic load.',
    status: (val: number) =>
      val >= 60
        ? { label: 'HIGH RESERVE', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
        : val >= 40
        ? { label: 'MODERATE', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
        : { label: 'FATIGUED', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    remedy: 'Rhodiola Rosea & Ashwagandha KSM-66 to downregulate adrenocorticotropic surges.',
    frequencyHz: 432,
    somaticExercise: 'Resonance frequency breathing at 5.5 breaths per minute to synchronize baroreceptor oscillations.',
  },
  {
    key: 'neuralCoherence',
    channel: 'SENS-03',
    name: 'Neural Matrix Coherence',
    shortName: 'Neural Sync',
    unit: '%',
    min: 40,
    max: 100,
    icon: Cpu,
    color: 'purple',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    bgGlow: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20',
    textColor: 'text-purple-300',
    normalRange: '75 - 100%',
    targetKey: 'targetNeural',
    system: 'Cerebral Cortex & Alpha-Theta Band Synchronization',
    physiology:
      'Quantifies phase-locking and cross-frequency coherence between bilateral hemispheres, prefrontal cortex, and default mode network (DMN).',
    clinicalSignificance:
      'High coherence indicates integrated mental focus, low cognitive entropy, absence of rumination, and peak flow-state neurological states.',
    interpretation: (val: number) =>
      val >= 80
        ? 'Peak hemispheric synchronization: Seamless integration across fronto-parietal cognitive networks with high clarity.'
        : val >= 70
        ? 'Stable cognitive baseline: Brainwave patterns consistent, mild mental friction detected under sustained task load.'
        : 'Neural desynchronization alert: Disrupted EEG wave coherence suggesting sensory overload or sleep deprivation.',
    status: (val: number) =>
      val >= 80
        ? { label: 'SYNCHRONIZED', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
        : val >= 70
        ? { label: 'STABLE', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
        : { label: 'DESYNC', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    remedy: "Lion's Mane (Hericium erinaceus) & Bacopa Monnieri to support neurotrophic factor synthesis.",
    frequencyHz: 741,
    somaticExercise: 'Alternate nostril breathing (Nadi Shodhana) to rebalance corpus callosum hemispheric transmission.',
  },
  {
    key: 'cellularVitality',
    channel: 'SENS-04',
    name: 'Cellular Vitality & Bio-Electric Potential',
    shortName: 'Cellular ATP',
    unit: '%',
    min: 50,
    max: 100,
    icon: Zap,
    color: 'emerald',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    bgGlow: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
    textColor: 'text-emerald-300',
    normalRange: '80 - 100%',
    targetKey: 'targetVitality',
    system: 'Mitochondrial Electron Transport & Membrane Potential',
    physiology:
      'Reflects cellular capacitance, bio-impedance phase angle, and the proton gradient across mitochondrial inner cristae membranes.',
    clinicalSignificance:
      'Vitality scores correlate directly with intracellular hydration, reactive oxygen species (ROS) quenching, and the capacity for tissue remodeling.',
    interpretation: (val: number) =>
      val >= 85
        ? 'Charged bio-energetic state: Mitochondrial ATP synthesis running at peak efficiency with healthy membrane integrity.'
        : val >= 75
        ? 'Balanced metabolic reserve: Adequate cellular turnover, but micronutrient replenishment recommended.'
        : 'Cellular depletion alert: Reduced membrane capacitance indicating mitochondrial oxidative stress.',
    status: (val: number) =>
      val >= 85
        ? { label: 'CHARGED', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
        : val >= 75
        ? { label: 'BALANCED', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
        : { label: 'DEPLETED', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    remedy: 'Purified Himalayan Shilajit (Fulvic Acid Matrix) & Cordyceps Militaris for mitochondrial respiration.',
    frequencyHz: 285,
    somaticExercise: 'Morning barefoot earthing and gentle rebounding to accelerate lymphatic drainage and electron exchange.',
  },
  {
    key: 'stressIndex',
    channel: 'SENS-05',
    name: 'Sympathetic Stress Index',
    shortName: 'Stress Load',
    unit: '%',
    min: 5,
    max: 100,
    icon: Shield,
    color: 'amber',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    bgGlow: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
    textColor: 'text-amber-300',
    normalRange: '< 35%',
    system: 'Hypothalamic-Pituitary-Adrenal (HPA) Axis',
    physiology:
      'Integrated index derived from sympathetic vasomotor tone, electrodermal arousal, and peripheral vasoconstriction.',
    clinicalSignificance:
      'Sustained elevated stress indices drive chronic glucocorticoid resistance, inflammatory cytokine cascades, and sleep architecture fragmentation.',
    interpretation: (val: number) =>
      val <= 30
        ? 'Low sympathetic burden: Autonomic homeostasis in restorative parasympathetic equilibrium.'
        : val <= 55
        ? 'Moderate allostatic tension: Sympathetic arousal elevated; periodic somatic grounding advised.'
        : 'Acute stress surge: High sympathetic fight-or-flight signaling requiring immediate parasympathetic intervention.',
    status: (val: number) =>
      val <= 30
        ? { label: 'LOW LOAD', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
        : val <= 55
        ? { label: 'MODERATE', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
        : { label: 'HIGH SURGE', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    remedy: 'Holy Basil (Tulsi) organic infusion paired with L-Theanine and magnesium L-threonate.',
    frequencyHz: 396,
    somaticExercise: 'Box Breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Rest) with peripheral gaze expansion.',
  },
  {
    key: 'oxygenSaturation',
    channel: 'SENS-06',
    name: 'Peripheral Pulse Oximetry (SpO2)',
    shortName: 'Pulse Ox',
    unit: '%',
    min: 88,
    max: 100,
    icon: Wind,
    color: 'blue',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    bgGlow: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',
    textColor: 'text-blue-300',
    normalRange: '95 - 100%',
    system: 'Pulmonary Diffusion & Arterial Hemoglobin',
    physiology:
      'Measures the fraction of oxygen-saturated hemoglobin relative to total hemoglobin in arterial microvasculature.',
    clinicalSignificance:
      'Ensures adequate aerobic metabolism, brain tissue oxygen delivery, and rapid elimination of anaerobic lactic acid metabolites.',
    interpretation: (val: number) =>
      val >= 97
        ? 'Optimal tissue oxygenation: Efficient alveolar-capillary diffusion delivering full aerobic oxygen support.'
        : val >= 94
        ? 'Normal arterial saturation: Minor shallow breathing pattern detected; diaphragmatic expansion recommended.'
        : 'Hypoxia alert: Peripheral oxygenation sub-threshold; check airway posture and practice full inhalations.',
    status: (val: number) =>
      val >= 97
        ? { label: 'OPTIMAL', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
        : val >= 94
        ? { label: 'NORMAL', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
        : { label: 'HYPOXIC', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    remedy: 'Chlorophyll-rich spirulina microalgae and organic beet root powder for nitric oxide synthesis.',
    frequencyHz: 639,
    somaticExercise: 'Breath of Fire (Kapalabhati) or deep diaphragmatic ribcage expansion for 3 minutes.',
  },
  {
    key: 'bloodPressure',
    channel: 'SENS-07',
    name: 'Arterial Hemodynamics',
    shortName: 'Blood Pressure',
    unit: 'mmHg',
    min: 90,
    max: 180,
    icon: Gauge,
    color: 'teal',
    borderColor: 'border-teal-500/30 hover:border-teal-500/60',
    bgGlow: 'bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20',
    textColor: 'text-teal-300',
    normalRange: '110/70 - 120/80',
    system: 'Vascular Endothelial Tone & Peripheral Resistance',
    physiology:
      'Measures the lateral pressure exerted by circulating blood volume on arterial walls during systole (contraction) and diastole (relaxation).',
    clinicalSignificance:
      'Reflects vascular elasticity, nitric oxide bioavailability, and cardiac output efficiency without excessive arterial sheer stress.',
    interpretation: (_val: string) =>
      'Normotensive equilibrium: Endothelial elasticity and systemic vascular resistance within healthy target parameters.',
    status: () => ({
      label: 'NORMOTENSIVE',
      badge: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    }),
    remedy: 'Aged Black Garlic extract & Hibiscus sabdariffa tea for natural endothelial vasodilation.',
    frequencyHz: 174,
    somaticExercise: 'Suboccipital neck stretch and gentle isometric calf raises to assist venous return to the heart.',
  },
];

export interface BodyRegionDetail {
  id: string;
  name: string;
  shortName: string;
  cx: number;
  cy: number;
  cxBack?: number;
  cyBack?: number;
  metricKey: QuickMetricKey;
  metricLabel: string;
  normalRangeLabel: string;
  systemName: string;
  getVal: (bio: BiometricProfile) => string | number;
  isAnomaly: (bio: BiometricProfile) => boolean;
  statusInfo: (bio: BiometricProfile) => { label: string; badgeClass: string; isCritical: boolean };
  recoveryProtocol: {
    solfeggioHz: number;
    solfeggioTitle: string;
    herbalRemedy: string;
    somaticInstruction: string;
  };
}

export const BODY_REGIONS: BodyRegionDetail[] = [
  {
    id: 'head',
    name: 'Cranial Matrix & Cerebral Cortex',
    shortName: 'Cranial Matrix',
    cx: 100,
    cy: 28,
    cxBack: 100,
    cyBack: 28,
    metricKey: 'neuralCoherence',
    metricLabel: 'Neural Matrix Coherence',
    normalRangeLabel: '75% - 100%',
    systemName: 'Central Nervous System & Hemispheric Synchronization',
    getVal: (bio) => `${bio.neuralCoherence}%`,
    isAnomaly: (bio) => bio.neuralCoherence < 75,
    statusInfo: (bio) =>
      bio.neuralCoherence >= 80
        ? { label: 'SYNCHRONIZED', badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30', isCritical: false }
        : bio.neuralCoherence >= 70
        ? { label: 'STABLE', badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', isCritical: false }
        : { label: 'NEURAL DESYNC', badgeClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40', isCritical: true },
    recoveryProtocol: {
      solfeggioHz: 741,
      solfeggioTitle: '741 Hz Solfeggio - Synaptic Clarity & Focus',
      herbalRemedy: 'Lion’s Mane Dual Extract (1000mg) + Bacopa Monnieri',
      somaticInstruction: 'Alternate Nostril Breathing (Nadi Shodhana) for 10 cycles',
    },
  },
  {
    id: 'chest',
    name: 'Cardiovascular Axis & Sinoatrial Pacing',
    shortName: 'Cardiovascular Axis',
    cx: 100,
    cy: 82,
    cxBack: 100,
    cyBack: 82,
    metricKey: 'heartRate',
    metricLabel: 'Resting Heart Rate',
    normalRangeLabel: '60 - 80 BPM',
    systemName: 'Myocardial Perfusion & Autonomic Sinus Rhythm',
    getVal: (bio) => `${bio.heartRate} BPM`,
    isAnomaly: (bio) => bio.heartRate > 90 || bio.heartRate < 60,
    statusInfo: (bio) =>
      bio.heartRate < 60
        ? { label: 'BRADYCARDIA', badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30', isCritical: false }
        : bio.heartRate > 100
        ? { label: 'TACHYCARDIA ALERT', badgeClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40', isCritical: true }
        : { label: 'CARDIAC EQUILIBRIUM', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isCritical: false },
    recoveryProtocol: {
      solfeggioHz: 528,
      solfeggioTitle: '528 Hz Solfeggio - Cardiac Transformation & Bio-Field Sync',
      herbalRemedy: 'Hawthorn Berry Tincture (30 drops in electrolyte water)',
      somaticInstruction: 'Extended Exhale Vagal Braking (4s Inhale, 8s Exhale for 3 mins)',
    },
  },
  {
    id: 'lungs',
    name: 'Pulmonary Axis & Oxygenation',
    shortName: 'Pulmonary Lungs',
    cx: 82,
    cy: 78,
    cxBack: 118,
    cyBack: 78,
    metricKey: 'oxygenSaturation',
    metricLabel: 'Pulse Oximetry (SpO2)',
    normalRangeLabel: '95% - 100%',
    systemName: 'Alveolar-Capillary Gas Exchange',
    getVal: (bio) => `${bio.oxygenSaturation}%`,
    isAnomaly: (bio) => bio.oxygenSaturation < 95,
    statusInfo: (bio) =>
      bio.oxygenSaturation >= 97
        ? { label: 'OPTIMAL OXIDATION', badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30', isCritical: false }
        : bio.oxygenSaturation >= 95
        ? { label: 'NORMAL', badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', isCritical: false }
        : { label: 'HYPOXIC ALERT', badgeClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40', isCritical: true },
    recoveryProtocol: {
      solfeggioHz: 639,
      solfeggioTitle: '639 Hz Solfeggio - Cellular Interconnection',
      herbalRemedy: 'Chlorophyll Spirulina + Beetroot Extract (Nitric Oxide)',
      somaticInstruction: 'Breath of Fire (Kapalabhati) diaphragmatic pumping',
    },
  },
  {
    id: 'solarPlexus',
    name: 'Autonomic Vagus & Solar Plexus Adrenals',
    shortName: 'Autonomic Vagus',
    cx: 100,
    cy: 110,
    cxBack: 100,
    cyBack: 110,
    metricKey: 'stressIndex',
    metricLabel: 'Sympathetic Stress Index & HRV',
    normalRangeLabel: 'Stress < 35%, HRV > 50ms',
    systemName: 'Hypothalamic-Pituitary-Adrenal (HPA) Axis & Vagal Tone',
    getVal: (bio) => `Stress: ${bio.stressIndex}% | HRV: ${bio.hrv}ms`,
    isAnomaly: (bio) => bio.stressIndex > 45 || bio.hrv < 45,
    statusInfo: (bio) =>
      bio.stressIndex > 50 || bio.hrv < 40
        ? { label: 'ALLOSTRESS OVERLOAD', badgeClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40', isCritical: true }
        : bio.stressIndex > 30
        ? { label: 'MODERATE TENSION', badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30', isCritical: false }
        : { label: 'PARASYMPATHETIC CALM', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isCritical: false },
    recoveryProtocol: {
      solfeggioHz: 396,
      solfeggioTitle: '396 Hz Solfeggio - Cortisol Down-Regulation & Vagal Tone',
      herbalRemedy: 'Ashwagandha KSM-66 (600mg) + L-Theanine (200mg)',
      somaticInstruction: 'Box Breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)',
    },
  },
  {
    id: 'core',
    name: 'Mitochondrial Core & Bio-Electric Potential',
    shortName: 'Mitochondrial Core',
    cx: 100,
    cy: 142,
    cxBack: 100,
    cyBack: 142,
    metricKey: 'cellularVitality',
    metricLabel: 'Cellular Vitality (ATP)',
    normalRangeLabel: '80% - 100%',
    systemName: 'Mitochondrial Electron Transport & Membrane Potential',
    getVal: (bio) => `${bio.cellularVitality}%`,
    isAnomaly: (bio) => bio.cellularVitality < 75,
    statusInfo: (bio) =>
      bio.cellularVitality >= 85
        ? { label: 'CHARGED BIO-ENERGY', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isCritical: false }
        : bio.cellularVitality >= 75
        ? { label: 'BALANCED RESERVE', badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30', isCritical: false }
        : { label: 'ATP FATIGUE ALERT', badgeClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40', isCritical: true },
    recoveryProtocol: {
      solfeggioHz: 285,
      solfeggioTitle: '285 Hz Solfeggio - Quantum Tissue & Cellular Repair',
      herbalRemedy: 'Himalayan Shilajit Resin (500mg) + CoQ10 Ubiquinol (200mg)',
      somaticInstruction: 'Grounded Barefoot Stance & Diaphragmatic Pumping (5 mins)',
    },
  },
  {
    id: 'limbs',
    name: 'Peripheral Musculoskeletal & Arterial Tone',
    shortName: 'Peripheral Limbs',
    cx: 80,
    cy: 205,
    cxBack: 120,
    cyBack: 205,
    metricKey: 'bloodPressure',
    metricLabel: 'Arterial Hemodynamics',
    normalRangeLabel: '120/80 mmHg',
    systemName: 'Vascular Endothelium & Peripheral Capillary Resistance',
    getVal: (bio) => `${bio.bloodPressure} mmHg`,
    isAnomaly: () => false,
    statusInfo: () => ({
      label: 'NORMOTENSIVE TONE',
      badgeClass: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      isCritical: false,
    }),
    recoveryProtocol: {
      solfeggioHz: 174,
      solfeggioTitle: '174 Hz Solfeggio - Natural Anesthetic & Muscle Relief',
      herbalRemedy: 'Aged Black Garlic Extract + Hibiscus Sabdariffa Tea',
      somaticInstruction: 'Suboccipital Neck Stretch & Gentle Calf Isometric Raises',
    },
  },
];

const INITIAL_HISTORY: HistoricalBiometric[] = [
  { timestamp: 'Day 1', heartRate: 78, hrv: 55, neuralCoherence: 75, cellularVitality: 82 },
  { timestamp: 'Day 2', heartRate: 76, hrv: 58, neuralCoherence: 77, cellularVitality: 84 },
  { timestamp: 'Day 3', heartRate: 75, hrv: 60, neuralCoherence: 80, cellularVitality: 86 },
  { timestamp: 'Day 4', heartRate: 73, hrv: 63, neuralCoherence: 82, cellularVitality: 89 },
  { timestamp: 'Today', heartRate: 72, hrv: 65, neuralCoherence: 84, cellularVitality: 91 },
];

interface GoalProgressRingProps {
  label: string;
  unit: string;
  currentVal: number;
  targetVal: number;
  onCurrentChange: (val: number) => void;
  onTargetChange: (val: number) => void;
  onIncrement: (step: number) => void;
  onDecrement: (step: number) => void;
  icon: React.ElementType;
  strokeColor: string;
  glowColor: string;
  badgeColor: string;
  badgeText: string;
  quickStep: number;
  quickLabels: { inc: string; dec: string };
}

const GoalProgressRingCard: React.FC<GoalProgressRingProps> = ({
  label,
  unit,
  currentVal,
  targetVal,
  onCurrentChange,
  onTargetChange,
  onIncrement,
  onDecrement,
  icon: Icon,
  strokeColor,
  glowColor,
  badgeColor,
  badgeText,
  quickStep,
  quickLabels,
}) => {
  const percent = targetVal > 0 ? Math.round(Math.min(100, Math.max(0, (currentVal / targetVal) * 100))) : 0;
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all relative group overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-mono font-bold text-sm text-white">{label}</h4>
            <span className="text-[10px] font-mono text-slate-400">Daily Target Matrix</span>
          </div>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* Animated SVG Progress Ring */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-slate-800/80"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0px 0px 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
          <Icon className="w-4 h-4 mb-0.5 text-white/90 animate-pulse" />
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {percent}%
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 font-semibold">
            {currentVal} / {targetVal} {unit}
          </span>
        </div>
      </div>

      {/* Quick Adjust Buttons & Inputs */}
      <div className="space-y-2.5 pt-2 border-t border-slate-900">
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onDecrement(quickStep)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-lg border border-slate-800 transition-colors flex items-center gap-1"
            title={`Decrease by ${quickStep} ${unit}`}
          >
            <span>-</span>
            <span className="text-[10px] text-slate-500">{quickLabels.dec}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500">Log:</span>
            <input
              type="number"
              value={currentVal}
              onChange={(e) => onCurrentChange(Math.max(0, Number(e.target.value)))}
              className="w-16 bg-transparent text-center text-xs font-mono font-bold text-white focus:outline-none"
            />
            <span className="text-[10px] font-mono text-slate-400">{unit}</span>
          </div>

          <button
            type="button"
            onClick={() => onIncrement(quickStep)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-lg border border-slate-800 transition-colors flex items-center gap-1"
            title={`Increase by ${quickStep} ${unit}`}
          >
            <span>+</span>
            <span className="text-[10px] text-slate-500">{quickLabels.inc}</span>
          </button>
        </div>

        {/* Target Setting Input */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
          <span>Target Goal:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={targetVal}
              onChange={(e) => onTargetChange(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-right text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BiometricsScan: React.FC<BiometricsScanProps> = ({
  biometrics,
  setBiometrics,
  report,
  setReport,
  cloudHistory,
  onNavigateTab,
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localHistory, setLocalHistory] = useState<HistoricalBiometric[]>(INITIAL_HISTORY);
  const [activeMetricTab, setActiveMetricTab] = useState<'neural' | 'vitality' | 'hrv'>('neural');
  const [pushAlert, setPushAlert] = useState<{ title: string; message: string; type: 'warning' | 'success' } | null>({
    title: 'Starfleet Biometric Telemetry',
    message: '7-day trend analysis active. No major physiological anomalies detected.',
    type: 'success',
  });

  // Interactive Quick View Metric Card Granular Detail State
  const [selectedQuickMetric, setSelectedQuickMetric] = useState<QuickMetricKey | null>(null);

  // Biometric Body Map Overlay State
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string>('chest');
  const [bodyMapOrientation, setBodyMapOrientation] = useState<'front' | 'back'>('front');
  const [isBodyMapModalOpen, setIsBodyMapModalOpen] = useState<boolean>(false);

  const activeAnomalies = BODY_REGIONS.filter((r) => r.isAnomaly(biometrics));

  // Clinical Night Mode State (Scotopic High-Contrast Red λ: 630-660nm)
  const [isClinicalNightMode, setIsClinicalNightMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dr_welland_clinical_night_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [nightLuminance, setNightLuminance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dr_welland_night_luminance');
      return saved ? parseInt(saved, 10) : 70;
    } catch {
      return 70;
    }
  });

  const handleToggleNightMode = () => {
    const next = !isClinicalNightMode;
    setIsClinicalNightMode(next);
    try {
      localStorage.setItem('dr_welland_clinical_night_mode', next.toString());
    } catch {}
  };

  const handleLuminanceChange = (val: number) => {
    setNightLuminance(val);
    try {
      localStorage.setItem('dr_welland_night_luminance', val.toString());
    } catch {}
  };

  // Smart Alerts Engine State
  const [smartAlertRules, setSmartAlertRules] = useState<SmartAlertRule[]>(getSavedSmartAlerts());
  const [isRulesManagerOpen, setIsRulesManagerOpen] = useState<boolean>(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Smart Alert Rule Form State
  const [ruleFormMetricKey, setRuleFormMetricKey] = useState<QuickMetricKey>('stressIndex');
  const [ruleFormCondition, setRuleFormCondition] = useState<'lessThan' | 'greaterThan'>('greaterThan');
  const [ruleFormThreshold, setRuleFormThreshold] = useState<number>(50);
  const [ruleFormTitle, setRuleFormTitle] = useState<string>('Custom Biometric Threshold Warning');
  const [ruleFormActionType, setRuleFormActionType] = useState<'mindcare' | 'remedy' | 'both'>('both');
  const [ruleFormMindcareHz, setRuleFormMindcareHz] = useState<number>(528);
  const [ruleFormMindcareTitle, setRuleFormMindcareTitle] = useState<string>('528 Hz Solfeggio Harmonic Alignment');
  const [ruleFormRemedyName, setRuleFormRemedyName] = useState<string>('Organic Adaptogenic Protocol');
  const [ruleFormRemedyDosage, setRuleFormRemedyDosage] = useState<string>('500mg tincture taken with hydration');
  const [ruleFormSomaticExercise, setRuleFormSomaticExercise] = useState<string>('5-minute cardiac vagal breathing exercise');

  // Live Smart Alert Evaluation
  const activeTriggeredAlerts = evaluateSmartAlertRules(biometrics, smartAlertRules).filter(
    (rule) => !dismissedAlertIds.includes(rule.id)
  );

  // Live Voice Speech Synthesis Announcement for Triggered Smart Alerts & Critical Thresholds
  useEffect(() => {
    if (activeTriggeredAlerts.length > 0) {
      const topAlert = activeTriggeredAlerts[0];
      const val = biometrics[topAlert.metricKey as keyof BiometricProfile];
      const spokenRecommendation =
        topAlert.recommendation.somaticExercise ||
        topAlert.recommendation.remedyName ||
        'Immediate grounding protocol recommended.';

      ttsAnnouncer.announceAlert(
        topAlert.customTitle,
        `${topAlert.metricName} registered at ${val}. ${spokenRecommendation}`,
        'critical'
      );
    }
  }, [activeTriggeredAlerts.length, biometrics.heartRate, biometrics.stressIndex, biometrics.oxygenSaturation, biometrics.hrv]);

  const handleSelectBodyRegion = (regionId: string) => {
    setSelectedBodyRegion(regionId);
    const region = BODY_REGIONS.find((r) => r.id === regionId);
    if (region) {
      const hasAnomaly = region.isAnomaly(biometrics);
      const val = region.getVal(biometrics);
      const status = region.statusInfo(biometrics);
      ttsAnnouncer.speak(
        `${region.shortName} target selected. ${region.metricLabel} at ${val}. Status: ${status.label}.`,
        { prefixChime: hasAnomaly }
      );
    }
  };

  const handleToggleRuleEnabled = (id: string) => {
    const updated = smartAlertRules.map((rule) =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    saveSmartAlerts(updated);
    setSmartAlertRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = deleteSmartAlert(id);
    setSmartAlertRules(updated);
  };

  const handleResetDefaultRules = () => {
    const defaults = resetDefaultSmartAlerts();
    setSmartAlertRules(defaults);
    setDismissedAlertIds([]);
  };

  const handleOpenNewRuleForm = () => {
    setEditingRuleId(null);
    setRuleFormMetricKey('stressIndex');
    setRuleFormCondition('greaterThan');
    setRuleFormThreshold(50);
    setRuleFormTitle('Custom Biometric Threshold Warning');
    setRuleFormActionType('both');
    setRuleFormMindcareHz(528);
    setRuleFormMindcareTitle('528 Hz Solfeggio Harmonic Resonance');
    setRuleFormRemedyName('Organic Adaptogenic Herbal Formula');
    setRuleFormRemedyDosage('500mg taken with warm water');
    setRuleFormSomaticExercise('Box Breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)');
    setIsRuleFormOpen(true);
  };

  const handleOpenEditRuleForm = (rule: SmartAlertRule) => {
    setEditingRuleId(rule.id);
    setRuleFormMetricKey(rule.metricKey);
    setRuleFormCondition(rule.condition);
    setRuleFormThreshold(rule.thresholdValue);
    setRuleFormTitle(rule.customTitle);
    setRuleFormActionType(rule.actionType);
    setRuleFormMindcareHz(rule.recommendation.mindcareHz || 528);
    setRuleFormMindcareTitle(rule.recommendation.mindcareTitle || 'Solfeggio Resonance');
    setRuleFormRemedyName(rule.recommendation.remedyName || 'Herbal Prescription');
    setRuleFormRemedyDosage(rule.recommendation.remedyDosage || 'Standard dosage');
    setRuleFormSomaticExercise(rule.recommendation.somaticExercise || 'Vagal breathwork');
    setIsRuleFormOpen(true);
  };

  const handleSaveRule = () => {
    const metricConfig = QUICK_METRICS.find((m) => m.key === ruleFormMetricKey);
    const metricName = metricConfig ? metricConfig.shortName : ruleFormMetricKey;

    const ruleData: Omit<SmartAlertRule, 'id'> = {
      metricKey: ruleFormMetricKey,
      metricName,
      condition: ruleFormCondition,
      thresholdValue: ruleFormThreshold,
      actionType: ruleFormActionType,
      customTitle: ruleFormTitle,
      recommendation: {
        mindcareHz: ruleFormMindcareHz,
        mindcareTitle: ruleFormMindcareTitle,
        remedyName: ruleFormRemedyName,
        remedyDosage: ruleFormRemedyDosage,
        somaticExercise: ruleFormSomaticExercise,
      },
      enabled: true,
    };

    if (editingRuleId) {
      const updatedList = updateSmartAlert({ ...ruleData, id: editingRuleId });
      setSmartAlertRules(updatedList);
    } else {
      addSmartAlert(ruleData);
      setSmartAlertRules(getSavedSmartAlerts());
    }

    setIsRuleFormOpen(false);
    setEditingRuleId(null);
  };

  // Daily Goal Targets & Current Progress State (Hydration, Movement, Sleep)
  const [hydrationCurrent, setHydrationCurrent] = useState<number>(1850); // ml
  const [hydrationTarget, setHydrationTarget] = useState<number>(2500); // ml
  const [movementCurrent, setMovementCurrent] = useState<number>(35); // mins
  const [movementTarget, setMovementTarget] = useState<number>(45); // mins
  const [sleepTarget, setSleepTarget] = useState<number>(8.0); // hrs

  // Daily Subjective Health Journal State
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(getSavedJournalEntries());
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepRecoveryScore, setSleepRecoveryScore] = useState<number>(85);
  const [energyLevel, setEnergyLevel] = useState<number>(8);
  const [mood, setMood] = useState<string>('Calm & Centered');
  const [journalNotes, setJournalNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Restorative Sleep', 'Hydrated']);
  const [showJournalHistory, setShowJournalHistory] = useState<boolean>(false);
  const [journalNotice, setJournalNotice] = useState<string | null>(null);

  const hydrationAchieved = hydrationCurrent >= hydrationTarget;
  const movementAchieved = movementCurrent >= movementTarget;
  const sleepAchieved = sleepHours >= sleepTarget;
  const totalGoalsAchieved = (hydrationAchieved ? 1 : 0) + (movementAchieved ? 1 : 0) + (sleepAchieved ? 1 : 0);

  // Health Pulse Ticker Controls State
  const [isTickerPaused, setIsTickerPaused] = useState<boolean>(false);
  const [isTickerCollapsed, setIsTickerCollapsed] = useState<boolean>(false);

  const recoveryInfo = getSleepRecoveryDescriptor(sleepRecoveryScore);
  const sleepEfficiency = Math.round(
    Math.min(100, Math.max(10, (sleepHours / 8) * (sleepRecoveryScore / 100) * 100))
  );

  // Dynamic Ticker Item Generator for Health Pulse Widget
  interface TickerItem {
    id: string;
    metricKey?: QuickMetricKey;
    severity: 'critical' | 'warning' | 'optimal';
    category: string;
    headline: string;
    detail: string;
  }

  const tickerItems: TickerItem[] = [];

  // 1. Heart Rate Telemetry
  if (biometrics.heartRate < 60) {
    tickerItems.push({
      id: 'hr_low',
      metricKey: 'heartRate',
      severity: 'warning',
      category: 'CARDIO',
      headline: `BRADYCARDIA DETECTED (${biometrics.heartRate} BPM)`,
      detail: 'Resting pulse below 60 BPM; vagotonic sinus pacing.',
    });
  } else if (biometrics.heartRate > 100) {
    tickerItems.push({
      id: 'hr_high',
      metricKey: 'heartRate',
      severity: 'critical',
      category: 'CARDIO',
      headline: `TACHYCARDIA ALERT (${biometrics.heartRate} BPM)`,
      detail: 'Resting pulse exceeding 100 BPM threshold. Sympathetic arousal.',
    });
  } else {
    tickerItems.push({
      id: 'hr_opt',
      metricKey: 'heartRate',
      severity: 'optimal',
      category: 'CARDIO',
      headline: `CARDIO FREQUENCY (${biometrics.heartRate} BPM)`,
      detail: 'Optimal sinus rhythm and low myocardial workload.',
    });
  }

  // 2. HRV Telemetry
  if (biometrics.hrv < 40) {
    tickerItems.push({
      id: 'hrv_low',
      metricKey: 'hrv',
      severity: 'critical',
      category: 'AUTONOMIC',
      headline: `SUPPRESSED HRV (${biometrics.hrv} ms)`,
      detail: 'Parasympathetic vagal tone severely depleted. Grounding advised.',
    });
  } else {
    tickerItems.push({
      id: 'hrv_opt',
      metricKey: 'hrv',
      severity: 'optimal',
      category: 'AUTONOMIC',
      headline: `HRV RESILIENCE (${biometrics.hrv} ms)`,
      detail: 'High autonomic flexibility and stress-buffering capacity.',
    });
  }

  // 3. Neural Coherence
  if (biometrics.neuralCoherence < 70) {
    tickerItems.push({
      id: 'nc_low',
      metricKey: 'neuralCoherence',
      severity: 'warning',
      category: 'NEURAL',
      headline: `NEURAL DESYNC (${biometrics.neuralCoherence}%)`,
      detail: 'Brainwave coherence suboptimal. Solfeggio tuning recommended.',
    });
  } else {
    tickerItems.push({
      id: 'nc_opt',
      metricKey: 'neuralCoherence',
      severity: 'optimal',
      category: 'NEURAL',
      headline: `NEURAL COHERENCE (${biometrics.neuralCoherence}%)`,
      detail: 'Alpha-Theta brainwave synchronization in flow state.',
    });
  }

  // 4. Cellular Vitality
  if (biometrics.cellularVitality < 75) {
    tickerItems.push({
      id: 'cv_low',
      metricKey: 'cellularVitality',
      severity: 'warning',
      category: 'CELLULAR',
      headline: `ATP DEPLETION (${biometrics.cellularVitality}%)`,
      detail: 'Mitochondrial membrane proton potential sub-threshold.',
    });
  } else {
    tickerItems.push({
      id: 'cv_opt',
      metricKey: 'cellularVitality',
      severity: 'optimal',
      category: 'CELLULAR',
      headline: `CELLULAR VITALITY (${biometrics.cellularVitality}%)`,
      detail: 'Charged bio-electric potential & mitochondrial ATP output.',
    });
  }

  // 5. Stress Load
  if (biometrics.stressIndex > 50) {
    tickerItems.push({
      id: 'stress_high',
      metricKey: 'stressIndex',
      severity: 'warning',
      category: 'STRESS',
      headline: `SYMPATHETIC SURGE (${biometrics.stressIndex}%)`,
      detail: 'HPA axis tension elevated. Perform 4-count box breathing.',
    });
  } else {
    tickerItems.push({
      id: 'stress_low',
      metricKey: 'stressIndex',
      severity: 'optimal',
      category: 'STRESS',
      headline: `STRESS BURDEN (${biometrics.stressIndex}%)`,
      detail: 'Low sympathetic burden; restorative parasympathetic tone active.',
    });
  }

  // 6. Pulse Oximetry
  if (biometrics.oxygenSaturation < 95) {
    tickerItems.push({
      id: 'spo2_low',
      metricKey: 'oxygenSaturation',
      severity: 'warning',
      category: 'OXYGEN',
      headline: `PULSE OX WARNING (${biometrics.oxygenSaturation}%)`,
      detail: 'Peripheral oxygen saturation low. Practice deep inhalations.',
    });
  } else {
    tickerItems.push({
      id: 'spo2_opt',
      metricKey: 'oxygenSaturation',
      severity: 'optimal',
      category: 'OXYGEN',
      headline: `OXYGEN SATURATION (${biometrics.oxygenSaturation}%)`,
      detail: 'Full alveolar-capillary oxygen diffusion.',
    });
  }

  // 7. Hydration Goal Progress
  if (hydrationCurrent < hydrationTarget) {
    tickerItems.push({
      id: 'hydro_need',
      severity: 'warning',
      category: 'HYDRATION',
      headline: `HYDRATION PROGRESS (${hydrationCurrent}/${hydrationTarget} ml)`,
      detail: `${hydrationTarget - hydrationCurrent} ml remaining for full intracellular saturation.`,
    });
  } else {
    tickerItems.push({
      id: 'hydro_done',
      severity: 'optimal',
      category: 'HYDRATION',
      headline: `HYDRATION COMPLETED (${hydrationCurrent} ml)`,
      detail: 'Intracellular fluid and electrolytic balance fully optimal.',
    });
  }

  // 8. Sleep & Recovery
  tickerItems.push({
    id: 'sleep_pulse',
    severity: sleepHours >= sleepTarget && sleepRecoveryScore >= 75 ? 'optimal' : 'warning',
    category: 'SLEEP',
    headline: `SLEEP RECOVERY (${sleepHours}h • ${sleepRecoveryScore}% REC)`,
    detail: `Vagal efficiency index at ${sleepEfficiency}%. ${recoveryInfo.label}.`,
  });

  // 9. Diagnostic Report Status
  if (report) {
    tickerItems.push({
      id: 'ai_triage',
      severity: report.triageLevel.includes('OPTIMAL') ? 'optimal' : 'warning',
      category: 'AI TRIAGE',
      headline: `STATUS: ${report.triageLevel}`,
      detail: `Vitality rating: ${report.overallVitality}/100. Tone: ${report.recommendedSolfeggioHz} Hz.`,
    });
  }

  const availableTags = [
    'Restorative Sleep',
    'Short Sleep',
    'Mental Clarity',
    'Brain Fog',
    'Cervical Stiffness',
    'Deep Calm',
    'High Stress',
    'Hydrated',
    'Caffeine Intake',
    'Fasting',
    'Adaptogens Taken',
    'Post-Workout',
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveJournalEntry = () => {
    const updated = addJournalEntry({
      date: new Date().toISOString(),
      sleepQuality,
      sleepHours,
      sleepRecoveryScore,
      energyLevel,
      mood,
      notes: journalNotes,
      tags: selectedTags,
      syncedBiometrics: {
        heartRate: biometrics.heartRate,
        hrv: biometrics.hrv,
        neuralCoherence: biometrics.neuralCoherence,
        cellularVitality: biometrics.cellularVitality,
        stressIndex: biometrics.stressIndex,
      },
    });
    setJournalEntries(updated);
    setJournalNotice('Daily journal entry saved to local & cloud health record!');
    setTimeout(() => setJournalNotice(null), 3500);
  };

  const handleDeleteJournal = (id: string) => {
    const updated = deleteJournalEntry(id);
    setJournalEntries(updated);
  };

  const handleLoadJournalEntry = (entry: DailyJournalEntry) => {
    setSleepQuality(entry.sleepQuality);
    setSleepHours(entry.sleepHours);
    if (entry.sleepRecoveryScore !== undefined) {
      setSleepRecoveryScore(entry.sleepRecoveryScore);
    }
    setEnergyLevel(entry.energyLevel);
    setMood(entry.mood);
    setJournalNotes(entry.notes);
    setSelectedTags(entry.tags);
    setJournalNotice(`Loaded journal record from ${new Date(entry.date).toLocaleDateString()}`);
    setTimeout(() => setJournalNotice(null), 3000);
  };

  // Target goals state
  const [targets, setTargets] = useState({
    targetHeartRate: 70,
    targetHrv: 80,
    targetNeural: 95,
    targetVitality: 95,
  });

  const activeMetricConfig = QUICK_METRICS.find((m) => m.key === selectedQuickMetric);
  const activeCurrentVal = selectedQuickMetric ? biometrics[selectedQuickMetric] : null;
  const activeStatus =
    activeMetricConfig && activeCurrentVal !== null
      ? activeMetricConfig.status(activeCurrentVal)
      : { label: '', badge: '' };

  const handlePrevMetric = () => {
    if (!selectedQuickMetric) return;
    const curIdx = QUICK_METRICS.findIndex((m) => m.key === selectedQuickMetric);
    const newIdx = (curIdx - 1 + QUICK_METRICS.length) % QUICK_METRICS.length;
    setSelectedQuickMetric(QUICK_METRICS[newIdx].key);
  };

  const handleNextMetric = () => {
    if (!selectedQuickMetric) return;
    const curIdx = QUICK_METRICS.findIndex((m) => m.key === selectedQuickMetric);
    const newIdx = (curIdx + 1) % QUICK_METRICS.length;
    setSelectedQuickMetric(QUICK_METRICS[newIdx].key);
  };

  const history = cloudHistory && cloudHistory.length > 0
    ? cloudHistory.map((item, idx) => ({
        timestamp: `Cloud ${idx + 1}`,
        heartRate: item.heartRate,
        hrv: item.hrv,
        neuralCoherence: item.neuralCoherence,
        cellularVitality: item.cellularVitality,
        stressIndex: item.stressIndex || 30,
      }))
    : localHistory;

  // Simulation Toggles State for 7-Day Future Trends Engine
  const [simHydration, setSimHydration] = useState<boolean>(true);
  const [simMindcare, setSimMindcare] = useState<boolean>(true);
  const [simSleep, setSimSleep] = useState<boolean>(true);
  const [simRemedies, setSimRemedies] = useState<boolean>(true);
  const [selectedFutureMetric, setSelectedFutureMetric] = useState<
    'hrv' | 'stressIndex' | 'cellularVitality' | 'neuralCoherence' | 'heartRate'
  >('hrv');

  // 7-Day Future Trajectory Calculation Engine
  const calculateFutureProjections = () => {
    const pts = history.length;
    const firstPt = history[0] || { heartRate: 75, hrv: 55, neuralCoherence: 75, cellularVitality: 82, stressIndex: 35 };
    const lastPt = history[pts - 1] || {
      heartRate: biometrics.heartRate,
      hrv: biometrics.hrv,
      neuralCoherence: biometrics.neuralCoherence,
      cellularVitality: biometrics.cellularVitality,
      stressIndex: biometrics.stressIndex,
    };

    const baseHrvSlope = pts > 1 ? (lastPt.hrv - firstPt.hrv) / (pts - 1) : 1.5;
    const baseStressSlope = pts > 1 ? (((lastPt as any).stressIndex || biometrics.stressIndex) - ((firstPt as any).stressIndex || 35)) / (pts - 1) : -1.2;
    const baseNeuralSlope = pts > 1 ? (lastPt.neuralCoherence - firstPt.neuralCoherence) / (pts - 1) : 1.2;
    const baseVitalitySlope = pts > 1 ? (lastPt.cellularVitality - firstPt.cellularVitality) / (pts - 1) : 1.4;
    const baseHrSlope = pts > 1 ? (lastPt.heartRate - firstPt.heartRate) / (pts - 1) : -0.8;

    const modHrv = (simHydration ? 1.2 : 0) + (simSleep ? 1.5 : 0) + (simRemedies ? 1.0 : 0) + (simMindcare ? 0.8 : 0);
    const modStress = (simMindcare ? -2.2 : 0) + (simSleep ? -1.5 : 0) + (simHydration ? -0.8 : 0) + (simRemedies ? -1.0 : 0);
    const modNeural = (simMindcare ? 1.5 : 0) + (simSleep ? 1.2 : 0) + (simRemedies ? 0.8 : 0);
    const modVitality = (simHydration ? 1.5 : 0) + (simSleep ? 1.8 : 0) + (simRemedies ? 1.2 : 0);
    const modHr = (simSleep ? -1.2 : 0) + (simMindcare ? -0.8 : 0) + (simHydration ? -0.5 : 0);

    const netHrvSlope = Math.max(0.2, baseHrvSlope + modHrv * 0.4);
    const netStressSlope = Math.min(-0.2, baseStressSlope + modStress * 0.4);
    const netNeuralSlope = Math.max(0.2, baseNeuralSlope + modNeural * 0.4);
    const netVitalitySlope = Math.max(0.2, baseVitalitySlope + modVitality * 0.4);
    const netHrSlope = Math.min(-0.1, baseHrSlope + modHr * 0.3);

    const projectedDays: any[] = [];
    const today = new Date();

    const chartCombinedPoints = history.map((h, i) => ({
      timestamp: h.timestamp || `Baseline ${i + 1}`,
      isForecast: false,
      heartRate: h.heartRate,
      hrv: h.hrv,
      neuralCoherence: h.neuralCoherence,
      cellularVitality: h.cellularVitality,
      stressIndex: (h as any).stressIndex || biometrics.stressIndex,
    }));

    for (let day = 1; day <= 7; day++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + day);
      const dateLabel = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const projectedHrv = Math.min(115, Math.max(25, Math.round(biometrics.hrv + netHrvSlope * day)));
      const projectedStress = Math.min(90, Math.max(8, Math.round(biometrics.stressIndex + netStressSlope * day)));
      const projectedNeural = Math.min(100, Math.max(50, Math.round(biometrics.neuralCoherence + netNeuralSlope * day)));
      const projectedVitality = Math.min(100, Math.max(50, Math.round(biometrics.cellularVitality + netVitalitySlope * day)));
      const projectedHr = Math.min(120, Math.max(52, Math.round(biometrics.heartRate + netHrSlope * day)));

      const forecastPoint = {
        dayOffset: `+${day}d`,
        dateLabel,
        timestamp: dateLabel,
        isForecast: true,
        heartRate: projectedHr,
        hrv: projectedHrv,
        neuralCoherence: projectedNeural,
        cellularVitality: projectedVitality,
        stressIndex: projectedStress,
      };

      projectedDays.push(forecastPoint);
      chartCombinedPoints.push(forecastPoint);
    }

    return {
      projectedDays,
      chartCombinedPoints,
      netHrvSlope,
      netStressSlope,
      netNeuralSlope,
      netVitalitySlope,
      netHrSlope,
      usingCloud: Boolean(cloudHistory && cloudHistory.length > 0),
    };
  };

  const futureProjectionData = calculateFutureProjections();

  // Threshold evaluations
  const warnings: string[] = [];
  if (biometrics.heartRate < 60) warnings.push('Bradycardia Warning: Heart Rate below 60 BPM.');
  if (biometrics.heartRate > 100) warnings.push('Tachycardia Warning: Heart Rate exceeds 100 BPM.');
  if (biometrics.hrv < 40) warnings.push('Low HRV Warning: Autonomic nervous system recovery needed (< 40 ms).');
  if (biometrics.neuralCoherence < 70) warnings.push('Neural Coherence Alert: Brainwave sync suboptimal (< 70%).');
  if (biometrics.cellularVitality < 75) warnings.push('Cellular Fatigue Alert: Mitochondrial output compromised (< 75%).');

  const handleRunTrendAudit = () => {
    const hrValues = history.map((h) => h.heartRate);
    const avgHr = hrValues.reduce((a, b) => a + b, 0) / hrValues.length;
    const currentHr = biometrics.heartRate;
    const deviation = Math.abs(currentHr - avgHr);

    if (deviation > 10 || biometrics.neuralCoherence < 75) {
      setPushAlert({
        title: 'Significant 7-Day Biometric Deviation Detected',
        message: `Heart rate or neural coherence has shifted by ${deviation.toFixed(1)} units from baseline over the past 7 days. Dr. Welland-Strong recommends immediate grounding protocols.`,
        type: 'warning',
      });
    } else {
      setPushAlert({
        title: '7-Day Trend Audit Complete',
        message: `All biometrics remain within stable +/- 5% deviation limits compared to your 7-day baseline.`,
        type: 'success',
      });
    }
  };

  const handleRunDiagnosis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    try {
      const activeJournalPayload: Partial<DailyJournalEntry> = {
        sleepQuality,
        sleepHours,
        sleepRecoveryScore,
        energyLevel,
        mood,
        notes: journalNotes,
        tags: selectedTags,
      };

      const res = await fetchDiagnosis(
        biometrics,
        symptoms || 'Comprehensive Starfleet Full Spectrum Scan with Subjective Journal Context',
        journalNotes,
        activeJournalPayload
      );
      setReport(res);

      const nowLabel = `Scan ${localHistory.length + 1}`;
      setLocalHistory((prev) => [
        ...prev,
        {
          timestamp: nowLabel,
          heartRate: biometrics.heartRate,
          hrv: biometrics.hrv,
          neuralCoherence: biometrics.neuralCoherence,
          cellularVitality: biometrics.cellularVitality,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportReport = () => {
    if (!report) return;

    const latestJournal = journalEntries[0];
    const journalExportSection = latestJournal
      ? `
[DAILY SUBJECTIVE HEALTH JOURNAL]
- Recorded: ${new Date(latestJournal.date).toLocaleString()}
- Sleep Quality: ${latestJournal.sleepQuality}/5 (${getSleepQualityLabel(latestJournal.sleepQuality).label} - ${latestJournal.sleepHours} hrs)
- Perceived Energy: ${latestJournal.energyLevel}/10 (${getEnergyLevelDescriptor(latestJournal.energyLevel).label})
- Mood / Tone: ${latestJournal.mood}
- Subjective Notes: ${latestJournal.notes || 'None'}
- Clinical Tags: ${latestJournal.tags.join(', ') || 'None'}
`
      : '';

    const reportContent = `
========================================
DR. WELLAND-STRONG // STARFLEET MEDICAL REPORT
Generated: ${new Date().toLocaleString()}
========================================

[PATIENT BIOMETRICS]
- Heart Rate: ${biometrics.heartRate} BPM (Target: ${targets.targetHeartRate})
- HRV (RMSSD): ${biometrics.hrv} ms (Target: ${targets.targetHrv})
- Neural Coherence: ${biometrics.neuralCoherence}% (Target: ${targets.targetNeural}%)
- Cellular Vitality: ${biometrics.cellularVitality}% (Target: ${targets.targetVitality}%)
${journalExportSection}
[DIAGNOSTIC STATUS]
- Triage Level: ${report.triageLevel}
- Overall Vitality Score: ${report.overallVitality}/100

[ORGAN & SYSTEM MATRIX]
${report.systems.map((s) => `- ${s.name}: ${s.score}% (${s.status}) - ${s.notes}`).join('\n')}

[ROOT CAUSE ANALYSIS]
${report.rootCauseAnalysis}

[CORRECTIVE PROTOCOL]
${report.correctiveProtocol.map((p, i) => `${i + 1}. ${p}`).join('\n')}

- Recommended Solfeggio Tone: ${report.recommendedSolfeggioHz} Hz

========================================
End of Starfleet Medical Record
========================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dr_Welland_Strong_Medical_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-6 py-8 space-y-8 ${isClinicalNightMode ? 'scotopic-clinical-night' : ''}`}
      style={isClinicalNightMode ? { filter: `brightness(${nightLuminance}%)` } : undefined}
    >
      {/* Clinical Night Mode Scotopic Banner */}
      {isClinicalNightMode && (
        <div className="bg-red-950/90 border border-red-600/70 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/60 flex items-center justify-center text-red-300 shrink-0">
              <Moon className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-300 uppercase tracking-widest text-xs">
                  CLINICAL NIGHT MODE ENGAGED // SCOTOPIC RED SPECTRUM (λ ~ 650nm)
                </span>
                <span className="px-2 py-0.5 bg-red-600 text-black text-[9px] font-bold rounded">
                  0% BLUE LIGHT
                </span>
              </div>
              <p className="text-[11px] text-red-400/90 mt-0.5">
                Rhodopsin rod-photoreceptor preservation active. High-contrast deep red spectrum protects natural melatonin synthesis in low-light sleep environments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            {/* Screen Brightness / Dimmer Slider */}
            <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-xl border border-red-800">
              <Sun className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] text-red-300 font-bold">Luminance:</span>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={nightLuminance}
                onChange={(e) => handleLuminanceChange(parseInt(e.target.value, 10))}
                className="w-20 accent-red-500 cursor-pointer"
                title="Adjust scotopic screen brightness"
              />
              <span className="text-[10px] font-bold text-red-200 w-8 text-right">{nightLuminance}%</span>
            </div>

            <button
              type="button"
              onClick={handleToggleNightMode}
              className="px-3.5 py-1.5 bg-black/80 hover:bg-black text-red-300 hover:text-white rounded-xl border border-red-700/60 transition-colors font-bold cursor-pointer"
            >
              Exit Night Mode
            </button>
          </div>
        </div>
      )}

      {/* Hero Intro */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>QUANTUM BIO-RESONANCE SCANNER ACTIVE</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesManagerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all font-mono text-xs shadow-sm cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>SMART ALERTS</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-[10px] text-purple-200 font-bold">
                  {smartAlertRules.filter((r) => r.enabled).length} ACTIVE
                </span>
                {activeTriggeredAlerts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
              Full Spectrum Biometrics & 6-Axis Vitality Radar
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              D3.js radar chart visualization displaying balance across neural coherence, HRV, cellular vitality, and cardiovascular equilibrium.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleNightMode}
              className={`px-4 py-2.5 font-mono font-bold text-xs rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                isClinicalNightMode
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-950/70'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
              }`}
              title="Toggle Clinical Scotopic Red Night Mode (650nm) for low-light sleep environments"
            >
              <Moon className="w-4 h-4 text-rose-400" />
              <span>Night Mode</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                isClinicalNightMode ? 'bg-black text-rose-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {isClinicalNightMode ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsBodyMapModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer border border-cyan-400/30"
            >
              <Eye className="w-4 h-4 text-slate-950" />
              <span>3D Body Map</span>
              {activeAnomalies.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-bold animate-pulse">
                  {activeAnomalies.length} RECOVERY
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('biometric-archive-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-cyan-400" />
              <span>Biometric Archive</span>
            </button>
            <button
              onClick={() => setIsRulesManagerOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer border border-purple-400/30"
            >
              <Sliders className="w-4 h-4 text-purple-200" />
              <span>Configure Smart Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Speech Synthesis Telemetry Control HUD */}
      <VoiceTelemetryControl biometrics={biometrics} report={report} />

      {/* Triggered Smart Alerts Section */}
      {activeTriggeredAlerts.length > 0 && (
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-rose-300 uppercase tracking-wide">
                    AUTOMATED SMART ALERT TRIGGERED ({activeTriggeredAlerts.length})
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-200 uppercase font-bold">
                    ACTION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Biometric threshold crossed. MindCare harmonic frequency & natural remedy recommendations active.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRulesManagerOpen(true)}
              className="text-xs font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manage Rules</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTriggeredAlerts.map((alert) => {
              const currentMetricValue = biometrics[alert.metricKey as keyof BiometricProfile];
              return (
                <div
                  key={alert.id}
                  className="bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-4 space-y-3 relative group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                        <span>{alert.customTitle}</span>
                      </div>
                      <div className="text-xs font-mono text-rose-300/90 flex items-center gap-2">
                        <span>
                          {alert.metricName}: <strong className="text-white">{currentMetricValue}</strong>
                        </span>
                        <span className="text-slate-500">
                          (Threshold: {alert.condition === 'greaterThan' ? '>' : '<'} {alert.thresholdValue})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissedAlertIds((prev) => [...prev, alert.id])}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
                      title="Dismiss alert for session"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recommendation Details */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2 text-xs font-mono">
                    {alert.recommendation.mindcareTitle && (
                      <div className="flex items-start gap-2 text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-purple-400 font-bold">MindCare Frequency:</span>{' '}
                          {alert.recommendation.mindcareTitle}
                        </div>
                      </div>
                    )}
                    {alert.recommendation.remedyName && (
                      <div className="flex items-start gap-2 text-emerald-300">
                        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-emerald-400 font-bold">Natural Remedy:</span>{' '}
                          {alert.recommendation.remedyName} ({alert.recommendation.remedyDosage})
                        </div>
                      </div>
                    )}
                    {alert.recommendation.somaticExercise && (
                      <div className="flex items-start gap-2 text-cyan-300">
                        <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-cyan-400 font-bold">Somatic Exercise:</span>{' '}
                          {alert.recommendation.somaticExercise}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {(alert.actionType === 'mindcare' || alert.actionType === 'both') && (
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('mindcare');
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Engage MindCare ({alert.recommendation.mindcareHz || 528}Hz)</span>
                      </button>
                    )}
                    {(alert.actionType === 'remedy' || alert.actionType === 'both') && (
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('remedies');
                        }}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Prescribe Remedy</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Push Notification Alert Banner */}
      {pushAlert && (
        <div className={`border rounded-2xl p-5 flex items-start justify-between gap-4 transition-all ${pushAlert.type === 'warning' ? 'bg-amber-950/40 border-amber-500/40 animate-pulse' : 'bg-cyan-950/40 border-cyan-500/40'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${pushAlert.type === 'warning' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className={`font-mono font-bold text-sm ${pushAlert.type === 'warning' ? 'text-amber-300' : 'text-cyan-300'}`}>
                {pushAlert.title}
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">{pushAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setPushAlert(null)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cloud Sync Status Notice */}
      {cloudHistory && cloudHistory.length > 0 && (
        <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="font-mono text-xs text-cyan-200">
              Cloud Sync Active: Displaying {cloudHistory.length} health trend record(s) fetched securely from your Firestore database.
            </div>
          </div>
          <button
            onClick={handleRunTrendAudit}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            Run 7-Day Trend Audit
          </button>
        </div>
      )}

      {/* Threshold Warning Banner if any metric out of range */}
      {warnings.length > 0 ? (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="font-mono font-bold text-amber-300 text-sm">BIOMETRIC THRESHOLD ALERTS DETECTED</div>
            <ul className="space-y-1">
              {warnings.map((w, idx) => (
                <li key={idx} className="text-xs font-mono text-amber-200/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xs text-emerald-300">
            All active biometric parameters are within optimal healthy thresholds. System equilibrium stable.
          </div>
        </div>
      )}

      {/* Series of Small, Interactive 'Quick View' Metric Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
              QUICK VIEW TELEMETRY // REAL-TIME VITAL SENSORS
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Click any sensor card for granular diagnostics, clinical targets & restorative protocols
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {QUICK_METRICS.map((m) => {
            const Icon = m.icon;
            const currentVal = biometrics[m.key as keyof BiometricProfile];
            const statusInfo = m.status(currentVal);

            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedQuickMetric(m.key)}
                className={`group relative bg-slate-900/90 border ${m.borderColor} rounded-xl p-3.5 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between text-left focus:outline-none focus:ring-1 focus:ring-cyan-500`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-lg ${m.bgGlow} border border-white/5 flex items-center justify-center shrink-0 transition-colors`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {m.channel}
                  </span>
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <div className="text-[11px] font-mono font-medium text-slate-400 truncate">
                    {m.shortName}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-mono font-bold tracking-tight text-white">
                      {currentVal}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.unit}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between w-full">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusInfo.badge}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center gap-0.5">
                    <span>Detail</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Biometric Body Map 3D Anatomical Recovery Section */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>BIOMETRIC BODY MAP // 3D ANATOMICAL RECOVERY OVERLAY</span>
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Interactive 3D anatomical avatar mapping metric anomalies to body regions requiring targeted recovery protocols
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Rotation Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setBodyMapOrientation('front')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  bodyMapOrientation === 'front' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Front View
              </button>
              <button
                type="button"
                onClick={() => setBodyMapOrientation('back')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  bodyMapOrientation === 'back' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Back View
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsBodyMapModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen Console</span>
            </button>
          </div>
        </div>

        {/* Body Map Grid (Left: 3D Anatomical Avatar, Right: Region Details & Recovery Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: 3D Anatomical SVG Avatar Display */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative min-h-[380px]">
            {/* Grid Backdrop Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            <div className="relative w-60 h-80 flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 200 280">
                {/* Hologram Ring Base */}
                <ellipse cx="100" cy="265" rx="75" ry="12" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '20s' }} />
                <ellipse cx="100" cy="265" rx="55" ry="8" fill="none" stroke="#a855f7" strokeWidth="1" />

                {/* Body Silhouette Contours */}
                {/* Head */}
                <ellipse cx="100" cy="28" rx="18" ry="22" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                {/* Neck */}
                <path d="M92 48 L92 58 L108 58 L108 48 Z" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                {/* Torso */}
                <path d="M68 62 Q100 56 132 62 L122 155 Q100 162 78 155 Z" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                {/* Left Arm */}
                <path d="M68 62 L48 135 L56 138 L75 72" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                {/* Right Arm */}
                <path d="M132 62 L152 135 L144 138 L125 72" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                {/* Left Leg */}
                <path d="M82 155 L75 250 L88 250 L95 158" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                {/* Right Leg */}
                <path d="M118 155 L125 250 L112 250 L105 158" fill="none" stroke="#22d3ee" strokeWidth="1.2" />

                {/* Hotspots */}
                {BODY_REGIONS.map((region) => {
                  const isSelected = selectedBodyRegion === region.id;
                  const hasAnomaly = region.isAnomaly(biometrics);
                  const cx = bodyMapOrientation === 'back' && region.cxBack ? region.cxBack : region.cx;
                  const cy = bodyMapOrientation === 'back' && region.cyBack ? region.cyBack : region.cy;

                  return (
                    <g
                      key={region.id}
                      onClick={() => setSelectedBodyRegion(region.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Halo for Anomaly */}
                      {hasAnomaly && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="14"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          className="animate-ping opacity-75"
                        />
                      )}

                      {/* Hotspot Outer Ring */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 10 : 7}
                        fill={hasAnomaly ? 'rgba(244, 63, 94, 0.25)' : isSelected ? 'rgba(34, 211, 238, 0.3)' : 'rgba(15, 23, 42, 0.6)'}
                        stroke={hasAnomaly ? '#f43f5e' : isSelected ? '#22d3ee' : '#64748b'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-200 group-hover:scale-125"
                      />

                      {/* Hotspot Inner Dot */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="3"
                        fill={hasAnomaly ? '#f43f5e' : isSelected ? '#22d3ee' : '#38bdf8'}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Anomaly / Recovery
              </span>
            </div>
          </div>

          {/* Right Column: Body Region Breakdown & Recovery Protocol Card */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Region Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {BODY_REGIONS.map((region) => {
                const isSelected = selectedBodyRegion === region.id;
                const hasAnomaly = region.isAnomaly(biometrics);

                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedBodyRegion(region.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/50'
                        : hasAnomaly
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{region.shortName}</span>
                    {hasAnomaly && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Active Selected Region Detail Card */}
            {(() => {
              const activeRegion = BODY_REGIONS.find((r) => r.id === selectedBodyRegion) || BODY_REGIONS[0];
              const status = activeRegion.statusInfo(biometrics);
              const val = activeRegion.getVal(biometrics);
              const isAnomaly = activeRegion.isAnomaly(biometrics);

              return (
                <div
                  className={`bg-slate-950/90 border rounded-xl p-5 space-y-4 transition-all shadow-xl ${
                    isAnomaly ? 'border-rose-500/50 shadow-rose-950/30' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                        ANATOMICAL TARGET // {activeRegion.systemName}
                      </span>
                      <h4 className="text-lg font-mono font-bold text-white mt-0.5">
                        {activeRegion.name}
                      </h4>
                    </div>

                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${status.badgeClass}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">LIVE REGION METRIC</span>
                      <span className="text-sm font-bold text-white">{val}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">HEALTHY BENCHMARK</span>
                      <span className="text-sm font-bold text-cyan-300">{activeRegion.normalRangeLabel}</span>
                    </div>
                  </div>

                  {/* Target Recovery Protocol Box */}
                  <div className="space-y-2 bg-slate-900/80 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                    <span className="text-purple-300 font-bold uppercase block text-[11px]">
                      RECOMMENDED REGION RECOVERY PROTOCOL
                    </span>

                    <div className="space-y-1.5 text-slate-300">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-purple-400">Harmonic Frequency:</strong> {activeRegion.recoveryProtocol.solfeggioTitle}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-400">Natural Herb Prescription:</strong> {activeRegion.recoveryProtocol.herbalRemedy}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-cyan-400">Somatic Exercise:</strong> {activeRegion.recoveryProtocol.somaticInstruction}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('mindcare');
                      }}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Engage {activeRegion.recoveryProtocol.solfeggioHz}Hz Soundscape</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('remedies');
                      }}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Prescribe Region Remedy</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Granular Detail Panel Modal */}
      {selectedQuickMetric && activeMetricConfig && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedQuickMetric(null)}
        >
          <div
            className="max-w-2xl w-full bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${activeMetricConfig.bgGlow} border border-white/10 flex items-center justify-center shrink-0`}
                >
                  {React.createElement(activeMetricConfig.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      {activeMetricConfig.channel} // {activeMetricConfig.system}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-mono text-white mt-1">
                    {activeMetricConfig.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuickMetric(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close granular view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Reading & Calibration Section */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-slate-400">Current Sensor Telemetry</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-mono font-bold text-white">
                      {biometrics[activeMetricConfig.key as keyof BiometricProfile]}
                    </span>
                    <span className="text-sm font-mono text-slate-400">{activeMetricConfig.unit}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ml-2 ${activeStatus.badge}`}>
                      {activeStatus.label}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-1">
                  <div>Normal Range: <span className="text-slate-200">{activeMetricConfig.normalRange}</span></div>
                  {activeMetricConfig.targetKey && (
                    <div>
                      Starfleet Target:{' '}
                      <span className="text-cyan-300">
                        {targets[activeMetricConfig.targetKey]} {activeMetricConfig.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Calibration Slider */}
              {activeMetricConfig.key !== 'bloodPressure' && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Adjust & Calibrate Sensor Reading
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {biometrics[activeMetricConfig.key as keyof BiometricProfile]} {activeMetricConfig.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={activeMetricConfig.min}
                    max={activeMetricConfig.max}
                    value={Number(biometrics[activeMetricConfig.key as keyof BiometricProfile])}
                    onChange={(e) =>
                      setBiometrics({
                        ...biometrics,
                        [activeMetricConfig.key]: Number(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{activeMetricConfig.min} {activeMetricConfig.unit}</span>
                    <span>Midpoint: {Math.round((activeMetricConfig.min + activeMetricConfig.max) / 2)} {activeMetricConfig.unit}</span>
                    <span>{activeMetricConfig.max} {activeMetricConfig.unit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic Interpretation & Physiological Mechanism */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>DIAGNOSTIC INTERPRETATION</span>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {activeMetricConfig.interpretation(biometrics[activeMetricConfig.key as keyof BiometricProfile])}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>PHYSIOLOGICAL PATHWAY</span>
                </div>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  {activeMetricConfig.physiology}
                </p>
              </div>
            </div>

            {/* Clinical Significance */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>CLINICAL & HOLISTIC SIGNIFICANCE</span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {activeMetricConfig.clinicalSignificance}
              </p>
            </div>

            {/* Restorative Protocol Recommendations */}
            <div className="border border-cyan-500/30 bg-cyan-950/20 rounded-xl p-4 space-y-3">
              <div className="font-mono font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>RECOMMENDED STARFLEET RESTORATIVE PROTOCOL</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Botanical Remedy</span>
                  <span className="text-slate-200 font-bold block">{activeMetricConfig.remedy}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Harmonic Tone</span>
                  <span className="text-cyan-300 font-bold block">{activeMetricConfig.frequencyHz} Hz Solfeggio</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Somatic Exercise</span>
                  <span className="text-purple-300 font-bold block">{activeMetricConfig.somaticExercise}</span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevMetric}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Channel</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuickMetric(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs rounded-xl transition-colors"
              >
                Close Granular View
              </button>

              <button
                type="button"
                onClick={handleNextMetric}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Next Channel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Journal History Modal */}
      {showJournalHistory && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowJournalHistory(false)}
        >
          <div
            className="max-w-2xl w-full bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono text-white">Daily Journal History</h3>
                  <p className="text-xs font-mono text-slate-400">Chronological subjective records & synced biometrics</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJournalHistory(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close history modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {journalEntries.length === 0 ? (
                <div className="text-center py-8 font-mono text-xs text-slate-500">
                  No subjective journal records saved yet.
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="font-mono text-xs font-bold text-white">
                          {new Date(entry.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {entry.mood}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleLoadJournalEntry(entry);
                            setShowJournalHistory(false);
                          }}
                          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors border border-purple-500/30"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Load into Active Scan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJournal(entry.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">Sleep & Recovery</span>
                        <span className="text-indigo-300 font-bold">{entry.sleepQuality}★ ({entry.sleepHours}h • {entry.sleepRecoveryScore ?? 80}% Rec)</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">Perceived Energy</span>
                        <span className="text-amber-300 font-bold">{entry.energyLevel}/10</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-500 block">Synced Vitality</span>
                        <span className="text-cyan-300 font-bold">
                          {entry.syncedBiometrics?.cellularVitality ? `${entry.syncedBiometrics.cellularVitality}% ATP` : 'Live Synced'}
                        </span>
                      </div>
                    </div>

                    {entry.notes && (
                      <p className="text-xs font-mono text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed">
                        "{entry.notes}"
                      </p>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((t) => (
                          <span key={t} className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowJournalHistory(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Biometric Meters & AI Diagnosis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Biometrics & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Bio-Parameters
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunTrendAudit}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono transition-colors"
                >
                  Audit 7-Day Trends
                </button>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${warnings.length > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
                  {warnings.length > 0 ? 'ATTENTION REQUIRED' : 'OPTIMAL'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Heart Rate */}
              <div className={`bg-slate-950/60 border rounded-xl p-4 space-y-3 ${biometrics.heartRate < 60 || biometrics.heartRate > 100 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-mono">
                    <Heart className="w-4 h-4 text-rose-500" /> Heart Rate
                  </span>
                  <span className={`font-mono font-bold text-base ${biometrics.heartRate < 60 || biometrics.heartRate > 100 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {biometrics.heartRate} BPM {biometrics.heartRate < 60 || biometrics.heartRate > 100 ? '(Warning)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="140"
                  value={biometrics.heartRate}
                  onChange={(e) => setBiometrics({ ...biometrics, heartRate: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* HRV */}
              <div className={`bg-slate-950/60 border rounded-xl p-4 space-y-3 ${biometrics.hrv < 40 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-mono">
                    <Waves className="w-4 h-4 text-cyan-400" /> HRV (RMSSD)
                  </span>
                  <span className={`font-mono font-bold text-base ${biometrics.hrv < 40 ? 'text-amber-400' : 'text-cyan-300'}`}>
                    {biometrics.hrv} ms {biometrics.hrv < 40 ? '(Low)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={biometrics.hrv}
                  onChange={(e) => setBiometrics({ ...biometrics, hrv: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Neural Coherence */}
              <div className={`bg-slate-950/60 border rounded-xl p-4 space-y-3 ${biometrics.neuralCoherence < 70 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-mono">
                    <Cpu className="w-4 h-4 text-purple-400" /> Neural Coherence
                  </span>
                  <span className={`font-mono font-bold text-base ${biometrics.neuralCoherence < 70 ? 'text-amber-400' : 'text-purple-300'}`}>
                    {biometrics.neuralCoherence}% {biometrics.neuralCoherence < 70 ? '(Suboptimal)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={biometrics.neuralCoherence}
                  onChange={(e) => setBiometrics({ ...biometrics, neuralCoherence: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Cellular Vitality */}
              <div className={`bg-slate-950/60 border rounded-xl p-4 space-y-3 ${biometrics.cellularVitality < 75 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-mono">
                    <Zap className="w-4 h-4 text-amber-400" /> Cellular Vitality
                  </span>
                  <span className={`font-mono font-bold text-base ${biometrics.cellularVitality < 75 ? 'text-amber-400' : 'text-amber-300'}`}>
                    {biometrics.cellularVitality}% {biometrics.cellularVitality < 75 ? '(Fatigue)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={biometrics.cellularVitality}
                  onChange={(e) => setBiometrics({ ...biometrics, cellularVitality: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Symptom Input Form */}
            <form onSubmit={handleRunDiagnosis} className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-2 uppercase tracking-wider">
                  Targeted Symptoms or Healing Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild cranial tension, low afternoon energy, deep reset..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Shield className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'SYNTHESIZING STARFLEET DIAGNOSIS...' : 'RUN AI HEALER DIAGNOSTIC & LOG SCAN'}
              </button>
            </form>
          </div>

          {/* D3.js Radar Chart Overview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                6-Axis Vitality Radar Overview
              </h3>
              <span className="text-xs font-mono text-slate-400">D3.js Equilibrium Matrix</span>
            </div>
            <div className="flex justify-center py-2">
              <RadarChart biometrics={biometrics} />
            </div>
          </div>

          {/* Daily Goals Animated Progress Rings Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>DAILY VITALITY GOALS // ANIMATED PROGRESS RINGS</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-white mt-1">
                  Hydration, Movement & Sleep Progress Rings
                </h3>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-3.5 py-1.5 rounded-lg border font-bold ${
                  totalGoalsAchieved === 3
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
                }`}>
                  {totalGoalsAchieved} of 3 Goals Achieved Today
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Track real-time progress toward core physiological targets. Adjust daily logs or target goals directly to recalibrate your Starfleet longevity score.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Goal 1: Hydration */}
              <GoalProgressRingCard
                label="Daily Hydration"
                unit="ml"
                currentVal={hydrationCurrent}
                targetVal={hydrationTarget}
                onCurrentChange={setHydrationCurrent}
                onTargetChange={setHydrationTarget}
                onIncrement={(step) => setHydrationCurrent((prev) => prev + step)}
                onDecrement={(step) => setHydrationCurrent((prev) => Math.max(0, prev - step))}
                icon={Droplet}
                strokeColor="#22d3ee"
                glowColor="rgba(34, 211, 238, 0.6)"
                badgeColor={hydrationAchieved ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-slate-400 bg-slate-900 border-slate-800'}
                badgeText={hydrationAchieved ? 'TARGET REACHED' : 'IN PROGRESS'}
                quickStep={250}
                quickLabels={{ inc: '+250ml', dec: '-250ml' }}
              />

              {/* Goal 2: Movement */}
              <GoalProgressRingCard
                label="Daily Movement"
                unit="mins"
                currentVal={movementCurrent}
                targetVal={movementTarget}
                onCurrentChange={setMovementCurrent}
                onTargetChange={setMovementTarget}
                onIncrement={(step) => setMovementCurrent((prev) => prev + step)}
                onDecrement={(step) => setMovementCurrent((prev) => Math.max(0, prev - step))}
                icon={Flame}
                strokeColor="#10b981"
                glowColor="rgba(16, 185, 129, 0.6)"
                badgeColor={movementAchieved ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-900 border-slate-800'}
                badgeText={movementAchieved ? 'TARGET REACHED' : 'IN PROGRESS'}
                quickStep={5}
                quickLabels={{ inc: '+5m', dec: '-5m' }}
              />

              {/* Goal 3: Sleep */}
              <GoalProgressRingCard
                label="Daily Sleep"
                unit="hrs"
                currentVal={sleepHours}
                targetVal={sleepTarget}
                onCurrentChange={setSleepHours}
                onTargetChange={setSleepTarget}
                onIncrement={(step) => setSleepHours((prev) => Number((prev + step).toFixed(1)))}
                onDecrement={(step) => setSleepHours((prev) => Math.max(0, Number((prev - step).toFixed(1))))}
                icon={Moon}
                strokeColor="#818cf8"
                glowColor="rgba(129, 140, 248, 0.6)"
                badgeColor={sleepAchieved ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' : 'text-slate-400 bg-slate-900 border-slate-800'}
                badgeText={sleepAchieved ? 'TARGET REACHED' : 'IN PROGRESS'}
                quickStep={0.5}
                quickLabels={{ inc: '+0.5h', dec: '-0.5h' }}
              />
            </div>
          </div>

          {/* Target Goals & Progress Bars Component */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Target Ranges & Goal Progress
              </h3>
              <span className="text-xs font-mono text-slate-400">Longevity Benchmarks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HRV Goal Progress */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">HRV Target: {targets.targetHrv} ms</span>
                  <span className="text-cyan-400 font-bold">{Math.min(100, Math.round((biometrics.hrv / targets.targetHrv) * 100))}% Achieved</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (biometrics.hrv / targets.targetHrv) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Current: {biometrics.hrv} ms</span>
                  <input
                    type="number"
                    value={targets.targetHrv}
                    onChange={(e) => setTargets({ ...targets, targetHrv: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-slate-300"
                  />
                </div>
              </div>

              {/* Neural Coherence Goal Progress */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Neural Target: {targets.targetNeural}%</span>
                  <span className="text-purple-400 font-bold">{Math.min(100, Math.round((biometrics.neuralCoherence / targets.targetNeural) * 100))}% Achieved</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (biometrics.neuralCoherence / targets.targetNeural) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Current: {biometrics.neuralCoherence}%</span>
                  <input
                    type="number"
                    value={targets.targetNeural}
                    onChange={(e) => setTargets({ ...targets, targetNeural: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-slate-300"
                  />
                </div>
              </div>

              {/* Cellular Vitality Goal Progress */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Vitality Target: {targets.targetVitality}%</span>
                  <span className="text-amber-400 font-bold">{Math.min(100, Math.round((biometrics.cellularVitality / targets.targetVitality) * 100))}% Achieved</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (biometrics.cellularVitality / targets.targetVitality) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Current: {biometrics.cellularVitality}%</span>
                  <input
                    type="number"
                    value={targets.targetVitality}
                    onChange={(e) => setTargets({ ...targets, targetVitality: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-slate-300"
                  />
                </div>
              </div>

              {/* Heart Rate Resting Goal Progress */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Resting HR Target: ≤ {targets.targetHeartRate} BPM</span>
                  <span className="text-rose-400 font-bold">{Math.min(100, Math.round((targets.targetHeartRate / Math.max(1, biometrics.heartRate)) * 100))}% Achieved</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (targets.targetHeartRate / Math.max(1, biometrics.heartRate)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Current: {biometrics.heartRate} BPM</span>
                  <input
                    type="number"
                    value={targets.targetHeartRate}
                    onChange={(e) => setTargets({ ...targets, targetHeartRate: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trends Charts Dashboard (Recharts) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Historical Biometrics Dashboard
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('neural')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeMetricTab === 'neural' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Neural & Vitality
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('hrv')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeMetricTab === 'hrv' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HRV & HR
                </button>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetricTab === 'neural' ? (
                  <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorVitality" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" domain={[40, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="neuralCoherence" name="Neural Coherence (%)" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorNeural)" />
                    <Area type="monotone" dataKey="cellularVitality" name="Cellular Vitality (%)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorVitality)" />
                  </AreaChart>
                ) : (
                  <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" domain={[40, 140]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Future Trends 7-Day Predictive Trajectory Engine Section */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span>FUTURE BIOMETRIC TRENDS // 7-DAY PREDICTIVE TRAJECTORY</span>
                  </h3>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  Algorithmic telemetry projection based on {futureProjectionData.usingCloud ? 'Firestore cloud logs' : '7-day local baseline telemetry'} & lifestyle progress multipliers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-3 py-1.5 rounded-full border uppercase font-bold flex items-center gap-1.5 ${
                  futureProjectionData.usingCloud
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  {futureProjectionData.usingCloud ? 'FIRESTORE CLOUD DATA ACTIVE' : 'LOCAL BASELINE ENGINE'}
                </span>
              </div>
            </div>

            {/* Interactive Protocol Progress Multiplier Toggles */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SIMULATION PROTOCOL COMPLIANCE MULTIPLIERS</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Toggle daily habits to see real-time 7-day projected trajectory shifts
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSimHydration(!simHydration)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    simHydration
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="block font-bold">2.5L Hydration</span>
                    <span className="text-[10px] text-cyan-400">+1.5 ms/d HRV</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${simHydration ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setSimMindcare(!simMindcare)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    simMindcare
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="block font-bold">MindCare Soundscape</span>
                    <span className="text-[10px] text-purple-400">-2.2%/d Stress</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${simMindcare ? 'bg-purple-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setSimSleep(!simSleep)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    simSleep
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="block font-bold">8h Restorative Sleep</span>
                    <span className="text-[10px] text-indigo-400">+1.8%/d Vitality</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${simSleep ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setSimRemedies(!simRemedies)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    simRemedies
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="block font-bold">Herbal Remedy Intake</span>
                    <span className="text-[10px] text-emerald-400">+1.2%/d Vitality</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${simRemedies ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                </button>
              </div>
            </div>

            {/* Interactive Projected Trajectory Chart (Recharts) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wide">
                  PROJECTED TRAJECTORY VISUALIZER (CURRENT baseline $\rightarrow$ NEXT 7 DAYS)
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedFutureMetric('hrv')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      selectedFutureMetric === 'hrv' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    HRV (ms)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFutureMetric('stressIndex')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      selectedFutureMetric === 'stressIndex' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Stress Index (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFutureMetric('cellularVitality')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      selectedFutureMetric === 'cellularVitality' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Vitality (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFutureMetric('neuralCoherence')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      selectedFutureMetric === 'neuralCoherence' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Neural Sync (%)
                  </button>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={futureProjectionData.chartCombinedPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFutureProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedFutureMetric}
                      name={`Projected ${selectedFutureMetric}`}
                      stroke="#22d3ee"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorFutureProj)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 7 Daily Trajectory Forecast Cards Grid */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                7-DAY FUTURE DAILY BIOMETRIC FORECAST
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
                {futureProjectionData.projectedDays.map((day, idx) => {
                  const hrvDiff = day.hrv - biometrics.hrv;
                  const stressDiff = day.stressIndex - biometrics.stressIndex;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 space-y-2 flex flex-col justify-between transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {day.dayOffset}
                        </span>
                        <span className="text-slate-400 text-[10px]">{day.dateLabel}</span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">HRV:</span>
                          <span className="text-emerald-300 font-bold">{day.hrv}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Stress:</span>
                          <span className={day.stressIndex < 35 ? 'text-cyan-300 font-bold' : 'text-amber-300 font-bold'}>
                            {day.stressIndex}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Vitality:</span>
                          <span className="text-purple-300 font-bold">{day.cellularVitality}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Rest HR:</span>
                          <span className="text-rose-300 font-bold">{day.heartRate}BPM</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-900 text-[9px] text-center text-slate-500">
                        {hrvDiff >= 0 ? `+${hrvDiff}ms HRV` : `${hrvDiff}ms HRV`} • {stressDiff <= 0 ? `${stressDiff}% Stress` : `+${stressDiff}% Stress`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Starfleet Clinical Prognosis Callout Box */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-950/80 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3 text-xs font-mono">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-cyan-300 font-bold uppercase tracking-wider block">
                  STARFLEET AI CLINICAL PROGNOSIS // 7-DAY HORIZON
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Under your active protocol compliance, HRV resilience is projected to reach{' '}
                  <strong className="text-emerald-300">{futureProjectionData.projectedDays[6]?.hrv} ms</strong> (+{futureProjectionData.projectedDays[6]?.hrv - biometrics.hrv} ms increase), while Sympathetic Stress Index is projected to drop to{' '}
                  <strong className="text-cyan-300">{futureProjectionData.projectedDays[6]?.stressIndex}%</strong>. Continued daily MindCare soundscape entrainment and 2.5L hydration will lock in this homeostatic trajectory.
                </p>
              </div>
            </div>
          </div>

          {/* Organ Health Matrix */}
          {report && report.systems && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Organ & System Vitality Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.systems.map((sys, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-cyan-300">{sys.name}</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">{sys.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${sys.score}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 pt-1">{sys.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Daily Subjective Health Journal & AI Diagnostic Report */}
        <div className="space-y-6">
          {/* Daily Subjective Health Journal Card */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    DAILY SUBJECTIVE JOURNAL
                  </div>
                  <div className="text-[10px] font-mono text-purple-300">Mind-Body Context for AI Diagnosis</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowJournalHistory(true)}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-purple-300 hover:text-purple-200 border border-purple-500/30 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                title="View previous daily journal logs"
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({journalEntries.length})</span>
              </button>
            </div>

            {/* Notification alert if saved or loaded */}
            {journalNotice && (
              <div className="bg-purple-950/60 border border-purple-500/50 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-purple-200 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{journalNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setJournalNotice(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Section 1: Sleep Quality Tracker & Dual Custom Range Sliders */}
            <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-xl border border-indigo-500/30">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <label className="text-xs font-mono text-indigo-300 flex items-center gap-1.5 font-bold">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  SLEEP QUALITY & RECOVERY TRACKER
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                    Vagal Efficiency: {sleepEfficiency}%
                  </span>
                </div>
              </div>

              {/* Quick Sleep Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Quick Presets</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSleepHours(8.5);
                      setSleepRecoveryScore(92);
                      setSleepQuality(5);
                    }}
                    className="px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 transition-colors text-center"
                  >
                    Peak Delta 92%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSleepHours(7.5);
                      setSleepRecoveryScore(82);
                      setSleepQuality(4);
                    }}
                    className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 transition-colors text-center"
                  >
                    Restful 82%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSleepHours(6.5);
                      setSleepRecoveryScore(65);
                      setSleepQuality(3);
                    }}
                    className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 transition-colors text-center"
                  >
                    Moderate 65%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSleepHours(5.0);
                      setSleepRecoveryScore(42);
                      setSleepQuality(2);
                    }}
                    className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 transition-colors text-center"
                  >
                    Restless 42%
                  </button>
                </div>
              </div>

              {/* Custom Range Slider 1: Sleep Duration (3.0h to 12.0h) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Sleep Duration
                  </span>
                  <span className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    {sleepHours.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="12.0"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>3.0h (Min)</span>
                  <span>7.5h–8.0h (Optimal)</span>
                  <span>12.0h (Max)</span>
                </div>
              </div>

              {/* Custom Range Slider 2: Sleep Recovery Score (0% to 100%) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    Sleep Recovery Score
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${recoveryInfo.color}`}>
                    {sleepRecoveryScore}% // {recoveryInfo.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={sleepRecoveryScore}
                  onChange={(e) => setSleepRecoveryScore(Number(e.target.value))}
                  className="w-full accent-indigo-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Depleted)</span>
                  <span>50% (Baseline)</span>
                  <span>100% (Peak)</span>
                </div>
                <div className="text-[10px] font-mono text-indigo-300/90 bg-indigo-950/40 p-2 rounded border border-indigo-500/20 leading-relaxed">
                  {recoveryInfo.desc}
                </div>
              </div>

              {/* Live Sleep Efficiency & Vagal Index Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Sleep Efficiency & Vagal Index</span>
                  <span className="text-indigo-300 font-bold">{sleepEfficiency}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${sleepEfficiency}%` }}
                  />
                </div>
              </div>

              {/* Qualitative Rating Buttons */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Qualitative Rating Scale
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = sleepQuality === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSleepQuality(score)}
                        className={`py-1.5 px-1 rounded-xl text-center font-mono text-xs transition-all border ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/60 text-purple-200 font-bold shadow-inner'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="text-xs">{score}★</div>
                        <div className="text-[9px] uppercase tracking-tighter truncate mt-0.5">
                          {score === 1 ? 'Poor' : score === 2 ? 'Restless' : score === 3 ? 'Fair' : score === 4 ? 'Good' : 'Deep'}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] font-mono text-indigo-300/80 bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60">
                  {getSleepQualityLabel(sleepQuality).label}: {getSleepQualityLabel(sleepQuality).desc}
                </div>
              </div>
            </div>

            {/* Section 2: Energy Level */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                  Perceived Energy Level
                </label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getEnergyLevelDescriptor(energyLevel).color}`}>
                  {energyLevel}/10 // {getEnergyLevelDescriptor(energyLevel).label}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 (Depleted)</span>
                <span>5 (Balanced)</span>
                <span>10 (Peak Vitality)</span>
              </div>
            </div>

            {/* Section 3: Emotional Resonance & Mood */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                <Smile className="w-3.5 h-3.5 text-cyan-400" />
                Dominant Mood & Resonance
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Calm & Centered', 'Mental Clarity', 'Elevated Stress', 'Fatigued', 'Physical Tension'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                      mood === m
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Subjective Notes */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                <PenLine className="w-3.5 h-3.5 text-purple-400" />
                Subjective Notes & Sensations
              </label>
              <textarea
                rows={3}
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                placeholder="Log physical tension, cognitive focus, digestion, emotional state, or daily stressors to guide AI root cause analysis..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Section 5: Clinical Tags */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Clinical Fast-Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                        isSelected
                          ? 'bg-purple-500/30 border-purple-500/60 text-purple-200 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Save & Analyze */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveJournalEntry}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Save className="w-3.5 h-3.5 text-purple-400" />
                <span>Save Journal</span>
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => handleRunDiagnosis()}
                className="w-full sm:flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Biometrics...' : 'Run Scan with Journal'}</span>
              </button>
            </div>
          </div>

          {/* AI Healer Report Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between">
              <div className="bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                DR. WELLAND-STRONG REPORT
              </div>
              {report && (
                <button
                  type="button"
                  onClick={handleExportReport}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Export Medical Report (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              )}
            </div>

            {/* Synthesized context notice */}
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2.5 text-[11px] font-mono text-purple-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                Context: Sleep {sleepQuality}★ ({sleepHours.toFixed(1)}h • {sleepRecoveryScore}% Rec) • Energy {energyLevel}/10
              </span>
              <span className="text-[10px] text-cyan-300 font-bold">{mood}</span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-cyan-400">STATUS LEVEL</div>
              <div className="text-xl font-bold font-mono text-white">
                {report ? report.triageLevel : 'READY FOR SCAN'}
              </div>
              <div className="text-xs text-slate-400">
                Overall Vitality Score:{' '}
                <span className="text-cyan-300 font-bold font-mono">{report ? `${report.overallVitality}/100` : '--'}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-cyan-400">ROOT CAUSE ANALYSIS</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {report ? report.rootCauseAnalysis : 'Run a full scan or AI diagnostic to generate comprehensive root-cause analysis and personalized healing protocols.'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-cyan-400">IMMEDIATE CORRECTIVE PROTOCOL</div>
              <ul className="space-y-2">
                {report && report.correctiveProtocol ? (
                  report.correctiveProtocol.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-cyan-400 font-mono font-bold">0{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500 italic">No active protocol generated yet.</li>
                )}
              </ul>
            </div>

            {report && report.recommendedSolfeggioHz && (
              <div className="pt-4 border-t border-slate-800">
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-purple-300 uppercase">Recommended Solfeggio Tone</div>
                    <div className="text-lg font-bold font-mono text-purple-200">{report.recommendedSolfeggioHz} Hz</div>
                  </div>
                  <Waves className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Milestones Achievement System */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>STARFLEET COMMENDATIONS & HEALTH MILESTONES</span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mt-1">
              7-Day Consistency & Vitality Achievements
            </h3>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>5 of 5 Milestones Unlocked</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Milestone 1: Consistency Streak */}
          <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                UNLOCKED // 7-DAY STREAK
              </span>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-white">Consistency Streak</h4>
              <p className="text-xs text-slate-400 mt-1">
                Completed 7 consecutive daily bio-scans without missing a single telemetry cycle.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Goal: 7 Daily Scans</span>
              <span className="text-amber-400 font-bold">100% Achieved</span>
            </div>
          </div>

          {/* Milestone 2: Stress Master */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                UNLOCKED // AUTONOMIC ZEN
              </span>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-white">Stress Master</h4>
              <p className="text-xs text-slate-400 mt-1">
                Maintained an autonomic stress index below 35% across 7 consecutive evaluations.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Goal: Stress &lt; 35%</span>
              <span className="text-emerald-400 font-bold">Current: {biometrics.stressIndex}%</span>
            </div>
          </div>

          {/* Milestone 3: Neural Equilibrium */}
          <div className="bg-slate-950/60 border border-purple-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30">
                UNLOCKED // COHERENCE
              </span>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-white">Neural Equilibrium</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sustained neural coherence scores above 80% for 7 days via harmonic alignment.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Goal: Coherence &ge; 80%</span>
              <span className="text-purple-400 font-bold">Current: {biometrics.neuralCoherence}%</span>
            </div>
          </div>

          {/* Milestone 4: Vitality Vanguard */}
          <div className="bg-slate-950/60 border border-cyan-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
                UNLOCKED // MITO-POWER
              </span>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-white">Vitality Vanguard</h4>
              <p className="text-xs text-slate-400 mt-1">
                Cellular vitality and ATP regeneration benchmarks maintained at &ge; 85% for over a week.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Goal: Vitality &ge; 85%</span>
              <span className="text-cyan-400 font-bold">Current: {biometrics.cellularVitality}%</span>
            </div>
          </div>

          {/* Milestone 5: Cardiovascular Harmony */}
          <div className="bg-slate-950/60 border border-rose-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-rose-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30">
                UNLOCKED // HARMONIC HR
              </span>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-white">Cardiovascular Harmony</h4>
              <p className="text-xs text-slate-400 mt-1">
                Resting pulse stabilized in the ideal longevity window (60–75 BPM) with high HRV recovery.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Goal: Pulse 60–75 BPM</span>
              <span className="text-rose-400 font-bold">Current: {biometrics.heartRate} BPM</span>
            </div>
          </div>

          {/* Dr. Welland-Strong Commendation Card */}
          <div className="bg-gradient-to-br from-cyan-950/30 to-slate-950/80 border border-cyan-500/30 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL MEDICAL COMMENDATION</span>
              </div>
              <p className="text-xs text-slate-300 italic font-mono mt-2 leading-relaxed">
                "Outstanding constitutional discipline. Your continuous somatic alignment and frequency tuning have established a harmonic baseline worthy of a Starfleet Chief Medical Officer's highest commendation."
              </p>
            </div>
            <div className="text-right text-[10px] font-mono text-cyan-300 font-bold">
              — Dr. Welland-Strong, MD, Starfleet
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Archive Section */}
      <div id="biometric-archive-section">
        <BiometricArchiveSection
          currentBiometrics={biometrics}
          currentReport={report}
          currentSymptoms={symptoms}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* Sticky Non-Intrusive Health Pulse Scrolling Ticker Bar Anchored at Bottom */}
      <div className="sticky bottom-0 z-40 bg-slate-950/95 border-t border-cyan-500/30 backdrop-blur-md shadow-2xl transition-all duration-300 -mx-6 -mb-8 mt-8">
        {isTickerCollapsed ? (
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                HEALTH PULSE
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px] truncate max-w-lg">
                {tickerItems.find((i) => i.severity !== 'optimal')?.headline || 'All biometric parameters within optimal limits.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTickerCollapsed(false)}
              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <span>Expand Health Pulse</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 py-2.5 px-6 max-w-full overflow-hidden">
            {/* Fixed Left Label */}
            <div className="flex items-center gap-2.5 shrink-0 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-cyan-500/40 z-10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <div className="font-mono text-xs font-bold tracking-wider flex items-center gap-1">
                <span className="text-rose-400">HEALTH</span>
                <span className="text-cyan-400">PULSE</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 hidden sm:inline uppercase tracking-widest border-l border-slate-800 pl-2">
                LIVE DEVIATION TICKER
              </span>
            </div>

            {/* Marquee Scrolling Ticker Container */}
            <div className="flex-1 overflow-hidden relative py-0.5">
              <div className={`animate-ticker flex items-center gap-4 ${isTickerPaused ? 'animate-ticker-paused' : ''}`}>
                {[...tickerItems, ...tickerItems].map((item, idx) => {
                  const isCritical = item.severity === 'critical';
                  const isWarning = item.severity === 'warning';

                  return (
                    <button
                      key={`${item.id}_${idx}`}
                      type="button"
                      onClick={() => {
                        if (item.metricKey) {
                          setSelectedQuickMetric(item.metricKey);
                        }
                      }}
                      className={`shrink-0 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl font-mono text-xs border transition-all hover:scale-105 cursor-pointer ${
                        isCritical
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 hover:border-rose-400 shadow-lg shadow-rose-950/40'
                          : isWarning
                          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200 hover:border-amber-400 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-900/90 border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isCritical || isWarning ? (
                          <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {item.category}
                        </span>
                      </div>

                      <span className="font-bold tracking-tight text-white">{item.headline}:</span>
                      <span className="text-slate-300 font-normal">{item.detail}</span>

                      {item.metricKey && (
                        <span className="text-[10px] text-cyan-400 underline underline-offset-2 ml-1 opacity-80 group-hover:opacity-100">
                          View Sensor
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fixed Right Controls */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/90 p-1 rounded-xl border border-slate-800 z-10 shadow-lg font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsTickerPaused(!isTickerPaused)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isTickerPaused
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isTickerPaused ? 'Resume Ticker Motion' : 'Pause Ticker Motion'}
              >
                {isTickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsTickerCollapsed(true)}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Minimize Health Pulse Ticker"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Smart Alerts Rules Manager Modal */}
      {isRulesManagerOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto font-sans">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-bold text-white flex items-center gap-2">
                    <span>SMART ALERT RULES MANAGER</span>
                    <span className="text-xs font-normal text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                      {smartAlertRules.filter((r) => r.enabled).length} / {smartAlertRules.length} ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Define custom biometric threshold triggers that automatically recommend MindCare frequencies & Herbal Remedies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenNewRuleForm}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Alert Rule</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaultRules}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  title="Reset to default Starfleet alert rules"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRulesManagerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
              {smartAlertRules.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-sm space-y-3">
                  <p>No Smart Alert rules configured.</p>
                  <button
                    onClick={handleResetDefaultRules}
                    className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Load Default Rules
                  </button>
                </div>
              ) : (
                smartAlertRules.map((rule) => {
                  const metricConfig = QUICK_METRICS.find((m) => m.key === rule.metricKey);
                  const Icon = metricConfig ? metricConfig.icon : Activity;
                  const currentVal = biometrics[rule.metricKey as keyof BiometricProfile];

                  const isCurrentlyTriggered =
                    rule.enabled &&
                    ((rule.condition === 'greaterThan' && Number(currentVal) > rule.thresholdValue) ||
                      (rule.condition === 'lessThan' && Number(currentVal) < rule.thresholdValue));

                  return (
                    <div
                      key={rule.id}
                      className={`border rounded-xl p-4 transition-all space-y-3 ${
                        !rule.enabled
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          : isCurrentlyTriggered
                          ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleRuleEnabled(rule.id)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 flex items-center cursor-pointer ${
                              rule.enabled ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                            title={rule.enabled ? 'Disable Alert Rule' : 'Enable Alert Rule'}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                          </button>

                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-mono text-sm font-bold text-white">{rule.customTitle}</h4>
                              {isCurrentlyTriggered && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase font-bold animate-pulse">
                                  TRIGGERED NOW
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="text-purple-300 font-bold">
                                {rule.metricName} {rule.condition === 'greaterThan' ? '>' : '<'} {rule.thresholdValue}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span>Current Value: <strong className="text-white">{currentVal}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRuleForm(rule)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rule Recommendation Preview Chips */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono pt-1 border-t border-slate-800/80">
                        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase block">MindCare Solfeggio</span>
                            <span className="text-purple-300 font-bold">
                              {rule.recommendation.mindcareHz || 528} Hz
                            </span>
                            <span className="text-slate-400 text-[11px] block truncate">
                              {rule.recommendation.mindcareTitle}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase block">Herbal Remedy</span>
                            <span className="text-emerald-300 font-bold truncate block">
                              {rule.recommendation.remedyName}
                            </span>
                            <span className="text-slate-400 text-[11px] block truncate">
                              {rule.recommendation.remedyDosage}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                          <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase block">Somatic Protocol</span>
                            <span className="text-cyan-300 text-[11px] block line-clamp-2">
                              {rule.recommendation.somaticExercise}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>All alert rules persist locally in browser state & sync across sessions.</span>
              <button
                type="button"
                onClick={() => setIsRulesManagerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Smart Alert Sub-Modal */}
      {isRuleFormOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-base font-bold text-white">
                    {editingRuleId ? 'EDIT SMART ALERT RULE' : 'CREATE CUSTOM SMART ALERT RULE'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Configure threshold trigger and automatic health recommendations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRuleFormOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Alert Title */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase tracking-wider block">
                  Alert Rule Title
                </label>
                <input
                  type="text"
                  value={ruleFormTitle}
                  onChange={(e) => setRuleFormTitle(e.target.value)}
                  placeholder="e.g. Sympathetic Hyper-Arousal Warning"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Metric Selector & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider block">
                    Target Metric
                  </label>
                  <select
                    value={ruleFormMetricKey}
                    onChange={(e) => {
                      const k = e.target.value as QuickMetricKey;
                      setRuleFormMetricKey(k);
                      if (k === 'heartRate') setRuleFormThreshold(90);
                      else if (k === 'hrv') setRuleFormThreshold(45);
                      else if (k === 'neuralCoherence') setRuleFormThreshold(75);
                      else if (k === 'cellularVitality') setRuleFormThreshold(75);
                      else if (k === 'stressIndex') setRuleFormThreshold(50);
                      else if (k === 'oxygenSaturation') setRuleFormThreshold(95);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {QUICK_METRICS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.shortName} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider block">
                    Condition Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRuleFormCondition('greaterThan')}
                      className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        ruleFormCondition === 'greaterThan'
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Greater Than (&gt;)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleFormCondition('lessThan')}
                      className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        ruleFormCondition === 'lessThan'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Less Than (&lt;)
                    </button>
                  </div>
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold uppercase">Threshold Value</span>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {ruleFormThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min={ruleFormMetricKey === 'heartRate' ? 40 : ruleFormMetricKey === 'hrv' ? 10 : 10}
                  max={ruleFormMetricKey === 'heartRate' ? 140 : ruleFormMetricKey === 'hrv' ? 120 : 100}
                  value={ruleFormThreshold}
                  onChange={(e) => setRuleFormThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Action Type */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase tracking-wider block">
                  Automated Recommendation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRuleFormActionType('both')}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      ruleFormActionType === 'both'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    MindCare & Remedy
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleFormActionType('mindcare')}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      ruleFormActionType === 'mindcare'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    MindCare Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleFormActionType('remedy')}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      ruleFormActionType === 'remedy'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Remedy Only
                  </button>
                </div>
              </div>

              {/* MindCare Solfeggio Section */}
              {(ruleFormActionType === 'mindcare' || ruleFormActionType === 'both') && (
                <div className="space-y-2 bg-purple-950/20 border border-purple-500/30 p-3 rounded-xl">
                  <span className="text-purple-300 font-bold uppercase block text-[11px]">
                    MindCare Frequency Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Solfeggio Hz</label>
                      <select
                        value={ruleFormMindcareHz}
                        onChange={(e) => setRuleFormMindcareHz(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                      >
                        <option value={285}>285 Hz - Quantum Tissue Repair</option>
                        <option value={396}>396 Hz - Cortisol Release & Vagal Tone</option>
                        <option value={432}>432 Hz - Cellular Harmony & Coherence</option>
                        <option value={528}>528 Hz - Bio-Field Transformation</option>
                        <option value={639}>639 Hz - Neural Interconnection</option>
                        <option value={741}>741 Hz - Synaptic Focus & Clarity</option>
                        <option value={852}>852 Hz - Intuitive Awakening</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">MindCare Protocol Title</label>
                      <input
                        type="text"
                        value={ruleFormMindcareTitle}
                        onChange={(e) => setRuleFormMindcareTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Herbal Remedy Section */}
              {(ruleFormActionType === 'remedy' || ruleFormActionType === 'both') && (
                <div className="space-y-2 bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-emerald-300 font-bold uppercase block text-[11px]">
                    Natural Remedy Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Herbal Remedy Name</label>
                      <input
                        type="text"
                        value={ruleFormRemedyName}
                        onChange={(e) => setRuleFormRemedyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Dosage & Administration</label>
                      <input
                        type="text"
                        value={ruleFormRemedyDosage}
                        onChange={(e) => setRuleFormRemedyDosage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Somatic Exercise Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase block text-[11px]">
                  Somatic Exercise Instructions
                </label>
                <input
                  type="text"
                  value={ruleFormSomaticExercise}
                  onChange={(e) => setRuleFormSomaticExercise(e.target.value)}
                  placeholder="e.g. 5-minute Box Breathing (4s inhale, 4s hold, 4s exhale, 4s hold)"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsRuleFormOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Save Smart Alert Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Biometric Body Map Full-Screen Console Modal */}
      {isBodyMapModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col p-4 sm:p-8 overflow-y-auto font-sans">
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col space-y-6 my-auto">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Crosshair className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <span>BIOMETRIC BODY MAP</span>
                    <span className="text-slate-600">•</span>
                    <span>3D ANATOMICAL CONSOLE</span>
                  </div>
                  <h2 className="text-xl font-bold font-mono text-white flex items-center gap-3 mt-0.5">
                    <span>Targeted Physical Anomaly Analysis</span>
                    {activeAnomalies.length > 0 ? (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase tracking-wider animate-pulse">
                        {activeAnomalies.length} Active {activeAnomalies.length === 1 ? 'Anomaly' : 'Anomalies'}
                      </span>
                    ) : (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wider">
                        All Regions Optimal
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Front / Back Toggle */}
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBodyMapOrientation('front')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      bodyMapOrientation === 'front'
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyMapOrientation('back')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      bodyMapOrientation === 'back'
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Back View
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBodyMapModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
              {/* Left Column: Enlarged 3D Interactive SVG Visualizer */}
              <div className="lg:col-span-6 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[420px]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* SVG Header */}
                <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-3 z-10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>ANATOMICAL MATRIX // {bodyMapOrientation.toUpperCase()} PERSPECTIVE</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                    BIOMETRIC SENSORS ACTIVE
                  </span>
                </div>

                {/* Enlarged Anatomical Avatar SVG */}
                <div className="relative my-4 flex-1 flex items-center justify-center min-h-[360px]">
                  <svg className="w-full h-full max-h-[420px] drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]" viewBox="0 0 200 240">
                    <defs>
                      <linearGradient id="bodyModalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#581c87" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Outer Energy Shield Aura */}
                    <ellipse cx="100" cy="120" rx="60" ry="110" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-40" />

                    {/* Anatomical Contour Paths */}
                    <g fill="url(#bodyModalGradient)" stroke="#0284c7" strokeWidth="1.2" opacity="0.95">
                      {/* Head & Cranium */}
                      <ellipse cx="100" cy="28" rx="18" ry="22" />
                      {/* Neck */}
                      <rect x="94" y="48" width="12" height="12" rx="2" />
                      {/* Trapezius & Shoulders */}
                      <path d="M 68 62 Q 100 56 132 62 L 148 76 L 138 95 L 126 82 L 124 135 L 76 135 L 74 82 L 62 95 L 52 76 Z" />
                      {/* Core & Torso */}
                      <path d="M 76 135 L 124 135 L 120 162 L 80 162 Z" />
                      {/* Arms & Hands */}
                      <path d="M 52 78 L 40 120 L 44 158 L 36 160 L 32 120 L 48 74 Z" />
                      <path d="M 148 78 L 160 120 L 156 158 L 164 160 L 168 120 L 152 74 Z" />
                      {/* Pelvis & Legs */}
                      <path d="M 80 162 L 120 162 L 126 215 L 110 215 L 102 175 L 98 175 L 90 215 L 74 215 Z" />
                    </g>

                    {/* Spinal Line for Back Orientation */}
                    {bodyMapOrientation === 'back' && (
                      <line x1="100" y1="50" x2="100" y2="160" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" opacity="0.7" />
                    )}

                    {/* Interactive Body Region Hotspots */}
                    {BODY_REGIONS.map((region) => {
                      const isSelected = selectedBodyRegion === region.id;
                      const hasAnomaly = region.isAnomaly(biometrics);
                      const cx = bodyMapOrientation === 'back' && region.cxBack !== undefined ? region.cxBack : region.cx;
                      const cy = bodyMapOrientation === 'back' && region.cyBack !== undefined ? region.cyBack : region.cy;

                      return (
                        <g
                          key={region.id}
                          onClick={() => handleSelectBodyRegion(region.id)}
                          className="cursor-pointer group"
                        >
                          {/* Pulsing Halo for Active Anomaly */}
                          {hasAnomaly && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isSelected ? 16 : 12}
                              className="fill-rose-500/20 stroke-rose-500 animate-ping opacity-75"
                              strokeWidth="1.5"
                            />
                          )}

                          {/* Selection Outer Ring */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 14 : 9}
                            className={`transition-all duration-300 ${
                              isSelected
                                ? 'fill-cyan-500/30 stroke-cyan-400 stroke-[2.5]'
                                : hasAnomaly
                                ? 'fill-rose-500/30 stroke-rose-400 stroke-2'
                                : 'fill-slate-900/80 stroke-slate-600 stroke-1 hover:stroke-cyan-400'
                            }`}
                          />

                          {/* Center Hotspot Dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 5 : 3.5}
                            className={`transition-all ${
                              hasAnomaly
                                ? 'fill-rose-400'
                                : isSelected
                                ? 'fill-cyan-300'
                                : 'fill-slate-400 group-hover:fill-cyan-300'
                            }`}
                          />

                          {/* Interactive Region Label SVG Text */}
                          <text
                            x={cx}
                            y={cy - 16}
                            textAnchor="middle"
                            className={`text-[8px] font-mono font-bold transition-all ${
                              isSelected
                                ? 'fill-cyan-300 font-extrabold'
                                : hasAnomaly
                                ? 'fill-rose-300 font-bold'
                                : 'fill-slate-400 opacity-70 group-hover:opacity-100'
                            }`}
                          >
                            {region.shortName}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Region Selector Pills in Modal */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-slate-800/80 z-10">
                  {BODY_REGIONS.map((region) => {
                    const isSelected = selectedBodyRegion === region.id;
                    const hasAnomaly = region.isAnomaly(biometrics);

                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => setSelectedBodyRegion(region.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                            : hasAnomaly
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {hasAnomaly && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                        <span>{region.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Region Detail & Direct Recovery Actions */}
              {(() => {
                const region = BODY_REGIONS.find((r) => r.id === selectedBodyRegion) || BODY_REGIONS[0];
                const status = region.statusInfo(biometrics);
                const hasAnomaly = region.isAnomaly(biometrics);
                const currentValStr = region.getVal(biometrics);

                return (
                  <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative">
                    <div className="space-y-4">
                      {/* Selected Region Title & Status */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                        <div>
                          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                            <span>SELECTED ANATOMICAL ZONE</span>
                          </div>
                          <h3 className="text-xl font-bold font-mono text-white mt-1">
                            {region.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {region.systemName}
                          </p>
                        </div>
                        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border uppercase tracking-wider shrink-0 ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </div>

                      {/* Live Sensor Metrics Box */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-slate-400 uppercase">Primary Sensor Metric:</span>
                          <span className="text-cyan-300 font-bold">{region.metricLabel}</span>
                        </div>

                        <div className="flex items-baseline justify-between font-mono">
                          <div className="text-2xl font-bold text-white tracking-tight">
                            {currentValStr}
                          </div>
                          <div className="text-xs text-slate-400">
                            Normal Range: <strong className="text-emerald-400">{region.normalRangeLabel}</strong>
                          </div>
                        </div>

                        {/* Anomaly Notice */}
                        {hasAnomaly ? (
                          <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs font-mono text-rose-200 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-rose-300 block font-bold">PHYSIOLOGICAL DEVIATION DETECTED</strong>
                              <span>
                                Metric parameters for {region.shortName} exceed baseline homeostasis thresholds. Targeted somatic recovery protocol recommended below.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-xs font-mono text-emerald-200 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-emerald-300 block font-bold">HOMEOSTASIS MAINTAINED</strong>
                              <span>Anatomical tissue in {region.shortName} operating within target bio-electric baseline parameters.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Somatic & Natural Recovery Protocol Card */}
                      <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                        <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>DR. WELLAND-STRONG TARGETED RECOVERY PROTOCOL</span>
                        </div>

                        <div className="space-y-2 text-xs font-mono text-slate-300">
                          <div className="flex items-start gap-2.5 bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30">
                            <Waves className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-purple-300 uppercase block font-bold">Acoustic Resonance Frequency</span>
                              <span className="text-white font-bold">{region.recoveryProtocol.solfeggioTitle}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-emerald-300 uppercase block font-bold">Targeted Natural Remedy</span>
                              <span className="text-white font-bold">{region.recoveryProtocol.herbalRemedy}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/30">
                            <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-cyan-300 uppercase block font-bold">Somatic Alignment Exercise</span>
                              <span className="text-slate-200">{region.recoveryProtocol.somaticInstruction}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct Tab Action Buttons */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBodyMapModalOpen(false);
                          onNavigateTab?.('mindcare');
                        }}
                        className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30 cursor-pointer"
                      >
                        <Waves className="w-4 h-4" />
                        <span>Engage Soundscape ({region.recoveryProtocol.solfeggioHz} Hz)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsBodyMapModalOpen(false);
                          onNavigateTab?.('remedies');
                        }}
                        className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Prescribe Region Remedy</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
