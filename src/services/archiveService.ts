import { BiometricProfile, DiagnosticReport } from '../types';

export type HealthCategory =
  | 'Cardiovascular & Heart'
  | 'Autonomic & Stress'
  | 'Neural & Cognitive'
  | 'Cellular & ATP Vitality'
  | 'Pulmonary & Oxygenation'
  | 'Full-Spectrum Holistic';

export interface ArchivedReportEntry {
  id: string;
  timestamp: string; // ISO string
  dateFormatted: string;
  title: string;
  category: HealthCategory;
  triageLevel: string;
  overallVitality: number;
  symptomsLogged: string;
  rootCauseAnalysis: string;
  correctiveProtocol: string[];
  recommendedSolfeggioHz: number;
  biometricSnapshot: BiometricProfile;
  tags: string[];
  notes?: string;
  isFlagged?: boolean;
}

const STORAGE_KEY = 'dr_welland_biometric_archive';

export const HEALTH_CATEGORIES: HealthCategory[] = [
  'Full-Spectrum Holistic',
  'Cardiovascular & Heart',
  'Autonomic & Stress',
  'Neural & Cognitive',
  'Cellular & ATP Vitality',
  'Pulmonary & Oxygenation',
];

export const DEFAULT_ARCHIVED_REPORTS: ArchivedReportEntry[] = [
  {
    id: 'archive_001',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 2 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Baseline Longevity & Neural Harmony Scan',
    category: 'Full-Spectrum Holistic',
    triageLevel: 'OPTIMAL LONGEVITY EQUILIBRIUM',
    overallVitality: 92,
    symptomsLogged: 'General wellness check; slight mental fatigue after extended cognitive tasks.',
    rootCauseAnalysis:
      'Autonomic nervous system in high vagal reserve with optimal myocardial perfusion. Minor prefrontal alpha desynchronization resolved through 528Hz harmonic alignment.',
    correctiveProtocol: [
      'Maintain 528Hz Solfeggio acoustic tuning during morning work blocks.',
      'Replenish electrolytes with 2500ml structured mineral water.',
      'Somatic box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) prior to sleep.',
    ],
    recommendedSolfeggioHz: 528,
    biometricSnapshot: {
      heartRate: 72,
      hrv: 65,
      bloodPressure: '118/76',
      oxygenSaturation: 98,
      neuralCoherence: 84,
      cellularVitality: 91,
      stressIndex: 28,
    },
    tags: ['528Hz Harmony', 'High HRV', 'Optimal Sinus', 'Hydrated'],
    notes: 'Starfleet baseline diagnostic completed. Excellent cellular ATP reserves.',
    isFlagged: true,
  },
  {
    id: 'archive_002',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 3 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Sympathetic HPA Axis Overload Evaluation',
    category: 'Autonomic & Stress',
    triageLevel: 'MODERATE SYMPATHETIC SURGE',
    overallVitality: 74,
    symptomsLogged: 'Tight chest, elevated pulse, caffeine jitteriness, restless sleep pattern.',
    rootCauseAnalysis:
      'Elevated sympathetic vasomotor tone driven by cumulative cortisol surges and transient vagal inhibition. HRV suppressed to 42ms.',
    correctiveProtocol: [
      'Ingest 600mg Ashwagandha KSM-66 paired with 200mg L-Theanine.',
      'Stream 396Hz Solfeggio tone to downregulate adrenocorticotropic activity.',
      'Perform 8-minute cardiac vagal breathing exercise with 8-second exhales.',
    ],
    recommendedSolfeggioHz: 396,
    biometricSnapshot: {
      heartRate: 88,
      hrv: 42,
      bloodPressure: '128/84',
      oxygenSaturation: 96,
      neuralCoherence: 72,
      cellularVitality: 78,
      stressIndex: 58,
    },
    tags: ['Cortisol Surge', '396Hz Vagal', 'Ashwagandha', 'Vagal Braking'],
    notes: 'Triggered automatically by Smart Alert rule: Stress Index > 50%.',
    isFlagged: false,
  },
  {
    id: 'archive_003',
    timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Prefrontal Cortex Alpha-Theta Desync Analysis',
    category: 'Neural & Cognitive',
    triageLevel: 'NEURAL DESYNCHRONIZATION ALERT',
    overallVitality: 78,
    symptomsLogged: 'Brain fog, focus dissipation, eye strain after prolonged data intake.',
    rootCauseAnalysis:
      'Inter-hemispheric phase desynchronization across fronto-parietal cognitive networks. Low theta wave power during high focus demands.',
    correctiveProtocol: [
      'Take 1000mg Lion’s Mane dual extract & Bacopa Monnieri.',
      'Engage 741Hz Synaptic Clarity soundscape in MindCare tab.',
      'Practice Alternate Nostril Breathing (Nadi Shodhana) for 10 cycles.',
    ],
    recommendedSolfeggioHz: 741,
    biometricSnapshot: {
      heartRate: 76,
      hrv: 58,
      bloodPressure: '120/78',
      oxygenSaturation: 97,
      neuralCoherence: 68,
      cellularVitality: 82,
      stressIndex: 38,
    },
    tags: ['Brain Fog', '741Hz Focus', 'Lion’s Mane', 'Nadi Shodhana'],
    notes: 'Cognitive load heavy. Neural coherence restored post 741Hz session.',
    isFlagged: false,
  },
  {
    id: 'archive_004',
    timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Mitochondrial ATP Depletion & Recovery Diagnostic',
    category: 'Cellular & ATP Vitality',
    triageLevel: 'CELLULAR ATP FATIGUE ALERT',
    overallVitality: 71,
    symptomsLogged: 'Physical sluggishness, muscle soreness post heavy somatic training.',
    rootCauseAnalysis:
      'Mitochondrial inner membrane potential decreased due to reactive oxygen species (ROS) accumulation and depleted intracellular fulvic electrolyte reserves.',
    correctiveProtocol: [
      'Supplement 500mg Purified Shilajit Resin with CoQ10 Ubiquinol.',
      'Listen to 285Hz Solfeggio acoustic frequency for quantum tissue repair.',
      'Barefoot earthing and diaphragmatic breathing for 10 minutes.',
    ],
    recommendedSolfeggioHz: 285,
    biometricSnapshot: {
      heartRate: 80,
      hrv: 50,
      bloodPressure: '122/80',
      oxygenSaturation: 95,
      neuralCoherence: 74,
      cellularVitality: 68,
      stressIndex: 44,
    },
    tags: ['Mitochondrial ATP', '285Hz Repair', 'Shilajit', 'Barefoot Earthing'],
    notes: 'Post-workout fatigue. Rapid recovery observed after Shilajit + 285Hz.',
    isFlagged: true,
  },
  {
    id: 'archive_005',
    timestamp: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 21 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Alveolar Gas Exchange & Oxygen Diffusion Profile',
    category: 'Pulmonary & Oxygenation',
    triageLevel: 'SLIGHT HYPOXIC DIVERGENCE',
    overallVitality: 82,
    symptomsLogged: 'Shallow breathing pattern during high ambient altitude or prolonged desk work.',
    rootCauseAnalysis:
      'Sub-optimal diaphragmatic excursion leading to superficial thoracic breathing and mild peripheral oximetry decrease to 94%.',
    correctiveProtocol: [
      'Administer chlorophyll-rich spirulina microalgae and beet root extract.',
      'Stream 639Hz Solfeggio tone in MindCare tab for cellular connection.',
      'Execute Breath of Fire (Kapalabhati) for 3 minutes.',
    ],
    recommendedSolfeggioHz: 639,
    biometricSnapshot: {
      heartRate: 74,
      hrv: 62,
      bloodPressure: '116/74',
      oxygenSaturation: 94,
      neuralCoherence: 80,
      cellularVitality: 85,
      stressIndex: 32,
    },
    tags: ['Pulse Ox 94%', '639Hz Sync', 'Spirulina', 'Breath of Fire'],
    notes: 'Diaphragmatic training normalized oximetry to 98% within 15 minutes.',
    isFlagged: false,
  },
  {
    id: 'archive_006',
    timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    dateFormatted: new Date(Date.now() - 30 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: 'Cardiovascular Hemodynamics & Arterial Elasticity Scan',
    category: 'Cardiovascular & Heart',
    triageLevel: 'OPTIMAL CARDIAC PERFUSION',
    overallVitality: 90,
    symptomsLogged: 'Routine cardiovascular longevity audit.',
    rootCauseAnalysis:
      'Sinus rhythm perfectly paced by Sinoatrial node; arterial vascular tone displaying high nitric oxide bioavailability.',
    correctiveProtocol: [
      'Maintain Hawthorn Berry extract & CoQ10 daily regimen.',
      'Sustain 528Hz cardiac bio-field harmonic alignment.',
      'Continue 45-minute daily aerobic movement goal.',
    ],
    recommendedSolfeggioHz: 528,
    biometricSnapshot: {
      heartRate: 68,
      hrv: 72,
      bloodPressure: '115/72',
      oxygenSaturation: 99,
      neuralCoherence: 88,
      cellularVitality: 94,
      stressIndex: 22,
    },
    tags: ['Cardio Optimum', '528Hz Field', 'Hawthorn Berry', 'Nitric Oxide'],
    notes: 'Outstanding arterial hemodynamics and low resting pulse.',
    isFlagged: true,
  },
];

export function getArchivedReports(): ArchivedReportEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ARCHIVED_REPORTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ARCHIVED_REPORTS;
  } catch (e) {
    return DEFAULT_ARCHIVED_REPORTS;
  }
}

