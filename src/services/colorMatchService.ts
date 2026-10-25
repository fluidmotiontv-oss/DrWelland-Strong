export class ColorMatchService {
  async analyzeColorProfile(videoBlob: Blob): Promise<{ exposure: number; contrast: number; saturation: number }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        if (!ctx) {
          URL.revokeObjectURL(video.src);
          resolve({ exposure: 0, contrast: 1, saturation: 1 });
          return;
        }

        try {
          ctx.drawImage(video, 0, 0, 64, 64);
          const imgData = ctx.getImageData(0, 0, 64, 64).data;
          
          let totalLum = 0;
          let rSum = 0, gSum = 0, bSum = 0;
          let rVar = 0, gVar = 0, bVar = 0;
          const count = 64 * 64;

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            rSum += r;
            gSum += g;
            bSum += b;
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLum += lum;
          }

          const meanLum = totalLum / count;
          const meanR = rSum / count;
          const meanG = gSum / count;
          const meanB = bSum / count;

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            rVar += Math.pow(r - meanR, 2);
            gVar += Math.pow(g - meanG, 2);
            bVar += Math.pow(b - meanB, 2);
          }

          const stdDev = Math.sqrt((rVar + gVar + bVar) / (count * 3));

          const exposure = Number(((128 - meanLum) / 128 * 0.4).toFixed(2));
          const contrast = Number(Math.max(0.8, Math.min(1.5, 64 / Math.max(20, stdDev))).toFixed(2));
          const colorSpread = Math.abs(meanR - meanG) + Math.abs(meanG - meanB) + Math.abs(meanB - meanR);
          const saturation = Number(Math.max(0.7, Math.min(1.4, colorSpread / 40 + 0.9)).toFixed(2));

          URL.revokeObjectURL(video.src);
          resolve({ exposure, contrast, saturation });
        } catch {
          URL.revokeObjectURL(video.src);
          resolve({ exposure: 0, contrast: 1, saturation: 1 });
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve({ exposure: 0, contrast: 1, saturation: 1 });
      };
    });
  }
}

export const colorMatchService = new ColorMatchService();
