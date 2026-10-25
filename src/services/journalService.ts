import { DailyJournalEntry } from '../types';

const STORAGE_KEY = 'dr_welland_daily_journal';

export const DEFAULT_JOURNAL_ENTRIES: DailyJournalEntry[] = [
  {
    id: 'journal_sample_1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sleepQuality: 4,
    sleepHours: 7.8,
    sleepRecoveryScore: 88,
    energyLevel: 8,
    mood: 'Calm & Centered',
    notes: 'Woke feeling well-rested after drinking chamomile & passionflower elixir. Slight suboccipital stiffness in afternoon from screen time, cleared with 5 minutes of cervical traction.',
    tags: ['Restorative Sleep', 'Cervical Stiffness', 'Hydrated'],
    syncedBiometrics: {
      heartRate: 72,
      hrv: 65,
      neuralCoherence: 84,
      cellularVitality: 91,
      stressIndex: 28,
    },
  },
  {
    id: 'journal_sample_2',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    sleepQuality: 3,
    sleepHours: 6.2,
    sleepRecoveryScore: 64,
    energyLevel: 6,
    mood: 'Moderate Cognitive Load',
    notes: 'Late night research session reduced total REM duration. Drank extra structured electrolytic water and performed 432Hz box breathing midday to steady energy curve.',
    tags: ['Short Sleep', 'Mental Fog', 'Electrolytes'],
    syncedBiometrics: {
      heartRate: 75,
      hrv: 60,
      neuralCoherence: 80,
      cellularVitality: 86,
      stressIndex: 35,
    },
  },
];

export function getSavedJournalEntries(): DailyJournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_JOURNAL_ENTRIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JOURNAL_ENTRIES;
  } catch (e) {
    return DEFAULT_JOURNAL_ENTRIES;
  }
}

export function saveJournalEntries(entries: DailyJournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save journal entries:', e);
  }
}

export function addJournalEntry(entry: Omit<DailyJournalEntry, 'id'>): DailyJournalEntry[] {
  const current = getSavedJournalEntries();
  const newEntry: DailyJournalEntry = {
    ...entry,
    id: `journal_${Date.now()}`,
  };
  const updated = [newEntry, ...current];
  saveJournalEntries(updated);
  return updated;
}

export function deleteJournalEntry(id: string): DailyJournalEntry[] {
  const current = getSavedJournalEntries();
  const updated = current.filter((item) => item.id !== id);
  saveJournalEntries(updated);
  return updated;
}

export function getSleepQualityLabel(score: number): { label: string; desc: string } {
  switch (score) {
    case 5:
      return { label: 'Deep / Restorative', desc: '8+ hrs, high REM/Deep delta recovery' };
    case 4:
      return { label: 'Good / Restful', desc: '7-8 hrs, woke refreshed with clear mind' };
    case 3:
      return { label: 'Fair / Moderate', desc: '6-7 hrs, mild sluggishness upon waking' };
    case 2:
      return { label: 'Restless / Fragmented', desc: 'Frequent awakenings, light sleep' };
    case 1:
      return { label: 'Poor / Insomniac', desc: '< 4 hrs, heavy autonomic fatigue' };
    default:
      return { label: 'Unspecified', desc: 'Standard baseline' };
  }
}

export function getSleepRecoveryDescriptor(score: number): { label: string; color: string; desc: string } {
  if (score >= 90) {
    return { label: 'Peak Delta Recovery', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', desc: 'Optimum slow-wave REM & high parasympathetic vagal recovery.' };
  } else if (score >= 75) {
    return { label: 'Optimal Sleep Efficiency', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', desc: 'Sustained restorative sleep cycles with minor micro-arousals.' };
  } else if (score >= 60) {
    return { label: 'Moderate Rest Disruption', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', desc: 'Slight autonomic latency; autonomic nervous system partially restored.' };
  } else if (score >= 40) {
    return { label: 'Restless Sleep Architecture', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Light non-REM predominant sleep; reduced deep delta wave duration.' };
  } else {
    return { label: 'Severe Sleep Deficit', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', desc: 'Compromised physiological recovery; high sympathetic arousal.' };
  }
}

export function getEnergyLevelDescriptor(score: number): { label: string; color: string } {
  if (score >= 9) return { label: 'Peak Flow State', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (score >= 7) return { label: 'Vibrant & Clear', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
  if (score >= 5) return { label: 'Steady Balance', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  if (score >= 3) return { label: 'Fatigued / Sluggish', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  return { label: 'Depleted / Exhausted', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
}