export function saveArchivedReports(reports: ArchivedReportEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save archived reports:', e);
  }
}

export function addReportToArchive(
  report: DiagnosticReport,
  biometrics: BiometricProfile,
  symptomsLogged: string,
  category: HealthCategory = 'Full-Spectrum Holistic',
  title?: string,
  notes?: string
): ArchivedReportEntry[] {
  const current = getArchivedReports();
  const now = new Date();
  
  // Categorize dynamically based on triage or report if not explicitly provided
  let detectedCategory: HealthCategory = category;
  if (category === 'Full-Spectrum Holistic') {
    if (biometrics.heartRate > 90 || biometrics.heartRate < 60) {
      detectedCategory = 'Cardiovascular & Heart';
    } else if (biometrics.stressIndex > 45 || biometrics.hrv < 45) {
      detectedCategory = 'Autonomic & Stress';
    } else if (biometrics.neuralCoherence < 75) {
      detectedCategory = 'Neural & Cognitive';
    } else if (biometrics.cellularVitality < 75) {
      detectedCategory = 'Cellular & ATP Vitality';
    } else if (biometrics.oxygenSaturation < 95) {
      detectedCategory = 'Pulmonary & Oxygenation';
    }
  }

  const newEntry: ArchivedReportEntry = {
    id: `archive_${Date.now()}`,
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: title || `${detectedCategory} Diagnostic Evaluation`,
    category: detectedCategory,
    triageLevel: report.triageLevel,
    overallVitality: report.overallVitality,
    symptomsLogged: symptomsLogged || 'Routine diagnostic scan',
    rootCauseAnalysis: report.rootCauseAnalysis,
    correctiveProtocol: report.correctiveProtocol || [],
    recommendedSolfeggioHz: report.recommendedSolfeggioHz || 528,
    biometricSnapshot: { ...biometrics },
    tags: [
      `${report.recommendedSolfeggioHz || 528}Hz Tone`,
      `Vitality ${report.overallVitality}%`,
      detectedCategory,
    ],
    notes: notes || 'Archived manually from active Dr. Welland-Strong scan.',
    isFlagged: false,
  };

  const updated = [newEntry, ...current];
  saveArchivedReports(updated);
  return updated;
}

export function deleteArchivedReport(id: string): ArchivedReportEntry[] {
  const current = getArchivedReports();
  const updated = current.filter((item) => item.id !== id);
  saveArchivedReports(updated);
  return updated;
}

export function toggleFlagArchivedReport(id: string): ArchivedReportEntry[] {
  const current = getArchivedReports();
  const updated = current.map((item) =>
    item.id === id ? { ...item, isFlagged: !item.isFlagged } : item
  );
  saveArchivedReports(updated);
  return updated;
}

export function resetDefaultArchivedReports(): ArchivedReportEntry[] {
  saveArchivedReports(DEFAULT_ARCHIVED_REPORTS);
  return DEFAULT_ARCHIVED_REPORTS;
}
