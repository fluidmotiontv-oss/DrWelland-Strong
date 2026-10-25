import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { Activity, ShieldCheck, HeartPulse, Compass, Sparkles, Stethoscope, LogIn, LogOut, Cloud, CalendarCheck, Utensils } from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../services/firebaseClient';
import { onAuthStateChanged, User } from 'firebase/auth';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onRunScan: () => void;
  isScanning: boolean;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onRunScan,
  isScanning,
  onSyncCloud,
  isSyncing,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
          <Stethoscope className="w-5 h-5 text-slate-950 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-cyan-400 font-mono">DR. WELLAND-STRONG</h1>
          <p className="text-[10px] text-cyan-300/70 tracking-widest uppercase font-mono">Starfleet Medical Tricorder v9.4</p>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
        <button
          onClick={() => onSelectTab('biometrics')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'biometrics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          Biometrics
        </button>
        <button
          onClick={() => onSelectTab('bodyfixer')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'bodyfixer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Bodyfixer
        </button>
        <button
          onClick={() => onSelectTab('mindcare')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'mindcare'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-purple-400" />
          Mind Care
        </button>
        <button
          onClick={() => onSelectTab('remedies')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'remedies'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          Remedies
        </button>
        <button
          onClick={() => onSelectTab('nutrition')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'nutrition'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Utensils className="w-4 h-4 text-emerald-400" />
          Nutrition
        </button>
        <button
          onClick={() => onSelectTab('aihealer')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'aihealer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Healer
        </button>
        <button
          onClick={() => onSelectTab('careplan')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 font-mono text-xs ${
            currentTab === 'careplan'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-teal-400" />
          Care Plan
        </button>
      </nav>

      {/* Zone 3: Primary Action & Cloud Sync */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onSyncCloud}
              disabled={isSyncing}
              className="px-3.5 py-2 text-xs font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-1.5"
              title="Sync Biometrics to Firestore Cloud"
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Cloud Sync'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{user.displayName || user.email?.split('@')[0]}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-3.5 py-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            Sign In for Cloud Sync
          </button>
        )}

        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="px-5 py-2.5 text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'SCANNING...' : 'RUN SCAN'}
        </button>
      </div>
    </header>
  );
};
