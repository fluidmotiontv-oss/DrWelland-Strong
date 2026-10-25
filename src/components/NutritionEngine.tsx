import React, { useState, useEffect } from 'react';
import { BiometricProfile, NutritionProtocolResponse } from '../types';
import { fetchNutritionRecommendations } from '../services/healthApi';
import { Utensils, Sparkles, Heart, Activity, ShieldCheck, Flame, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface NutritionEngineProps {
  biometrics: BiometricProfile;
}

const PROTOCOLS = [
  { id: 'gut_barrier', name: 'Microbiome Diversity & Gut Barrier Repair', focus: 'SCFAs, Butyrate & Tight Junctions' },
  { id: 'anti_inflammatory', name: 'Deep Anti-Inflammatory & Polyphenol Matrix', focus: 'NF-kB Inhibition & Vascular Health' },
  { id: 'mitochondrial', name: 'Mitochondrial Autophagy & Cellular Energy', focus: 'NAD+ Support & Low-Glycemic Fuel' },
  { id: 'neuro_calm', name: 'Gut-Brain Axis & Neuro-Inflammation Relief', focus: 'GABA Precursors & Vagal Tone' },
];

export const NutritionEngine: React.FC<NutritionEngineProps> = ({ biometrics }) => {
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [dietaryPreferences, setDietaryPreferences] = useState('Whole foods, gluten-free, anti-inflammatory, organic');
  const [nutritionData, setNutritionData] = useState<NutritionProtocolResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateNutrition = async (protocolItem = selectedProtocol) => {
    setSelectedProtocol(protocolItem);
    setLoading(true);
    try {
      const res = await fetchNutritionRecommendations(
        biometrics,
        protocolItem.name,
        dietaryPreferences
      );
      setNutritionData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateNutrition(PROTOCOLS[0]);
  }, []);

  const handleExportMealPlan = () => {
    if (!nutritionData) return;

    let content = `
========================================
DR. WELLAND-STRONG // PRECISION NUTRITION PRESCRIPTION
Generated: ${new Date().toLocaleString()}
Protocol: ${nutritionData.protocolName}
Systemic Inflammation Index: ${nutritionData.inflammationIndexScore}/100
========================================

[BIOMETRIC RATIONALE]
${nutritionData.biometricRationale}

[MEAL RECOMMENDATIONS]
`;

    nutritionData.meals.forEach((m) => {
      content += `
----------------------------------------
${m.mealType.toUpperCase()}: ${m.title}
----------------------------------------
- Ingredients: ${m.ingredients.join(', ')}
- Bioactive Compounds: ${m.bioactiveCompounds}
- Gut-Health Mechanism: ${m.gutHealthMechanism}
- Chef's Preparation Note: ${m.preparationNote}
`;
    });

    content += `
----------------------------------------
PROBIOTIC FERMENT RECOMMENDATIONS:
${nutritionData.probioticFerments.map((p, i) => `${i + 1}. ${p}`).join('\n')}

POLYPHENOL BOOSTERS:
${nutritionData.polyphenolBoosters.map((b, i) => `${i + 1}. ${b}`).join('\n')}
========================================
End of Precision Nutrition Protocol
========================================
`;

    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dr_Welland_Strong_Nutrition_Plan_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRECISION NUTRITION & GUT-HEALTH ENGINE</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Anti-Inflammatory & Microbiome Protocols
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Cross-references live cardiovascular, HRV, and cellular vitality telemetry with peer-reviewed anti-inflammatory compounds and gut mucosal restoration science.
          </p>
        </div>
      </div>

      {/* Biometric Integration Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
            <span className="text-slate-400">Cross-Referenced Telemetry:</span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> HRV: {biometrics.hrv} ms
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate: {biometrics.heartRate} BPM
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cellular Vitality: {biometrics.cellularVitality}%
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">
              <Flame className="w-3.5 h-3.5 text-emerald-400" /> Low Inflammatory Tone
            </span>
          </div>

          <div className="flex items-center gap-3">
            {nutritionData && (
              <button
                type="button"
                onClick={handleExportMealPlan}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Meal Plan (.txt)
              </button>
            )}
            <button
              onClick={() => handleGenerateNutrition()}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Synthesizing...' : 'Regenerate Meals'}
            </button>
          </div>
        </div>

        {/* Dietary Protocol Selector */}
        <div className="pt-2">
          <div className="text-[11px] font-mono text-emerald-400 mb-2 uppercase tracking-wider">
            Select Dietary Protocol
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleGenerateNutrition(p)}
                className={`p-3 rounded-xl border text-left font-mono transition-all ${
                  selectedProtocol.id === p.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-inner'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className={`text-xs font-bold ${selectedProtocol.id === p.id ? 'text-white' : 'text-slate-300'}`}>
                  {p.name}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1">{p.focus}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-emerald-400 mb-1.5 uppercase tracking-wider">
            Dietary Preferences & Allergens
          </label>
          <input
            type="text"
            value={dietaryPreferences}
            onChange={(e) => setDietaryPreferences(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            placeholder="e.g. Gluten-free, dairy-free, pescatarian, low-FODMAP..."
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto animate-spin" />
          <p className="text-sm font-mono text-slate-300">
            Dr. Welland-Strong is cross-referencing inflammatory pathways and gut microbiome diversity to prepare your meals...
          </p>
        </div>
      ) : nutritionData ? (
        <div className="space-y-6">
          {/* Rationale & Inflammation Index Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Biometric Dietary Rationale</div>
              <h3 className="text-xl font-bold font-mono text-white">{nutritionData.protocolName}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {nutritionData.biometricRationale}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Systemic Inflammation Index</div>
                <div className="text-3xl font-bold font-mono text-white mt-1">{nutritionData.inflammationIndexScore} / 100</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">Optimal Low-Inflammatory State</div>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Microbiome Diversity Protected</span>
              </div>
            </div>
          </div>

          {/* 4 Precision Meals Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Precision Meal Prescriptions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nutritionData.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                      {meal.mealType}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Nutrient Dense</span>
                  </div>

                  <div>
                    <h5 className="font-mono font-bold text-base text-white">{meal.title}</h5>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-400">Key Functional Ingredients:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className="text-[11px] font-mono text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-amber-400 font-bold">Bioactive Compounds: </span>
                      <span className="text-slate-300">{meal.bioactiveCompounds}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-bold">Gut-Health Mechanism: </span>
                      <span className="text-slate-300">{meal.gutHealthMechanism}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 italic">
                    <span className="text-slate-300 font-semibold not-italic">Chef's Prep: </span>
                    {meal.preparationNote}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probiotic Ferments & Polyphenols Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Targeted Live Probiotic Ferments
              </h4>
              <div className="space-y-2">
                {nutritionData.probioticFerments.map((pf, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 font-mono">
                    {pf}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Cellular Polyphenol Antioxidant Boosters
              </h4>
              <div className="space-y-2">
                {nutritionData.polyphenolBoosters.map((pb, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 font-mono">
                    {pb}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
