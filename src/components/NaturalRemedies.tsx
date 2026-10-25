import React, { useState } from 'react';
import { RemedyPrescription } from '../types';
import { fetchRemedies } from '../services/healthApi';
import { Compass, Sparkles, Leaf, Pill, Check } from 'lucide-react';

const CONDITIONS = [
  'Cellular Fatigue & Low Energy',
  'Cranial Tension & Mental Fog',
  'Immune Resilience & Defense',
  'Deep Sleep & Circadian Reset',
  'Digestive Core Harmonization',
];

export const NaturalRemedies: React.FC = () => {
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);
  const [prescription, setPrescription] = useState<RemedyPrescription | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchRemedies = async (conditionVal: string) => {
    setSelectedCondition(conditionVal);
    setLoading(true);
    try {
      const res = await fetchRemedies(conditionVal);
      setPrescription(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleFetchRemedies(CONDITIONS[0]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>BOTANICAL PHARMACY & QUANTUM HERBALISM</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Natural Remedies & Nutritional Protocols
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            AI-powered herbal tinctures, adaptogens, and quantum nutrition tailored to your specific constitutional profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Condition Selector */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-amber-400 font-mono flex items-center gap-2">
              <Leaf className="w-5 h-5 text-amber-400" />
              Constitutional Target
            </h3>

            <div className="space-y-3">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  onClick={() => handleFetchRemedies(cond)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all ${
                    selectedCondition === cond
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner font-bold'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span>{cond}</span>
                  {selectedCondition === cond && <Sparkles className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Prescription Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">Prescription Formula</div>
                <h3 className="text-xl font-bold font-mono text-white">
                  {loading ? 'Synthesizing Formula...' : prescription?.primaryFormula || 'Quantum Elixir'}
                </h3>
              </div>
              <Pill className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            {loading ? (
              <div className="text-center py-16 space-y-4">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
                <p className="text-slate-400 font-mono text-sm">Consulting ancient botanical databases & quantum herbalism...</p>
              </div>
            ) : prescription ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    Botanical Ingredients & Tinctures
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescription.herbs?.map((herb, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-sm text-white">{herb.herbName}</span>
                          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {herb.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 pt-1">{herb.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    Nutritional & Dietary Protocol
                  </h4>
                  <div className="space-y-2">
                    {prescription.nutritionalProtocol?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 rounded-xl p-4 space-y-1">
                    <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider">Quantum Healing Tip</div>
                    <p className="text-xs text-amber-200/90 font-mono">{prescription.quantumTip}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
