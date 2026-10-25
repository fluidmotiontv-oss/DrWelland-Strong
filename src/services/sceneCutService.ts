export class SceneCutService {
  async detectSceneCuts(
    videoBlob: Blob, 
    duration: number, 
    onProgress?: (progress: number) => void
  ): Promise<number[]> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'auto';

      const cuts: number[] = [];
      const sampleInterval = Math.max(0.5, duration / 60); // sample up to 60 points
      let currentTime = 0;
      
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      let prevHistogram: number[] | null = null;

      const getHistogram = (): number[] => {
        if (!ctx) return new Array(32).fill(0);
        try {
          ctx.drawImage(video, 0, 0, 32, 32);
          const imgData = ctx.getImageData(0, 0, 32, 32).data;
          const hist = new Array(32).fill(0);
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const lum = Math.floor((0.299 * r + 0.587 * g + 0.114 * b) / 8);
            hist[Math.min(31, lum)]++;
          }
          const total = 32 * 32;
          return hist.map(v => v / total);
        } catch {
          return new Array(32).fill(0);
        }
      };

      const computeDifference = (h1: number[], h2: number[]): number => {
        let diff = 0;
        for (let i = 0; i < h1.length; i++) {
          diff += Math.abs(h1[i] - h2[i]);
        }
        return diff;
      };

      video.onloadedmetadata = async () => {
        if (duration <= 2.0) {
          URL.revokeObjectURL(video.src);
          resolve([]);
          return;
        }

        while (currentTime <= duration) {
          video.currentTime = currentTime;
          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked);
            setTimeout(res, 250); // safety fallback
          });

          const currentHist = getHistogram();
          if (prevHistogram) {
            const diff = computeDifference(prevHistogram, currentHist);
            // Threshold for scene cut
            if (diff > 0.32 && currentTime > 0.5 && currentTime < duration - 0.5) {
              cuts.push(Number(currentTime.toFixed(2)));
            }
          }
          prevHistogram = currentHist;

          currentTime += sampleInterval;
          if (onProgress) {
            onProgress(Math.min(100, (currentTime / duration) * 100));
          }
        }

        URL.revokeObjectURL(video.src);
        resolve(cuts);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve([]);
      };
    });
  }
}

export const sceneCutService = new SceneCutService();
