import { openDB, IDBPDatabase } from 'idb';
import { aiTaggingService } from './aiTaggingService';

export interface VideoClip {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  width: number;
  height: number;
  mimeType: string;
  addedAt: number;
  clipType: 'video' | 'audio';
  // Precision Editing
  trimIn: number;
  trimOut: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  transition?: 'none' | 'cross-dissolve' | 'fade-to-black' | 'fade-to-white' | 'glitch' | 'zoom-in';
  // Intelligent Metadata
  tags?: string[];
  mood?: string;
  sceneDescription?: string;
  audioPeak?: number;
  // Project Management
  blockIndex?: number;
  colorTag?: string;
  suggestedFileName?: string;
  grading?: { exposure: number; contrast: number; saturation: number };
}

const DB_NAME = 'FluidMotionDB';
const STORE_NAME = 'clips';

class MediaService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async saveClip(file: File): Promise<VideoClip> {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    const clipType = file.type.startsWith('audio/') ? 'audio' : 'video';
    
    // Get media duration and dimensions
    const metadata = clipType === 'video' 
      ? await this.getVideoMetadata(url)
      : await this.getAudioMetadata(url);
    
    const tags = clipType === 'video' 
      ? await aiTaggingService.categorizeClip(file.name, metadata.duration, metadata.width || 0, metadata.height || 0)
      : ['Audio'];

    const clip: VideoClip = {
      id,
      name: file.name,
      blob: file,
      url,
      duration: metadata.duration,
      width: metadata.width || 0,
      height: metadata.height || 0,
      mimeType: file.type,
      addedAt: Date.now(),
      clipType,
      trimIn: 0,
      trimOut: metadata.duration,
      volume: 1.0,
      fadeIn: 0,
      fadeOut: 0,
      transition: 'none',
      tags
    };

    const dbIdb = await this.db;
    await dbIdb.put(STORE_NAME, clip);

    return clip;
  }

  private getAudioMetadata(url: string): Promise<{ duration: number; width?: number; height?: number }> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve({ duration: audio.duration });
      };
      audio.src = url;
    });
  }

  async getAllClips(): Promise<VideoClip[]> {
    const dbIdb = await this.db;
    const localClips = await dbIdb.getAll(STORE_NAME);
    
    // Re-create URLs for local blobs
    return localClips.map(clip => ({
      ...clip,
      url: URL.createObjectURL(clip.blob)
    }));
  }

  async deleteClip(id: string) {
    const dbIdb = await this.db;
    await dbIdb.delete(STORE_NAME, id);
  }

  async saveClipDirect(clip: VideoClip): Promise<void> {
    const dbIdb = await this.db;
    await dbIdb.put(STORE_NAME, clip);
  }

  async auditDirectory(): Promise<{ name: string; size: number; type: string }[]> {
    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      const auditLog: { name: string; size: number; type: string }[] = [];
      
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (file.type.startsWith('video/')) {
            auditLog.push({
              name: file.name,
              size: file.size,
              type: file.type
            });
          }
        }
      }
      return auditLog;
    } catch (error) {
      console.error('Directory audit failed:', error);
      return [];
    }
  }

  private getVideoMetadata(url: string): Promise<{ duration: number; width: number; height: number }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.src = url;
    });
  }
}

export const mediaService = new MediaService();
