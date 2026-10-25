import {
  BiometricProfile,
  DiagnosticReport,
  BodyfixProtocol,
  RemedyPrescription,
  WeeklyCarePlan,
  NutritionProtocolResponse,
  DailyJournalEntry,
} from '../types';

export async function fetchDiagnosis(
  biometrics: BiometricProfile,
  symptoms: string,
  notes?: string,
  journal?: Partial<DailyJournalEntry>
): Promise<DiagnosticReport> {
  const res = await fetch('/api/health/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ biometrics, symptoms, notes, journal }),
  });
  if (!res.ok) throw new Error('Failed to fetch AI health diagnosis');
  return res.json();
}

export async function fetchBodyfix(region: string, discomfort: string): Promise<BodyfixProtocol> {
  const res = await fetch('/api/health/bodyfix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region, discomfort })
  });
  if (!res.ok) throw new Error('Failed to fetch bodyfix protocol');
  return res.json();
}

export async function fetchRemedies(condition: string): Promise<RemedyPrescription> {
  const res = await fetch('/api/health/remedies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ condition })
  });
  if (!res.ok) throw new Error('Failed to fetch natural remedies');
  return res.json();
}

export async function fetchWeeklyCarePlan(
  biometrics: BiometricProfile,
  bodyfixRegion?: string,
  mindcareFrequency?: string,
  userGoals?: string
): Promise<WeeklyCarePlan> {
  const res = await fetch('/api/health/care-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ biometrics, bodyfixRegion, mindcareFrequency, userGoals })
  });
  if (!res.ok) throw new Error('Failed to fetch weekly care plan');
  return res.json();
}

export async function fetchNutritionRecommendations(
  biometrics: BiometricProfile,
  targetProtocol?: string,
  dietaryPreferences?: string
): Promise<NutritionProtocolResponse> {
  const res = await fetch('/api/health/nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ biometrics, targetProtocol, dietaryPreferences })
  });
  if (!res.ok) throw new Error('Failed to fetch nutrition recommendations');
  return res.json();
}
