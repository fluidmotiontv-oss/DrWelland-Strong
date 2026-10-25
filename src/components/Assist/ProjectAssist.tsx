import React from 'react';
import { motion } from 'framer-motion';
import { VideoClip } from '../../services/mediaService';
import { LayoutGrid, ClipboardList, BookOpen, ChevronRight } from 'lucide-react';

interface ProjectAssistProps {
  clips: VideoClip[];
  currentBlock: number;
  unitSize: number;
  onBlockSelect: (index: number) => void;
  onUnitSizeSelect: (size: number) => void;
}

export const ProjectAssist: React.FC<ProjectAssistProps> = ({ clips, currentBlock, unitSize, onBlockSelect, onUnitSizeSelect }) => {
  const blocks = Array.from({ length: 18 });

  const getClipsInBlock = (index: number) => clips.filter(c => c.blockIndex === index);

  const unitLabels: Record<number, string> = {
    30: '30S UNITS',
    60: '1M UNITS',
    180: '3M UNITS'
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/30 rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-white/60" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">Large Project Assist</h2>
          </div>
          <div className="text-[10px] font-mono text-white/40">{Math.round((unitSize * 18) / 60)} MIN PRODUCTION</div>
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {[30, 60, 180].map((size) => (
            <button
              key={size}
              onClick={() => onUnitSizeSelect(size)}
              className={`flex-1 py-1.5 text-[8px] font-bold rounded-md transition-all ${
                unitSize === size ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {size === 180 ? '3M' : size === 60 ? '1M' : '30S'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {blocks.map((_, i) => {
          const blockClips = getClipsInBlock(i);
          const duration = blockClips.reduce((acc, c) => acc + c.duration, 0);
          const isActive = currentBlock === i;

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onBlockSelect(i)}
              className={`w-full p-3 rounded-xl border transition-all text-left group ${
                isActive ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold opacity-60">BLOCK {String(i + 1).padStart(2, '0')}</span>
                <span className={`text-[9px] font-mono ${isActive ? 'text-black/40' : 'text-white/40'}`}>
                  {Math.floor(duration / 60)}:{String(Math.round(duration % 60)).padStart(2, '0')} / {unitSize === 180 ? '3' : unitSize === 60 ? '1' : '0.5'}:00
                </span>
              </div>
              
              <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-black/10">
                {blockClips.map((c) => (
                  <div 
                    key={c.id} 
                    className="h-full" 
                    style={{ 
                      width: `${(c.duration / unitSize) * 100}%`,
                      backgroundColor: c.colorTag || '#ffffff' 
                    }} 
                  />
                ))}
              </div>

              {isActive && (
                <div className="mt-2 text-[10px] font-medium flex items-center gap-1">
                   <ClipboardList size={10} />
                   <span>Editing sequence...</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-medium text-white/40">
          <span>PROJECT PROGRESS</span>
          <span>{Math.round((clips.length / 100) * 100)}%</span>
        </div>
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
           <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(clips.length / 100) * 100}%` }}
           />
        </div>
      </div>
    </div>
  );
};
