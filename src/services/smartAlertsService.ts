import { SmartAlertRule, BiometricProfile, QuickMetricKey } from '../types';

export const DEFAULT_SMART_ALERTS: SmartAlertRule[] = [
  {
    id: 'rule-stress-high',
    metricKey: 'stressIndex',
    metricName: 'Stress Index',
    condition: 'greaterThan',
    thresholdValue: 50,
    actionType: 'both',
    customTitle: 'Sympathetic Hyper-Arousal Alert',
    recommendation: {
      mindcareHz: 396,
      mindcareTitle: '396 Hz Solfeggio - Cortisol Down-Regulation & Vagal Tone',
      remedyName: 'Ashwagandha KSM-66 & L-Theanine Complex',
      remedyDosage: '600mg Ashwagandha + 200mg L-Theanine with warm water',
      somaticExercise: 'Box Breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Hold for 3 mins)',
    },
    enabled: true,
  },
  {
    id: 'rule-hrv-low',
    metricKey: 'hrv',
    metricName: 'HRV Resilience',
    condition: 'lessThan',
    thresholdValue: 45,
    actionType: 'both',
    customTitle: 'Autonomic Nervous System Depletion',
    recommendation: {
      mindcareHz: 432,
      mindcareTitle: '432 Hz Solfeggio - Parasympathetic Recovery & Coherence',
      remedyName: 'Rhodiola Rosea & Magnesium L-Threonate',
      remedyDosage: '300mg Rhodiola (3% Salidrosides) + 144mg Elemental Magnesium',
      somaticExercise: 'Heart-Focused Coherence Breathing (5s Inhale, 5s Exhale)',
    },
    enabled: true,
  },
  {
    id: 'rule-neural-low',
    metricKey: 'neuralCoherence',
    metricName: 'Neural Coherence',
    condition: 'lessThan',
    thresholdValue: 75,
    actionType: 'both',
    customTitle: 'Cortical Synchronization Drop',
    recommendation: {
      mindcareHz: 741,
      mindcareTitle: '741 Hz Solfeggio - Synaptic Clarity & Intuitive Focus',
      remedyName: 'Lion’s Mane Dual Extract & Bacopa Monnieri',
      remedyDosage: '1000mg Organic Lion’s Mane (8:1) + 300mg Bacopa (50% Bacosides)',
      somaticExercise: 'Alternate Nostril Breathing (Nadi Shodhana - 10 Cycles)',
    },
    enabled: true,
  },
  {
    id: 'rule-vitality-low',
    metricKey: 'cellularVitality',
    metricName: 'Cellular Vitality',
    condition: 'lessThan',
    thresholdValue: 75,
    actionType: 'both',
    customTitle: 'Mitochondrial Bio-Energy Deficit',
    recommendation: {
      mindcareHz: 285,
      mindcareTitle: '285 Hz Solfeggio - Quantum Cellular Tissue Repair',
      remedyName: 'Himalayan Shilajit Resin & CoQ10 Ubiquinol',
      remedyDosage: '500mg Purified Shilajit Resin + 200mg Ubiquinol',
      somaticExercise: 'Diaphragmatic Pumping & Grounded Barefoot Stance (5 mins)',
    },
    enabled: true,
  },
  {
    id: 'rule-hr-high',
    metricKey: 'heartRate',
    metricName: 'Heart Rate',
    condition: 'greaterThan',
    thresholdValue: 90,
    actionType: 'both',
    customTitle: 'Elevated Cardiac Pace Warning',
    recommendation: {
      mindcareHz: 528,
      mindcareTitle: '528 Hz Solfeggio - Cardiac Transformation & Bio-Field Sync',
      remedyName: 'Hawthorn Berry Extract & Motherwort Tincture',
      remedyDosage: '30 drops Hawthorn Berry Tincture in 8oz electrolyte water',
      somaticExercise: 'Extended Exhale Breathing (4s Inhale, 8s Exhale for Vagal Braking)',
    },
    enabled: true,
  },
];

const STORAGE_KEY = 'dr_welland_smart_alerts_v1';

export function getSavedSmartAlerts(): SmartAlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSmartAlerts(DEFAULT_SMART_ALERTS);
      return DEFAULT_SMART_ALERTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse saved smart alerts:', err);
  }
  return DEFAULT_SMART_ALERTS;
}

export function saveSmartAlerts(alerts: SmartAlertRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save smart alerts:', err);
  }
}

export function addSmartAlert(newRule: Omit<SmartAlertRule, 'id'>): SmartAlertRule {
  const alerts = getSavedSmartAlerts();
  const created: SmartAlertRule = {
    ...newRule,
    id: 'rule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
  };
  const updated = [created, ...alerts];
  saveSmartAlerts(updated);
  return created;
}

export function updateSmartAlert(updatedRule: SmartAlertRule): SmartAlertRule[] {
  const alerts = getSavedSmartAlerts();
  const next = alerts.map((a) => (a.id === updatedRule.id ? updatedRule : a));
  saveSmartAlerts(next);
  return next;
}

export function deleteSmartAlert(id: string): SmartAlertRule[] {
  const alerts = getSavedSmartAlerts();
  const next = alerts.filter((a) => a.id !== id);
  saveSmartAlerts(next);
  return next;
}

export function resetDefaultSmartAlerts(): SmartAlertRule[] {
  saveSmartAlerts(DEFAULT_SMART_ALERTS);
  return DEFAULT_SMART_ALERTS;
}

export function evaluateSmartAlertRules(
  biometrics: BiometricProfile,
  rules: SmartAlertRule[]
): SmartAlertRule[] {
  return rules.filter((rule) => {
    if (!rule.enabled) return false;

    let currentValue: number | undefined;
    if (rule.metricKey === 'heartRate') currentValue = biometrics.heartRate;
    else if (rule.metricKey === 'hrv') currentValue = biometrics.hrv;
    else if (rule.metricKey === 'neuralCoherence') currentValue = biometrics.neuralCoherence;
    else if (rule.metricKey === 'cellularVitality') currentValue = biometrics.cellularVitality;
    else if (rule.metricKey === 'stressIndex') currentValue = biometrics.stressIndex;
    else if (rule.metricKey === 'oxygenSaturation') currentValue = biometrics.oxygenSaturation;
    else if (rule.metricKey === 'bloodPressure') {
      // Blood pressure string like "120/80" -> take systolic
      const systolic = parseInt(biometrics.bloodPressure.split('/')[0], 10);
      if (!isNaN(systolic)) currentValue = systolic;
    }

    if (currentValue === undefined) return false;

    if (rule.condition === 'greaterThan') {
      return currentValue > rule.thresholdValue;
    } else if (rule.condition === 'lessThan') {
      return currentValue < rule.thresholdValue;
    }
    return false;
  });
}
