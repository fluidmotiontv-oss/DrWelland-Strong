import React, { useState, useEffect } from 'react';
import { NavTab, BiometricProfile, DiagnosticReport } from './types';
import { Navbar } from './components/Navbar';
import { BiometricsScan } from './components/BiometricsScan';
import { Bodyfixer } from './components/Bodyfixer';
import { MindCare } from './components/MindCare';
import { NaturalRemedies } from './components/NaturalRemedies';
import { AIHealerChat } from './components/AIHealerChat';
import { PersonalizedCarePlan } from './components/PersonalizedCarePlan';
import { NutritionEngine } from './components/NutritionEngine';
import { fetchDiagnosis } from './services/healthApi';
import { auth, syncBiometricLog, fetchCloudBiometricLogs } from './services/firebaseClient';
import { checkDueReminders, DailyReminder } from './services/reminderService';
import { getSavedJournalEntries } from './services/journalService';
import { Bell, X, ArrowRight, HeartPulse } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('biometrics');
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeReminder, setActiveReminder] = useState<DailyReminder | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricProfile>({
    heartRate: 72,
    hrv: 65,
    bloodPressure: '120/80',
    oxygenSaturation: 98,
    neuralCoherence: 84,
    cellularVitality: 91,
    stressIndex: 28,
  });
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [cloudHistory, setCloudHistory] = useState<any[] | null>(null);

  // Global recurring notification schedule check
  useEffect(() => {
    const runCheck = () => {
      checkDueReminders((reminder) => {
        setActiveReminder(reminder);
      });
    };

    runCheck();
    const interval = setInterval(runCheck, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const latestJournal = getSavedJournalEntries()[0];
      const res = await fetchDiagnosis(
        biometrics,
        'Comprehensive Starfleet Full Spectrum Scan',
        latestJournal?.notes,
        latestJournal
      );
      setReport(res);
      setCurrentTab('biometrics');
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSyncCloud = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in with Google first to sync your biometric profile to the cloud.');
      return;
    }
    setIsSyncing(true);
    try {
      const latestJournal = getSavedJournalEntries()[0];
      await syncBiometricLog(user.uid, biometrics, report, latestJournal);
      const logs = await fetchCloudBiometricLogs(user.uid);
      setCloudHistory(logs);
      alert('Biometric profile & Daily Journal successfully synced to Firestore cloud!');
    } catch (err: any) {
      console.error('Cloud Sync Error:', err);
      alert(`Cloud sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        onSyncCloud={handleSyncCloud}
        isSyncing={isSyncing}
      />

      {/* Global Recurring Health Schedule Notification Banner */}
      {activeReminder && (
        <div className="bg-purple-950/80 border-b border-purple-500/40 px-6 py-3.5 backdrop-blur-md sticky top-[73px] z-40 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40 uppercase tracking-widest">
                    Scheduled Daily Prompt // {activeReminder.time}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">{activeReminder.title}</span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{activeReminder.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {activeReminder.type === 'remedy' ? (
                <button
                  onClick={() => {
                    setCurrentTab('remedies');
                    setActiveReminder(null);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Open Remedies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentTab('mindcare');
                    setActiveReminder(null);
                  }}
                  className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Start MindCare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setActiveReminder(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Dismiss reminder"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {currentTab === 'biometrics' && (
          <BiometricsScan
            biometrics={biometrics}
            setBiometrics={setBiometrics}
            report={report}
            setReport={setReport}
            cloudHistory={cloudHistory}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'bodyfixer' && <Bodyfixer />}
        {currentTab === 'mindcare' && (
          <MindCare
            biometrics={biometrics}
            setBiometrics={setBiometrics}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'remedies' && <NaturalRemedies />}
        {currentTab === 'nutrition' && <NutritionEngine biometrics={biometrics} />}
        {currentTab === 'aihealer' && <AIHealerChat />}
        {currentTab === 'careplan' && <PersonalizedCarePlan biometrics={biometrics} />}
      </main>
    </div>
  );
}

export default App;
