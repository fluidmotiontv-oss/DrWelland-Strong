export class AiTaggingService {
  /**
   * Automatically categorizes clips by visual content based on filename, duration, and resolution
   */
  async categorizeClip(fileName: string, duration: number, width: number, height: number): Promise<string[]> {
    const tags: string[] = [];
    const nameLower = fileName.toLowerCase();

    // Semantic category detection
    if (nameLower.includes('interview') || nameLower.includes('talk') || nameLower.includes('podcast') || nameLower.includes('dialogue') || nameLower.includes('mic')) {
      tags.push('Interview');
    } else if (nameLower.includes('action') || nameLower.includes('sport') || nameLower.includes('fast') || nameLower.includes('run') || nameLower.includes('drive')) {
      tags.push('Action');
    } else if (nameLower.includes('out') || nameLower.includes('nature') || nameLower.includes('drone') || nameLower.includes('sky') || nameLower.includes('city') || nameLower.includes('park')) {
      tags.push('Outdoor');
    } else {
      tags.push('Indoor');
    }

    if (duration > 30) {
      tags.push('Cinematic');
    } else {
      tags.push('B-Roll');
    }

    if (width >= 3840 || height >= 2160) {
      tags.push('4K UHD');
    } else if (width >= 1920) {
      tags.push('1080p HD');
    }

    return tags;
  }
}

export const aiTaggingService = new AiTaggingService();
