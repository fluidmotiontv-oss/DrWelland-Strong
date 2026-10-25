export type NavTab = 'biometrics' | 'bodyfixer' | 'mindcare' | 'remedies' | 'nutrition' | 'careplan' | 'aihealer';

export interface BiometricProfile {
  heartRate: number;
  hrv: number;
  bloodPressure: string;
  oxygenSaturation: number;
  neuralCoherence: number;
  cellularVitality: number;
  stressIndex: number;
}

export interface HistoricalBiometric {
  timestamp: string;
  heartRate: number;
  hrv: number;
  neuralCoherence: number;
  cellularVitality: number;
}

export interface SystemStatus {
  name: string;
  status: string;
  score: number;
  notes: string;
}

export interface DiagnosticReport {
  triageLevel: string;
  overallVitality: number;
  systems: SystemStatus[];
  rootCauseAnalysis: string;
  correctiveProtocol: string[];
  recommendedSolfeggioHz: number;
}

export interface SomaticExercise {
  title: string;
  duration: string;
  instruction: string;
}

export interface AcupressurePoint {
  pointName: string;
  location: string;
  benefit: string;
}

export interface BodyfixProtocol {
  regionName: string;
  alignmentGoal: string;
  somaticExercises: SomaticExercise[];
  acupressurePoints: AcupressurePoint[];
  bioFrequencyHz: number;
}

export interface HerbItem {
  herbName: string;
  action: string;
  dosage: string;
}

export interface RemedyPrescription {
  primaryFormula: string;
  herbs: HerbItem[];
  nutritionalProtocol: string[];
  quantumTip: string;
}

export interface MealSuggestion {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Functional Tonic';
  title: string;
  ingredients: string[];
  bioactiveCompounds: string;
  gutHealthMechanism: string;
  preparationNote: string;
}

export interface NutritionProtocolResponse {
  protocolName: string;
  biometricRationale: string;
  inflammationIndexScore: number;
  meals: MealSuggestion[];
  probioticFerments: string[];
  polyphenolBoosters: string[];
}

export interface CarePlanDay {
  dayName: string;
  theme: string;
  morningRoutine: {
    title: string;
    description: string;
    duration: string;
  };
  middayHarmonic: {
    title: string;
    description: string;
    solfeggioHz: number;
  };
  eveningElixir: {
    title: string;
    description: string;
    ingredients: string;
  };
}

export interface WeeklyCarePlan {
  title: string;
  summary: string;
  primaryFocus: string;
  vitalityTarget: number;
  days: CarePlanDay[];
  weeklyGuidelines: string[];
}

export interface DailyJournalEntry {
  id: string;
  date: string; // ISO date string
  sleepQuality: number; // 1 (Restless) to 5 (Deep Restorative)
  sleepHours: number; // e.g. 7.5 (3.0h to 12.0h)
  sleepRecoveryScore?: number; // 0% to 100% recovery score
  energyLevel: number; // 1 (Exhausted) to 10 (Peak Vitality)
  mood: string; // e.g. "Calm & Centered", "Mental Clarity", "Elevated Stress"
  notes: string; // Subjective physical & mental sensations
  tags: string[]; // e.g. ["Deep Sleep", "Cervical Tension", "Hydrated"]
  syncedBiometrics?: {
    heartRate: number;
    hrv: number;
    neuralCoherence: number;
    cellularVitality: number;
    stressIndex: number;
  };
}

export type QuickMetricKey =
  | 'heartRate'
  | 'hrv'
  | 'neuralCoherence'
  | 'cellularVitality'
  | 'stressIndex'
  | 'oxygenSaturation'
  | 'bloodPressure';

export interface SmartAlertRule {
  id: string;
  metricKey: QuickMetricKey;
  metricName: string;
  condition: 'lessThan' | 'greaterThan';
  thresholdValue: number;
  actionType: 'mindcare' | 'remedy' | 'both';
  customTitle: string;
  recommendation: {
    mindcareHz?: number;
    mindcareTitle?: string;
    remedyName?: string;
    remedyDosage?: string;
    somaticExercise?: string;
  };
  enabled: boolean;
}

