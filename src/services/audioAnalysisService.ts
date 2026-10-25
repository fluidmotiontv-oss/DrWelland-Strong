export interface BeatPoint {
  time: number;
  strength: number;
}

export class AudioAnalysisService {
  /**
   * Analyzes an audio blob to detect rhythmic energy peaks (beats/transients)
   */
  async analyzeBeats(audioBlob: Blob): Promise<BeatPoint[]> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // RMS energy window analysis (50ms windows)
      const windowSize = Math.floor(sampleRate * 0.05);
      const hopSize = Math.floor(windowSize / 2);
      const peaks: BeatPoint[] = [];

      let energies: number[] = [];
      for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          sum += channelData[i + j] * channelData[i + j];
        }
        const rms = Math.sqrt(sum / windowSize);
        energies.push(rms);
      }

      // Adaptive threshold peak detection (~1s local sliding window)
      const historyWindow = 20;
      const thresholdMultiplier = 1.25;

      for (let i = historyWindow; i < energies.length - historyWindow; i++) {
        let localSum = 0;
        for (let j = i - historyWindow; j <= i + historyWindow; j++) {
          localSum += energies[j];
        }
        const localAvg = localSum / (historyWindow * 2 + 1);

        if (energies[i] > localAvg * thresholdMultiplier && energies[i] > 0.04) {
          const time = (i * hopSize) / sampleRate;
          // Minimum interval between beats (~0.3s)
          if (peaks.length === 0 || time - peaks[peaks.length - 1].time > 0.3) {
            peaks.push({
              time: parseFloat(time.toFixed(2)),
              strength: parseFloat(energies[i].toFixed(2))
            });
          }
        }
      }

      return peaks;
    } catch (error) {
      console.error('Audio peak analysis failed:', error);
      return [];
    }
  }

  /**
   * Suggests snap/trim points for video clips to match the detected music beat grid
   */
  suggestTrimPoints(clipDuration: number, beats: BeatPoint[]): number[] {
    // Filter beats within clip duration
    const validBeats = beats.filter(b => b.time <= clipDuration && b.time > 0.5);
    return validBeats.map(b => b.time);
  }
}

export const audioAnalysisService = new AudioAnalysisService();
