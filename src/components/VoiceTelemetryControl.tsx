import React, { useState, useEffect } from 'react';
import { ttsAnnouncer } from '../services/ttsAnnouncerService';
import { BiometricProfile, DiagnosticReport } from '../types';
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Play,
  Sliders,
  X,
  Settings,
  Shield,
  Activity,
} from 'lucide-react';

interface VoiceTelemetryControlProps {
  biometrics: BiometricProfile;
  report: DiagnosticReport | null;
}

export const VoiceTelemetryControl: React.FC<VoiceTelemetryControlProps> = ({
  biometrics,
  report,
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(ttsAnnouncer.getEnabled());
  const [volume, setVolume] = useState<number>(ttsAnnouncer.getVolume());
  const [rate, setRate] = useState<number>(ttsAnnouncer.getRate());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [speakingStatus, setSpeakingStatus] = useState<string | null>(null);

  useEffect(() => {
    setIsEnabled(ttsAnnouncer.getEnabled());
    setVolume(ttsAnnouncer.getVolume());
    setRate(ttsAnnouncer.getRate());
  }, []);

  const handleToggleEnable = () => {
    const next = ttsAnnouncer.toggleEnabled();
    setIsEnabled(next);
    if (next) {
      ttsAnnouncer.speak('Voice Telemetry Announcements Activated.', { prefixChime: true });
      setSpeakingStatus('Voice Telemetry Active');
      setTimeout(() => setSpeakingStatus(null), 3000);
    } else {
      ttsAnnouncer.stop();
      setSpeakingStatus('Voice Telemetry Muted');
      setTimeout(() => setSpeakingStatus(null), 3000);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ttsAnnouncer.setVolume(newVol);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    ttsAnnouncer.setRate(newRate);
  };

  const handleTestVoice = () => {
    ttsAnnouncer.testVoiceAnnouncement();
    setSpeakingStatus('Testing Voice Synthesis...');
    setTimeout(() => setSpeakingStatus(null), 4000);
  };

  const handleAnnounceFullStatus = () => {
    let summaryText = `Starfleet Biometric Diagnostic Summary. `;
    summaryText += `Heart rate is ${biometrics.heartRate} beats per minute. `;
    summaryText += `Heart rate variability resilience is ${biometrics.hrv} milliseconds. `;
    summaryText += `Neural matrix coherence is ${biometrics.neuralCoherence} percent. `;
    summaryText += `Cellular ATP vitality is ${biometrics.cellularVitality} percent. `;
    summaryText += `Sympathetic stress index is ${biometrics.stressIndex} percent. `;

    if (report) {
      summaryText += `AI Diagnostic Triage level is ${report.triageLevel}. Vitality rating: ${report.overallVitality} out of 100. `;
    }

    ttsAnnouncer.speak(summaryText, { prefixChime: true });
    setSpeakingStatus('Announcing Biometric Telemetry Summary...');
    setTimeout(() => setSpeakingStatus(null), 6000);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl relative font-sans backdrop-blur-md">
      {/* Left Info & Status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleEnable}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isEnabled
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 shadow-lg shadow-cyan-950/40'
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isEnabled ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
        >
          {isEnabled ? (
            <Volume2 className="w-5 h-5 animate-pulse text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isEnabled ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
              <span>VOICE TELEMETRY ANNOUNCER</span>
            </h4>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded uppercase border ${
                isEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {isEnabled ? 'TTS ACTIVE' : 'MUTED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {speakingStatus ||
              (isEnabled
                ? 'Automatic audio speech alerts active for critical metric deviations.'
                : 'Audio voice announcements disabled. Click speaker to activate.')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
        {isEnabled && (
          <button
            type="button"
            onClick={handleAnnounceFullStatus}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Spoken audio summary of current biometric status"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Announce Status</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isSettingsOpen
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Voice Speech Synthesis Controls"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Embedded Settings Sub-panel */}
      {isSettingsOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl z-30 space-y-4 font-mono text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-cyan-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              VOICE SPEECH SYNTHESIS CONFIGURATION
            </span>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Volume Slider */}
            <div className="space-y-1 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 uppercase font-bold">Voice Volume</span>
                <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 uppercase font-bold">Speech Rate / Speed</span>
                <span className="text-purple-300 font-bold">{rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
            <span className="text-[10px] text-slate-500">
              Uses native Web Speech Synthesis API (`SpeechSynthesisUtterance`).
            </span>
            <button
              type="button"
              onClick={handleTestVoice}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Voice Audio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
