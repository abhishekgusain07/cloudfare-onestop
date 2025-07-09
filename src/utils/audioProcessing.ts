// Audio processing utilities for the music system

export interface AudioInfo {
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
}

/**
 * Get audio file duration and metadata
 */
export const getAudioInfo = (audioUrl: string): Promise<AudioInfo> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.onloadedmetadata = () => {
      resolve({
        duration: audio.duration,
        // Note: Web Audio API doesn't expose bitrate/sampleRate directly
        // These would need to be calculated or provided from the file
      });
    };
    
    audio.onerror = (error) => {
      reject(new Error(`Failed to load audio: ${error}`));
    };
    
    audio.src = audioUrl;
    audio.load();
  });
};

/**
 * Generate audio peaks for waveform visualization
 */
export const generateAudioPeaks = async (
  audioUrl: string, 
  samples: number = 800
): Promise<number[]> => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Fetch and decode audio
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get audio data from first channel
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / samples);
    const peaks: number[] = [];
    
    // Calculate peaks
    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      
      peaks.push(sum / blockSize);
    }
    
    // Normalize peaks
    const maxPeak = Math.max(...peaks);
    const normalizedPeaks = peaks.map(peak => peak / maxPeak);
    
    // Clean up
    audioContext.close();
    
    return normalizedPeaks;
  } catch (error) {
    console.error('Error generating audio peaks:', error);
    throw error;
  }
};

/**
 * Validate audio file format and size
 */
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('audio/')) {
    return {
      valid: false,
      error: 'Please select a valid audio file (MP3, WAV, M4A, OGG)'
    };
  }
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB'
    };
  }
  
  // Check supported formats
  const supportedFormats = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'];
  if (!supportedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported audio format. Please use MP3, WAV, M4A, or OGG'
    };
  }
  
  return { valid: true };
};

/**
 * Format time in seconds to MM:SS.MS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

/**
 * Parse time from MM:SS.MS format to seconds
 */
export const parseTime = (timeString: string): number | null => {
  const regex = /^(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?$/;
  const match = timeString.match(regex);
  
  if (!match) return null;
  
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const milliseconds = match[3] ? parseInt(match[3].padEnd(2, '0'), 10) : 0;
  
  if (minutes > 59 || seconds > 59 || milliseconds > 99) return null;
  
  return minutes * 60 + seconds + milliseconds / 100;
};

/**
 * Create a trimmed audio segment (conceptual - actual trimming happens in backend)
 */
export interface AudioSegment {
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export const createAudioSegment = (
  audioUrl: string,
  startTime: number,
  endTime: number
): AudioSegment => {
  return {
    url: audioUrl,
    startTime,
    endTime,
    duration: endTime - startTime
  };
};

/**
 * Detect if Web Audio API is supported
 */
export const isWebAudioSupported = (): boolean => {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};

/**
 * Get audio file format from URL or file
 */
export const getAudioFormat = (urlOrFile: string | File): string => {
  if (typeof urlOrFile === 'string') {
    // Extract format from URL
    const url = urlOrFile.toLowerCase();
    if (url.includes('.mp3')) return 'MP3';
    if (url.includes('.wav')) return 'WAV';
    if (url.includes('.m4a')) return 'M4A';
    if (url.includes('.ogg')) return 'OGG';
    return 'Unknown';
  } else {
    // Extract format from file type
    const type = urlOrFile.type.toLowerCase();
    if (type.includes('mpeg')) return 'MP3';
    if (type.includes('wav')) return 'WAV';
    if (type.includes('mp4')) return 'M4A';
    if (type.includes('ogg')) return 'OGG';
    return 'Unknown';
  }
};

/**
 * Calculate audio file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Estimate audio bitrate from file size and duration
 */
export const estimateBitrate = (fileSizeBytes: number, durationSeconds: number): number => {
  // Convert bytes to bits, then divide by duration to get bits per second
  const bitsPerSecond = (fileSizeBytes * 8) / durationSeconds;
  // Convert to kbps
  return Math.round(bitsPerSecond / 1000);
};

/**
 * Audio trimming parameters for backend processing
 */
export interface AudioTrimParams {
  startTime: number;
  endTime: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}

/**
 * Create audio trim parameters for backend rendering
 */
export const createAudioTrimParams = (
  startTime: number,
  endTime: number,
  options: { fadeIn?: number; fadeOut?: number } = {}
): AudioTrimParams => {
  return {
    startTime,
    endTime,
    duration: endTime - startTime,
    fadeIn: options.fadeIn || 0,
    fadeOut: options.fadeOut || 0
  };
};