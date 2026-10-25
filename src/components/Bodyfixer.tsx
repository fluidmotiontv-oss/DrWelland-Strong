import React, { useState } from 'react';
import { BodyfixProtocol } from '../types';
import { fetchBodyfix } from '../services/healthApi';
import { ShieldCheck, Activity, User, Sparkles, ChevronRight, Check } from 'lucide-react';

const BODY_REGIONS = [
  { id: 'cranial', name: 'Cranial & Neural Axis', icon: '🧠' },
  { id: 'cervical', name: 'Cervical Spine & Neck', icon: '🦴' },
  { id: 'thoracic', name: 'Thoracic & Upper Back', icon: '🛡️' },
  { id: 'lumbar', name: 'Lumbar & Core Stabilizers', icon: '⚡' },
  { id: 'joints', name: 'Major Joints & Knees', icon: '🦾' },
];

export const Bodyfixer: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState(BODY_REGIONS[0]);
  const [discomfort, setDiscomfort] = useState('General tightness and postural fatigue');
  const [protocol, setProtocol] = useState<BodyfixProtocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  const handleGenerateBodyfix = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setCompletedExercises({});
    try {
      const res = await fetchBodyfix(selectedRegion.name, discomfort);
      setProtocol(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOMATIC ALIGNMENT & BODYFIXER</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Anatomical Realignment & Tissue Repair
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Select a musculoskeletal region to receive precision somatic exercises, trigger point releases, and bio-frequency realignment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Region Selector */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Select Target Region
            </h3>

            <div className="space-y-3">
              {BODY_REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all ${
                    selectedRegion.id === reg.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner font-bold'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{reg.icon}</span>
                    {reg.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>

            <form onSubmit={handleGenerateBodyfix} className="space-y-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">
                  Specific Discomfort or Goal
                </label>
                <input
                  type="text"
                  value={discomfort}
                  onChange={(e) => setDiscomfort(e.target.value)}
                  placeholder="e.g. Lower back stiffness from prolonged desk work..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'CALCULATING ALIGNMENT...' : 'GENERATE BODYFIX PROTOCOL'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Cols: Protocol Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Active Protocol</div>
                <h3 className="text-xl font-bold font-mono text-white">
                  {protocol ? protocol.regionName : selectedRegion.name}
                </h3>
              </div>
              {protocol && (
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Resonance</div>
                  <div className="text-emerald-400 font-bold">{protocol.bioFrequencyHz} Hz</div>
                </div>
              )}
            </div>

            {protocol ? (
              <div className="space-y-6">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-mono text-emerald-400">ALIGNMENT OBJECTIVE</div>
                  <p className="text-sm text-slate-200 font-mono">{protocol.alignmentGoal}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Somatic Realignment Exercises
                  </h4>
                  <div className="space-y-3">
                    {protocol.somaticExercises.map((ex, idx) => {
                      const isCompleted = completedExercises[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => setCompletedExercises({ ...completedExercises, [idx]: !isCompleted })}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-emerald-400">0{idx + 1}</span>
                              <span className="font-mono font-bold text-white text-sm">{ex.title}</span>
                              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                                {ex.duration}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 pl-7">{ex.instruction}</p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                              isCompleted ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                            }`}
                          >
                            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Bio-Acupressure & Reflex Points
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {protocol.acupressurePoints.map((pt, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1">
                        <div className="font-mono font-bold text-sm text-white">{pt.pointName}</div>
                        <div className="text-xs font-mono text-emerald-400">{pt.location}</div>
                        <p className="text-xs text-slate-400 pt-1">{pt.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <Activity className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                <p className="text-slate-400 font-mono text-sm">
                  Click generate above to synthesize your custom somatic bodyfix protocol.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
