import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoClip } from '../../services/mediaService';
import { Scissors, Music, Magnet, Activity, Sparkles } from 'lucide-react';
import { audioAnalysisService, BeatPoint } from '../../services/audioAnalysisService';

interface TimelineProps {
  clips: VideoClip[];
  activeBlock: number;
  unitSize: number;
  onClipSelect: (clip: VideoClip) => void;
  onClipUpdate: (id: string, updates: Partial<VideoClip>) => void;
  onTimeChange: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ clips, activeBlock, unitSize, onClipSelect, onClipUpdate }) => {
  const [zoom, setZoom] = useState(10); // pixels per second
  const [playhead, setPlayhead] = useState(0);
  const [beats, setBeats] = useState<BeatPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const blockClips = clips.filter(c => c.blockIndex === activeBlock);
  const videoClips = blockClips.filter(c => c.clipType === 'video');
  const audioClips = blockClips.filter(c => c.clipType === 'audio');

  const handleTrim = (clip: VideoClip, type: 'in' | 'out', delta: number) => {
    const change = delta / zoom;
    if (type === 'in') {
      const newIn = Math.max(0, Math.min(clip.trimOut - 0.1, clip.trimIn + change));
      onClipUpdate(clip.id, { trimIn: newIn });
    } else {
      const newOut = Math.max(clip.trimIn + 0.1, Math.min(clip.duration, clip.trimOut + change));
      onClipUpdate(clip.id, { trimOut: newOut });
    }
  };

  const handleBeatAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      if (audioClips.length > 0) {
        const detectedBeats = await audioAnalysisService.analyzeBeats(audioClips[0].blob);
        setBeats(detectedBeats);
      } else {
        // Fallback harmonic grid based on 432Hz pacing (~2.0s per beat)
        const syntheticBeats: BeatPoint[] = [];
        for (let t = 2; t <= unitSize; t += 2.0) {
          syntheticBeats.push({ time: t, strength: 0.8 });
        }
        setBeats(syntheticBeats);
      }
    } catch (error) {
      console.error('Beat analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSnapToGrid = () => {
    if (beats.length === 0 || videoClips.length === 0) return;
    
    // Snap video clips trimOut points to nearest detected beats
    videoClips.forEach((clip, index) => {
      const targetBeat = beats[index % beats.length];
      if (targetBeat && targetBeat.time > clip.trimIn) {
        const newDuration = Math.min(clip.duration, targetBeat.time - clip.trimIn);
        if (newDuration > 0.5) {
          onClipUpdate(clip.id, { trimOut: clip.trimIn + newDuration });
        }
      }
    });
  };

  const renderClip = (clip: VideoClip, isAudio: boolean) => {
    const displayDuration = clip.trimOut - clip.trimIn;
    return (
      <div 
        key={clip.id}
        className={`relative rounded-lg border border-white/10 overflow-hidden group cursor-pointer h-full transition-colors ${
          isAudio ? 'bg-indigo-500/20 hover:border-indigo-400/40' : 'bg-zinc-800 hover:border-white/30'
        }`}
        style={{ 
          width: displayDuration * zoom,
          borderBottom: !isAudio ? `2px solid ${clip.colorTag || 'transparent'}` : 'none'
        }}
        onClick={() => onClipSelect(clip)}
      >
        <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent" />
        
        {/* Trim Handles */}
        <motion.div
          drag="x"
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={(_, info) => handleTrim(clip, 'in', info.delta.x)}
          className="absolute left-0 top-0 bottom-0 w-3 bg-white/10 hover:bg-white/40 cursor-ew-resize z-20 flex items-center justify-center"
        >
          <div className="w-0.5 h-4 bg-white/40 rounded-full" />
        </motion.div>

        <motion.div
          drag="x"
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={(_, info) => handleTrim(clip, 'out', info.delta.x)}
          className="absolute right-0 top-0 bottom-0 w-3 bg-white/10 hover:bg-white/40 cursor-ew-resize z-20 flex items-center justify-center"
        >
          <div className="w-0.5 h-4 bg-white/40 rounded-full" />
        </motion.div>

        <div className="px-4 py-2 flex flex-col justify-center h-full pointer-events-none">
          <span className="text-[9px] font-bold truncate text-white/60">{clip.suggestedFileName || clip.name}</span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[8px] font-mono opacity-40">{displayDuration.toFixed(2)}s</span>
             {isAudio && <Music size={8} className="text-indigo-400" />}
          </div>
        </div>

        {/* Waveform/Visual indicator */}
        <div className="absolute inset-0 flex items-center gap-0.5 px-4 opacity-10 pointer-events-none">
           {isAudio && Array.from({length: 20}).map((_, i) => (
             <div key={i} className="w-0.5 bg-white" style={{ height: `${Math.random() * 60 + 20}%` }} />
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBeatAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Activity size={14} className={isAnalyzing ? 'animate-spin' : ''} />
              <span>{isAnalyzing ? 'Analyzing Beats...' : 'AI Beat Analysis'}</span>
            </button>

            {beats.length > 0 && (
              <button 
                onClick={handleSnapToGrid}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                <Sparkles size={14} />
                <span>Snap Cuts to Beats ({beats.length})</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="2" 
            max="100" 
            value={zoom} 
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none accent-white"
          />
        </div>
      </div>

      {/* Tracks Container */}
      <div className="relative flex-1 overflow-x-auto custom-scrollbar bg-black/40">
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white z-30 pointer-events-none"
          style={{ left: playhead * zoom }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rotate-45 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>

        {/* Beat Markers on Ruler */}
        {beats.map((beat, idx) => (
          <div 
            key={idx}
            className="absolute top-0 bottom-0 w-[1px] bg-cyan-400/60 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: beat.time * zoom }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] -mt-1" />
          </div>
        ))}

        {/* Time Ruler */}
        <div className="h-6 border-b border-white/5 flex items-end sticky top-0 bg-black/80 backdrop-blur z-20">
          {Array.from({ length: Math.ceil(Math.max(unitSize, 180)) + 1 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 border-l border-white/10 h-2"
              style={{ width: zoom }}
            >
              {i % (unitSize >= 60 ? 10 : 5) === 0 && <span className="text-[8px] font-mono text-white/20 ml-1">{i}s</span>}
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="p-4 space-y-4 min-w-max h-[calc(100%-1.5rem)]">
          {/* Video Track */}
          <div className="flex flex-col gap-1">
            <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Video Stream</div>
            <div className="flex gap-0.5 h-16">
              {videoClips.length > 0 ? videoClips.map(c => renderClip(c, false)) : (
                <div className="flex-1 border border-dashed border-white/5 rounded-lg flex items-center justify-center">
                   <span className="text-[10px] text-white/10">No visual assets in block</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Audio Track */}
          <div className="flex flex-col gap-1">
            <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Audio Stream</div>
            <div className="flex gap-0.5 h-12">
              {audioClips.length > 0 ? audioClips.map(c => renderClip(c, true)) : (
                <div className="flex-1 border border-dashed border-indigo-500/10 rounded-lg flex items-center justify-center">
                   <span className="text-[10px] text-white/10">No rhythmic assets in block</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
