import React, { useState, useEffect } from 'react';
import { BiometricProfile, WeeklyCarePlan } from '../types';
import { fetchWeeklyCarePlan } from '../services/healthApi';
import { CalendarCheck, Sparkles, Sun, Moon, Waves, Check, Download, Activity, Heart, Shield, RefreshCw } from 'lucide-react';

interface PersonalizedCarePlanProps {
  biometrics: BiometricProfile;
}

export const PersonalizedCarePlan: React.FC<PersonalizedCarePlanProps> = ({ biometrics }) => {
  const [plan, setPlan] = useState<WeeklyCarePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [userGoals, setUserGoals] = useState('Optimize autonomic recovery, release cervical tension, and achieve peak mitochondrial vitality');

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await fetchWeeklyCarePlan(
        biometrics,
        'Cervical & Thoracic Spine',
        '432Hz Universal Harmonic & 528Hz DNA Repair',
        userGoals
      );
      setPlan(res);
      setActiveDayIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGeneratePlan();
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleExportPlan = () => {
    if (!plan) return;

    let content = `
========================================
DR. WELLAND-STRONG // 7-DAY PERSONALIZED CARE PLAN
Generated: ${new Date().toLocaleString()}
Focus: ${plan.primaryFocus}
Projected Vitality: ${plan.vitalityTarget}/100
========================================

[DIAGNOSTIC SYNTHESIS]
${plan.summary}

[WEEKLY CORE GUIDELINES]
${plan.weeklyGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

========================================
7-DAY DAILY SCHEDULE
========================================
`;

    plan.days.forEach((day) => {
      content += `
----------------------------------------
${day.dayName.toUpperCase()} // Theme: ${day.theme}
----------------------------------------
[MORNING SOMATIC ROUTINE]
- ${day.morningRoutine.title} (${day.morningRoutine.duration})
  ${day.morningRoutine.description}

[MIDDAY NEURAL HARMONIC]
- ${day.middayHarmonic.title} (${day.middayHarmonic.solfeggioHz} Hz)
  ${day.middayHarmonic.description}

[EVENING BOTANICAL ELIXIR]
- ${day.eveningElixir.title}
  Ingredients: ${day.eveningElixir.ingredients}
  ${day.eveningElixir.description}
`;
    });

    content += `
========================================
End of Personalized Care Plan
========================================
`;

    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dr_Welland_Strong_Care_Plan_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeDay = plan?.days[activeDayIndex];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero Intro */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
            <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-POWERED HOLISTIC CARE PLAN GENERATOR</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Personalized 7-Day Care Plan
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Dr. Welland-Strong synthesizes telemetry from your latest biometrics, bodyfixer alignment history, and neural mindcare sessions into a cohesive weekly action plan.
          </p>
        </div>
      </div>

      {/* Input Insights Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
            <span className="text-slate-400">Baseline Insights:</span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> HR: {biometrics.heartRate} BPM
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> HRV: {biometrics.hrv} ms
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Neural: {biometrics.neuralCoherence}%
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Bodyfix: Spine & Cranial
            </span>
          </div>

          <div className="flex items-center gap-3">
            {plan && (
              <button
                type="button"
                onClick={handleExportPlan}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Plan (.txt)
              </button>
            )}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Synthesizing...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-cyan-400 mb-1.5 uppercase tracking-wider">
            Custom Longevity Goal or Weekly Focus
          </label>
          <input
            type="text"
            value={userGoals}
            onChange={(e) => setUserGoals(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            placeholder="e.g. Focus on deep recovery, spinal decompression, and lowering nervous exhaustion..."
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
          <p className="text-sm font-mono text-slate-300">
            Dr. Welland-Strong is orchestrating your 7-day somatic routines, neural frequencies, and botanical remedies...
          </p>
        </div>
      ) : plan ? (
        <div className="space-y-6">
          {/* Plan Header Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Active Care Protocol</div>
              <h3 className="text-xl font-bold font-mono text-white">{plan.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {plan.summary}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Projected Vitality</div>
                <div className="text-3xl font-bold font-mono text-white mt-1">{plan.vitalityTarget} / 100</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">+8% Expected Improvement</div>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
                Primary Focus: <span className="text-cyan-300 font-bold">{plan.primaryFocus}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Tab Navigator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {plan.days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap shrink-0 transition-all ${
                  activeDayIndex === idx
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {day.dayName.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Active Day Detail Card */}
          {activeDay && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold font-mono text-white">{activeDay.dayName}</h4>
                  <p className="text-xs font-mono text-cyan-400">Theme: {activeDay.theme}</p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {Object.keys(completedTasks).filter((k) => k.startsWith(`day_${activeDayIndex}`)).length} / 3 Actions Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Morning Somatic Routine */}
                <div
                  className={`bg-slate-950/60 border rounded-xl p-5 space-y-3 transition-all ${
                    completedTasks[`day_${activeDayIndex}_morning`]
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                      <Sun className="w-4 h-4 text-amber-400" /> Morning Somatic
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(`day_${activeDayIndex}_morning`)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        completedTasks[`day_${activeDayIndex}_morning`]
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {completedTasks[`day_${activeDayIndex}_morning`] && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{activeDay.morningRoutine.title}</div>
                    <div className="text-[11px] font-mono text-slate-400">{activeDay.morningRoutine.duration}</div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeDay.morningRoutine.description}
                  </p>
                </div>

                {/* Midday Neural Harmonic */}
                <div
                  className={`bg-slate-950/60 border rounded-xl p-5 space-y-3 transition-all ${
                    completedTasks[`day_${activeDayIndex}_midday`]
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                      <Waves className="w-4 h-4 text-purple-400" /> Midday Harmonic
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(`day_${activeDayIndex}_midday`)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        completedTasks[`day_${activeDayIndex}_midday`]
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {completedTasks[`day_${activeDayIndex}_midday`] && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{activeDay.middayHarmonic.title}</div>
                    <div className="text-[11px] font-mono text-purple-300 font-bold">{activeDay.middayHarmonic.solfeggioHz} Hz Frequency</div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeDay.middayHarmonic.description}
                  </p>
                </div>

                {/* Evening Botanical Elixir */}
                <div
                  className={`bg-slate-950/60 border rounded-xl p-5 space-y-3 transition-all ${
                    completedTasks[`day_${activeDayIndex}_evening`]
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                      <Moon className="w-4 h-4 text-cyan-400" /> Evening Elixir
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(`day_${activeDayIndex}_evening`)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        completedTasks[`day_${activeDayIndex}_evening`]
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {completedTasks[`day_${activeDayIndex}_evening`] && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{activeDay.eveningElixir.title}</div>
                    <div className="text-[11px] font-mono text-amber-400">{activeDay.eveningElixir.ingredients}</div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeDay.eveningElixir.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Guidelines */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Core Weekly Longevity Guidelines
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.weeklyGuidelines.map((g, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 font-mono">
                  <span className="text-cyan-400 font-bold shrink-0">0{idx + 1}.</span>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
