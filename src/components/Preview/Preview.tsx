import React, { useRef, useEffect, useState } from 'react';
import { VideoProcessor } from '../../services/videoProcessor';
import { Play, Pause, Maximize, Settings2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoClip } from '../../services/mediaService';
import { colorMatchService } from '../../services/colorMatchService';

interface PreviewProps {
  clipUrl?: string;
  clipName?: string;
  playbackTime?: number;
  onTimeUpdate?: (time: number) => void;
  grading: { exposure: number; contrast: number; saturation: number };
  onGradingChange: (grading: { exposure: number; contrast: number; saturation: number }) => void;
  activeBlock: number;
  onApplyToBlock: () => void;
  clips?: VideoClip[];
}

const GRADING_PRESETS = [
  { name: 'Default', grading: { exposure: 0, contrast: 1, saturation: 1 } },
  { name: 'Teal & Orange', grading: { exposure: 0.1, contrast: 1.2, saturation: 1.1 } },
  { name: 'Warm Vintage', grading: { exposure: 0.2, contrast: 0.9, saturation: 0.85 } },
  { name: 'Cyberpunk Neon', grading: { exposure: -0.1, contrast: 1.3, saturation: 1.4 } },
  { name: 'Noir Monolith', grading: { exposure: 0, contrast: 1.5, saturation: 0.0 } },
  { name: 'Golden Hour', grading: { exposure: 0.15, contrast: 1.1, saturation: 1.2 } },
];

export const Preview: React.FC<PreviewProps> = ({ 
  clipUrl, 
  clipName, 
  playbackTime, 
  grading, 
  onGradingChange, 
  activeBlock, 
  onApplyToBlock,
  clips = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processorRef = useRef<VideoProcessor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [selectedRefId, setSelectedRefId] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !processorRef.current) {
      processorRef.current = new VideoProcessor(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    const renderLoop = () => {
      if (videoRef.current && processorRef.current && !videoRef.current.paused) {
        processorRef.current.render(videoRef.current, grading);
      }
      requestAnimationFrame(renderLoop);
    };
    const id = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(id);
  }, [grading]);

  useEffect(() => {
    if (videoRef.current && playbackTime !== undefined) {
      videoRef.current.currentTime = playbackTime;
    }
  }, [playbackTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const blockClips = clips.filter(c => c.blockIndex === activeBlock && c.clipType === 'video');

  const handleAiColorMatch = async () => {
    const refClip = clips.find(c => c.id === selectedRefId) || blockClips[0];
    if (!refClip) {
      alert('Please select or upload a video clip in this block to use as a reference.');
      return;
    }

    setIsMatching(true);
    try {
      let targetGrade = refClip.grading;
      if (!targetGrade || (targetGrade.exposure === 0 && targetGrade.contrast === 1 && targetGrade.saturation === 1)) {
        targetGrade = await colorMatchService.analyzeColorProfile(refClip.blob);
      }
      
      onGradingChange(targetGrade);
      onApplyToBlock();
      alert(`AI Color Match complete! Matched color profile of "${refClip.suggestedFileName || refClip.name}" and applied across Block ${activeBlock + 1}.`);
    } catch (error) {
      console.error('AI color match failed:', error);
      alert('AI color match failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5 group">
      <video
        ref={videoRef}
        src={clipUrl}
        className="hidden"
        loop
        playsInline
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-full object-contain"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">{clipName || 'Preview'}</span>
              <span className="text-xs font-mono tabular-nums">
                {videoRef.current?.currentTime.toFixed(2)} / {videoRef.current?.duration.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              <Settings2 size={18} />
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grading Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute top-0 right-0 h-full w-72 bg-black/90 backdrop-blur-xl border-l border-white/10 p-4 z-10 flex flex-col justify-between overflow-y-auto custom-scrollbar"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Cinematic Grading</h3>
                <button 
                  onClick={() => onGradingChange({ exposure: 0, contrast: 1, saturation: 1 })}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium underline"
                >
                  Reset to Default
                </button>
              </div>

              {/* AI Color Match Section */}
              <div className="mb-5 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">AI Color Match</span>
                </div>
                <div className="space-y-2">
                  <select
                    value={selectedRefId}
                    onChange={(e) => setSelectedRefId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                  >
                    <option value="">Select Reference Clip...</option>
                    {blockClips.map((c) => (
                      <option key={c.id} value={c.id}>{c.suggestedFileName || c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAiColorMatch}
                    disabled={isMatching}
                    className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isMatching ? 'Analyzing Color Profile...' : `Match Block ${activeBlock + 1} Colors`}
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="mb-6">
                <label className="text-[10px] text-white/40 block mb-2 uppercase tracking-wider">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADING_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onGradingChange(preset.grading)}
                      className="p-2 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-medium text-white transition-all truncate"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(grading).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/40 mb-1">
                      <span>{key}</span>
                      <span className="text-white">{value.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={key === 'exposure' ? -2 : 0}
                      max={key === 'exposure' ? 2 : 2}
                      step="0.01"
                      value={value}
                      onChange={(e) => onGradingChange({ ...grading, [key]: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={onApplyToBlock}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs rounded-xl shadow-lg transition-all active:scale-95"
              >
                Apply to Block {activeBlock + 1}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
