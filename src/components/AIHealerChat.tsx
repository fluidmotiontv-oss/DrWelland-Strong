import React, { useState } from 'react';
import { Sparkles, Send, Stethoscope, Bot, User } from 'lucide-react';
import { fetchDiagnosis } from '../services/healthApi';

export const AIHealerChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Greetings. I am Dr. Welland-Strong. I am your Starfleet-grade holistic medical AI and ultimate healer. How may I assist your body, mind, or vital energy today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const diagnosis = await fetchDiagnosis(
        { heartRate: 72, hrv: 65, bloodPressure: '120/80', oxygenSaturation: 99, neuralCoherence: 88, cellularVitality: 92, stressIndex: 25 },
        userMsg
      );

      const aiReply = `Based on your query regarding "${userMsg}", Dr. Welland-Strong prescribes the following protocol: Triage Level: ${diagnosis.triageLevel}. Analysis: ${diagnosis.rootCauseAnalysis} Recommended Action: ${diagnosis.correctiveProtocol?.[0] || 'Maintain harmonic balance and hydration.'}`;

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, quantum sensor telemetry encountered minor interference. Please rest and hydrate.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>DIRECT AI MEDICAL OFFICER CONSULTATION</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-mono">
            Consult Dr. Welland-Strong
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ask any health, longevity, somatic, or natural remedy question and receive instant Starfleet-grade diagnostic wisdom.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="h-[450px] overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`max-w-xl p-4 rounded-2xl text-sm font-mono leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 rounded-tr-none'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs font-mono text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Synthesizing Starfleet medical response...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Dr. Welland-Strong about symptoms, longevity protocols, or herbal remedies..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
