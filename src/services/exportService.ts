import { VideoClip } from './mediaService';
import { VideoProcessor } from './videoProcessor';

export interface ExportProgress {
  percentage: number;
  status: string;
}

export class ExportService {
  private canvas: HTMLCanvasElement;
  private processor: VideoProcessor;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.processor = new VideoProcessor(this.canvas);
  }

  async exportTimeline(
    clips: VideoClip[], 
    grading: { exposure: number; contrast: number; saturation: number },
    onProgress: (progress: ExportProgress) => void
  ): Promise<Blob> {
    this.recordedChunks = [];
    const stream = this.canvas.captureStream(30); // 30 FPS
    
    // Select a supported mime type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8000000 // 8 Mbps for high quality
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    return new Promise(async (resolve, reject) => {
      if (!this.mediaRecorder) return reject('Failed to initialize MediaRecorder');

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.start();
      
      const totalDuration = clips.reduce((acc, clip) => acc + clip.duration, 0);
      let currentTime = 0;

      const videoElement = document.createElement('video');
      videoElement.muted = true;
      videoElement.playsInline = true;

      for (const clip of clips) {
        onProgress({ 
          percentage: Math.round((currentTime / totalDuration) * 100), 
          status: `Rendering ${clip.name}...` 
        });

        videoElement.src = clip.url;
        await new Promise((r) => {
          videoElement.onloadedmetadata = r;
        });

        // Play and record the clip
        videoElement.play();
        
        const renderClip = () => {
          return new Promise<void>((r) => {
            const checkEnd = () => {
              if (videoElement.paused || videoElement.ended) {
                r();
                return;
              }
              this.processor.render(videoElement, clip.grading || grading);
              requestAnimationFrame(checkEnd);
            };
            checkEnd();
          });
        };

        await renderClip();
        currentTime += clip.duration;
      }

      this.mediaRecorder.stop();
      onProgress({ percentage: 100, status: 'Export Complete' });
    });
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
