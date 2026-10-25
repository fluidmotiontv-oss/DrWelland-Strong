import React, { useState } from 'react';
import { VideoClip } from '../../services/mediaService';
import { Plus, Video, Sparkles } from 'lucide-react';

interface MediaLibraryProps {
  clips: VideoClip[];
  onUpload: (files: FileList) => void;
  onSelect: (clip: VideoClip) => void;
}

const CATEGORIES = ['All', 'Indoor', 'Outdoor', 'Action', 'Interview', 'B-Roll'];

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ clips, onUpload, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredClips = clips.filter((clip) => {
    if (selectedCategory === 'All') return true;
    return clip.tags?.includes(selectedCategory);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-tight text-white/80">AI Media Library</h2>
        </div>
        <label className="cursor-pointer group">
          <input
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
            <Plus size={14} />
            <span className="text-xs font-medium">Import</span>
          </div>
        </label>
      </div>

      {/* AI Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[9px] font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20' 
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
        {filteredClips.length === 0 ? (
          <div className="col-span-2 aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20">
            <Video size={32} className="mb-2" />
            <p className="text-[10px] font-medium">No assets in {selectedCategory}</p>
          </div>
        ) : (
          filteredClips.map((clip) => (
            <div
              key={clip.id}
              onClick={() => onSelect(clip)}
              className="aspect-square rounded-xl bg-zinc-900 border border-white/5 overflow-hidden relative group cursor-pointer hover:border-white/20 transition-all flex flex-col justify-end"
              style={{ borderLeft: `4px solid ${clip.colorTag || 'transparent'}` }}
            >
              <video 
                src={clip.url} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                <div className="flex flex-wrap gap-1 mb-1 overflow-hidden">
                  {clip.tags?.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[6px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded uppercase font-semibold">{tag}</span>
                  ))}
                </div>
                <span className="text-[10px] font-medium truncate">{clip.suggestedFileName || clip.name}</span>
                <span className="text-[8px] font-mono text-white/40">{clip.duration.toFixed(1)}s · Block {clip.blockIndex !== undefined ? clip.blockIndex + 1 : '?'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
