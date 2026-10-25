export interface DailyReminder {
  id: string;
  type: 'mindcare' | 'remedy' | 'somatic';
  title: string;
  time: string; // "HH:MM" format
  enabled: boolean;
  description: string;
}

const STORAGE_KEY = 'dr_welland_daily_reminders';

export const DEFAULT_REMINDERS: DailyReminder[] = [
  {
    id: 'rem_morning',
    type: 'somatic',
    title: 'Morning Somatic Alignment',
    time: '08:00',
    enabled: true,
    description: 'Perform 8-minute cervical & spine decompression.',
  },
  {
    id: 'rem_midday',
    type: 'mindcare',
    title: 'Midday MindCare & 528Hz Harmonic Reset',
    time: '13:00',
    enabled: true,
    description: 'Engage in 5 minutes of box breathing to lower sympathetic stress.',
  },
  {
    id: 'rem_remedy',
    type: 'remedy',
    title: 'Botanical Tincture & Adaptogen Intake',
    time: '16:30',
    enabled: true,
    description: 'Take prescribed Ashwagandha & Rhodiola adaptogenic formula.',
  },
  {
    id: 'rem_evening',
    type: 'mindcare',
    title: 'Evening Solfeggio 432Hz Sleep Transition',
    time: '21:30',
    enabled: true,
    description: 'Deep parasympathetic relaxation and sleep elixir preparation.',
  },
];

export function getSavedReminders(): DailyReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_REMINDERS;
  }
}

export function saveReminders(reminders: DailyReminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
}

export function playStarfleetChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Two-tone harmonic chime (528Hz then 741Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(741, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.error('Chime error:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  return false;
}

export function addReminder(item: Omit<DailyReminder, 'id'>): DailyReminder[] {
  const current = getSavedReminders();
  const newReminder: DailyReminder = {
    ...item,
    id: `rem_${Date.now()}`,
  };
  const updated = [...current, newReminder];
  saveReminders(updated);
  return updated;
}

export function deleteReminder(id: string): DailyReminder[] {
  const current = getSavedReminders();
  const updated = current.filter((r) => r.id !== id);
  saveReminders(updated);
  return updated;
}

let lastTriggeredMinute = '';

export function checkDueReminders(onTrigger?: (reminder: DailyReminder) => void): DailyReminder[] {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  if (lastTriggeredMinute === currentTimeStr) {
    return [];
  }

  const list = getSavedReminders();
  const due = list.filter((r) => r.enabled && r.time === currentTimeStr);
  if (due.length > 0) {
    lastTriggeredMinute = currentTimeStr;
    due.forEach((r) => {
      triggerSystemNotification(r.title, r.description);
      if (onTrigger) {
        onTrigger(r);
      }
    });
  }
  return due;
}

export function triggerSystemNotification(title: string, body: string): void {
  playStarfleetChime();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      n.onclick = () => {
        window.focus();
      };
    } catch (e) {
      console.warn('System notification dispatch failed:', e);
    }
  }
}
