"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VoiceSelector from './components/VoiceSelector';
import VideoHistoryModal from './components/VideoHistoryModal';
import { RemotionVideo } from '@/app/remotion/RemotionVideo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// Video Modal Component
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string | null;
  segments: ScriptSegment[];
  captions: Array<{text: string, start: number, end: number}>;
  captionPreset: 'BASIC' | 'REVID' | 'HORMOZI' | 'WRAP 1' | 'WRAP 2' | 'FACELESS' | 'ALL';
  captionAlignment: 'top' | 'middle' | 'bottom';
  screenRatio: '1/1' | '16/9' | '9/16' | 'auto';
  audioDuration?: number;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  audioUrl, 
  segments, 
  captions, 
  captionPreset, 
  captionAlignment,
  screenRatio,
  audioDuration
}) => {
  // Determine aspect ratio class based on screenRatio
  let aspectRatioClass = "aspect-square"; // Default for 1/1
  if (screenRatio === '16/9') {
    aspectRatioClass = "aspect-video";
  } else if (screenRatio === '9/16') {
    aspectRatioClass = "aspect-[9/16]";
  }
  
  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    // Lock scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Focus trap - focus the modal content
    const modalElement = document.getElementById('video-modal-content');
    if (modalElement) {
      modalElement.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore scroll when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Convert segments to the format expected by RemotionVideo
  const images = segments.map(segment => ({
    imageUrl: segment.imageUrl || '',
    contextText: segment.ContextText
  }));
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md bg-black/30 overflow-y-auto"
      onClick={(e) => {
        // Close modal when clicking on backdrop (outside content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        id="video-modal-content"
        className="relative bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-[375px] focus:outline-none"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-opacity-100 transition-all shadow-md"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Title */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">Your video is ready</h2>
        </div>
        
        {/* Video container with responsive aspect ratio */}
        <div className={`w-full ${aspectRatioClass} bg-gray-100`}>
          <RemotionVideo
            audioUrl={audioUrl || ''}
            images={images}
            captions={captions}
            captionPreset={captionPreset}
            captionAlignment={captionAlignment}
            screenRatio={screenRatio}
            duration={audioDuration || 0}
          />
        </div>
      </div>
    </div>
  );
};

interface ScriptSegment {
  ContextText: string;
  ImagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

// Image presets for DALL-E
type ImagePreset = 'realistic' | 'sketch-color' | 'sketch-bw' | 'pixar' | 'flat-animation' | 'lego' | 'sci-fi' | 'ghibli';

const IMAGE_PRESETS = [
  { id: 'realistic', label: 'Realistic Photo' },
  { id: 'sketch-color', label: 'Color Sketch' },
  { id: 'sketch-bw', label: 'Black & White Sketch' },
  { id: 'pixar', label: 'Pixar Style' },
  { id: 'flat-animation', label: 'Flat Animation' },
  { id: 'lego', label: 'Lego Style' },
  { id: 'sci-fi', label: 'Sci-Fi Art' },
  { id: 'ghibli', label: 'Studio Ghibli' },
] as const;


function extractTweetId(input: string): string {
  // Step 1: Check if the input is a valid URL
  let url: URL;
  try {
    url = new URL(input);
  } catch (error) {
    throw new Error("Invalid URL provided");
  }

  // Step 2: Check if the URL is from x.com or twitter.com
  if (!(url.hostname === 'x.com' || url.hostname === 'twitter.com')) {
    throw new Error("URL is not from x.com or twitter.com");
  }

  // Step 3: Extract the tweet ID from the URL path
  const pathParts = url.pathname.split('/');
  const statusIndex = pathParts.indexOf('status');

  if (statusIndex === -1 || statusIndex === pathParts.length - 1) {
    throw new Error("Unable to find tweet ID in the URL");
  }

  const tweetId = pathParts[statusIndex + 1];

  // Step 4: Validate the tweet ID
  if (!/^\d+$/.test(tweetId)) {
    throw new Error("Invalid tweet ID format");
  }

  return tweetId;
}
// Main component
export default function TweetToVideoPage() {
  const router = useRouter();
  const [tweetUrl, setTweetUrl] = useState('');
  const [tweetContent, setTweetContent] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('BFqnCBsd6RMkjVDRZzb'); // Default voice
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Array<{text: string, start: number, end: number}>>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [imagePreset, setImagePreset] = useState<ImagePreset>('realistic');
  const [captionPreset, setCaptionPreset] = useState<'BASIC' | 'REVID' | 'HORMOZI' | 'WRAP 1' | 'WRAP 2' | 'FACELESS' | 'ALL'>('BASIC');
  const [captionAlignment, setCaptionAlignment] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [screenRatio, setScreenRatio] = useState<'1/1' | '16/9' | '9/16' | 'auto'>('9/16');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const [disableCaptions, setDisableCaptions] = useState(false);

  // Handle tweet URL input change
  const handleTweetUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTweetUrl(e.target.value);
  };

  // Handle voice selection
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  // Fetch tweet content
  const fetchTweetContent = async () => {
    setIsProcessing(true);
    setCurrentStep('Fetching tweet content...');
    setProgress(10);
    setError(null);
    const tweetId = extractTweetId(tweetUrl);
    
    // Mock data for development
    const mockTweetContent = `This is a sample tweet content that demonstrates how the video generation would work. 
    It includes multiple sentences that can be converted into video segments.
    
    Each paragraph will become a separate segment in the final video.
    
    The system will automatically generate appropriate images for each segment.
    
    This is just for testing purposes while we fix the Twitter API integration.`;
    
    // Comment out the actual API call
    /*
    try {
      const response = await fetch('/api/tweettovideo/tweetcontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error('Tweet not found. Please check if the tweet URL is correct and the tweet is still available.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please make sure you are logged in.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else {
          throw new Error(errorData.error || 'Failed to fetch tweet content');
        }
      }

      const data = await response.json();
      setTweetContent(data.tweetContent);
      return data.tweetContent;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tweet content');
      setIsProcessing(false);
      throw err;
    }
    */

    // Use mock data instead
    setTweetContent(mockTweetContent);
    setIsProcessing(false);
    return mockTweetContent;
  };

  // Process script to get segments and image prompts
  const processScript = async (script: string) => {
    setCurrentStep('Processing script...');
    setProgress(20);

    try {
      const response = await fetch('/api/tweettovideo/getScriptAndImagePrompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process script');
      }

      const data = await response.json();
      setSegments(data.result);
      return data.result;
    } catch (err: any) {
      setError(err.message || 'Failed to process script');
      setIsProcessing(false);
      throw err;
    }
  };

  // Generate audio for each segment
  const generateAudio = async (segments: ScriptSegment[]) => {
    setCurrentStep('Generating audio...');
    setProgress(40);

    try {
      // Combine all segments into one text for audio generation
      const fullText = segments.map(segment => segment.ContextText).join(' ');
      
      const response = await fetch('/api/tweettovideo/getaudio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: fullText,
          voiceId: selectedVoice
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      console.log("Audio generation response:", data);
      console.log("Audio duration received:", data.duration);
      
      // Set both state values and return them for immediate use
      setAudioUrl(data.audioUrl);
      setAudioDuration(data.duration);
      
      // Return both the audio URL and duration for immediate use
      return {
        audioUrl: data.audioUrl,
        duration: data.duration
      };
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
      setIsProcessing(false);
      throw err;
    }
  };

  // Generate captions
  const generateCaptions = async (audioUrl: string) => {
    setCurrentStep('Generating captions...');
    setProgress(60);

    try {
      const response = await fetch('/api/tweettovideo/getcaptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate captions');
      }

      const data = await response.json();
      setCaptions(data.words);
      return data.words;
    } catch (err: any) {
      setError(err.message || 'Failed to generate captions');
      setIsProcessing(false);
      throw err;
    }
  };

  // Generate black screen
  const generateBlackScreen = async (segments: ScriptSegment[]) => {
    setCurrentStep('Preparing video segments...');
    setProgress(80);

    try {
      const updatedSegments = [...segments];
      
      // Create a black screen image data URL
      const blackScreenUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      
      // Update all segments with the black screen
      for (let i = 0; i < segments.length; i++) {
        updatedSegments[i] = {
          ...segments[i],
          imageUrl: blackScreenUrl
        };
        
        // Update progress incrementally for each segment
        setProgress(80 + (i / segments.length) * 20);
      }
      
      setSegments(updatedSegments);
      return updatedSegments;
    } catch (err: any) {
      setError(err.message || 'Failed to prepare video segments');
      setIsProcessing(false);
      throw err;
    }
  };

  // Generate images for each segment
  const generateImages = async (segments: ScriptSegment[]) => {
    setCurrentStep('Generating images...');
    setProgress(80);

    try {
      const updatedSegments = [...segments];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        const response = await fetch('/api/tweettovideo/getImages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imagePrompt: segment.ImagePrompt,
            preset: imagePreset,
            screenRatio
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        updatedSegments[i] = {
          ...segment,
          imageUrl: data.imageUrl
        };
        
        // Update progress incrementally for each image
        setProgress(80 + (i / segments.length) * 20);
      }
      
      setSegments(updatedSegments);
      return updatedSegments;
    } catch (err: any) {
      setError(err.message || 'Failed to generate images');
      setIsProcessing(false);
      throw err;
    }
  };

  // Save video to history
  const saveVideoToHistory = async (
    script: string,
    audioUrl: string,
    segments: ScriptSegment[],
    captions: Array<{text: string, start: number, end: number}>,
    audioDuration: number
  ) => {
    try {
      console.log("Starting to save video with duration:", audioDuration);
      
      const payload = {
        title: `Tweet Video - ${new Date().toLocaleString()}`,
        script,
        audioUrl,
        duration: audioDuration,
        images: segments.map(segment => ({
          contextText: segment.ContextText,
          imageUrl: segment.imageUrl
        })),
        captions,
        captionPreset,
        captionAlignment,
        screenRatio,
      };
      
      console.log("Save video payload prepared:", JSON.stringify(payload).substring(0, 200) + "...");
      
      const response = await fetch('/api/tweettovideo/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log("Save video response status:", response.status);
      const data = await response.json();
      console.log("Save video response data:", data);
      
      if (!response.ok) {
        console.error('Failed to save video:', data.error);
        setError(data.error || 'Failed to save video to history');
        throw new Error(data.error || 'Failed to save video to history');
      }

      console.log('Video saved successfully:', data);
      return data;
    } catch (err: any) {
      console.error('Error saving video to history:', err);
      setError(err.message || 'Failed to save video to history. Please try again.');
      throw err;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tweetUrl) {
      setError('Please enter a tweet URL');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Step 1: Fetch tweet content
      const content = await fetchTweetContent();
      
      // Step 2: Process script to get segments and image prompts
      const scriptSegments = await processScript(content);
      
      // Step 3: Generate audio
      const audioResult = await generateAudio(scriptSegments);
      if(!audioResult.audioUrl) {
        setError("Failed to generate audio");
        setIsProcessing(false);
        return;
      }
      
      // Keep local reference to audio URL for immediate use
      const audioUrlValue = audioResult.audioUrl;
      const audioDurationValue = audioResult.duration;
      
      // Update state for later use
      setAudioUrl(audioUrlValue);
      setAudioDuration(audioDurationValue);
      
      // Step 4: Generate captions - use the local value instead of the state value
      const captionsData = await generateCaptions(audioUrlValue);
      
      // Step 5: Generate black screen for segments
      const segmentsWithBlackScreen = await generateBlackScreen(scriptSegments);
      
      // Step 6: Save to history
      if (audioDurationValue) {
        console.log("Saving video to history: ", content, audioUrlValue, segmentsWithBlackScreen, captionsData, audioDurationValue);
        await saveVideoToHistory(content, audioUrlValue, segmentsWithBlackScreen, captionsData, audioDurationValue);
      } else {
        console.log("Cannot save video - audioDuration is missing. Tried all sources but none had a value.");
      }
      
      setProgress(100);
      setCurrentStep('Complete!');
      setIsProcessing(false);
      
      // Open video modal to show the result
      setIsVideoModalOpen(true);
    } catch (err) {
      // Error handling is done in each function
      console.error('Error in video generation process:', err);
    }
  };

  // Play current segment audio
  const playCurrentSegment = () => {
    if (audioRef.current && segments[currentSegmentIndex]) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing audio:', err);
        });
    }
  };

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current && captions.length > 0) {
      const currentTime = audioRef.current.currentTime;
      
      // Find the current segment based on captions timing
      const segmentIndex = segments.findIndex((segment, index) => {
        const nextSegment = segments[index + 1];
        if (!nextSegment) return true; // Last segment
        
        const segmentWords = captions.filter(word => {
          const wordText = word.text.toLowerCase();
          return segment.ContextText.toLowerCase().includes(wordText);
        });
        
        const nextSegmentWords = captions.filter(word => {
          const wordText = word.text.toLowerCase();
          return nextSegment.ContextText.toLowerCase().includes(wordText);
        });
        
        if (segmentWords.length === 0 || nextSegmentWords.length === 0) return false;
        
        const segmentStartTime = segmentWords[0].start;
        const nextSegmentStartTime = nextSegmentWords[0].start;
        
        return currentTime >= segmentStartTime && currentTime < nextSegmentStartTime;
      });
      
      if (segmentIndex !== -1 && segmentIndex !== currentSegmentIndex) {
        setCurrentSegmentIndex(segmentIndex);
      }
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
    
    // Move to next segment if available
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(prevIndex => prevIndex + 1);
      setTimeout(playCurrentSegment, 500); // Small delay before playing next segment
    }
  };

  // Render current step UI
  const renderCurrentStep = () => {
    if (!isProcessing) return null;
    
    return (
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">{currentStep}</h3>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-gray-600">{Math.round(progress)}% complete</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tweet to Video Generator</h1>
          <Button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="mt-2 sm:mt-0 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Videos History
          </Button>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tweetUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Tweet URL
            </label>
            <input
              id="tweetUrl"
              type="url"
              value={tweetUrl}
              onChange={handleTweetUrlChange}
              placeholder="https://twitter.com/username/status/123456789"
              className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter a Twitter/X URL to convert into a video
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <VoiceSelector onVoiceSelect={handleVoiceSelect} selectedVoice={selectedVoice} />
          </div>
          
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <h3 className="text-lg font-medium text-gray-800">Advanced options</h3>
              <svg 
                className={`w-5 h-5 transition-transform ${advancedOptionsOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {advancedOptionsOpen && (
              <div className="p-4 space-y-6 border-t border-gray-200">
                {/* Screen Ratio Selection */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose your screen ratio
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Our AI will adapt the footage to your desired screen ratio
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
                      className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span>{screenRatio}</span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${isRatioDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isRatioDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setScreenRatio('auto');
                            setIsRatioDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${screenRatio === 'auto' ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                          Auto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenRatio('16/9');
                            setIsRatioDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${screenRatio === '16/9' ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                          16 / 9
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenRatio('9/16');
                            setIsRatioDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${screenRatio === '9/16' ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                          9 / 16
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenRatio('1/1');
                            setIsRatioDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${screenRatio === '1/1' ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                          1 / 1
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Style Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Image Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setImagePreset(preset.id as ImagePreset)}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          imagePreset === preset.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disable Captions Toggle */}
                <div className="py-2 border-t border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-700">Disable Captions</h3>
                      <p className="text-sm text-gray-500">Do not show captions in your video</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disableCaptions}
                        onChange={(e) => setDisableCaptions(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Caption Presets Selection */}
                <div className={`space-y-2 ${disableCaptions ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700">
                    Select a preset to add to your captions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('BASIC')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'BASIC'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">BASIC</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('REVID')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'REVID'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Galaxy</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('HORMOZI')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'HORMOZI'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">HORMOZI</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('ALL')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'ALL'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg">All</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('WRAP 1')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'WRAP 1'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg text-white bg-red-500 px-2 py-1 rounded">Wrap 1</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('WRAP 2')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'WRAP 2'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg text-white bg-blue-500 px-2 py-1 rounded">WRAP 2</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionPreset('FACELESS')}
                      disabled={disableCaptions}
                      className={`relative p-3 text-sm rounded-lg border transition-all ${
                        captionPreset === 'FACELESS'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-lg text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">FACELESS</span>
                    </button>
                  </div>
                </div>

                {/* Caption Alignment Selection */}
                <div className={`space-y-2 ${disableCaptions ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700">
                    Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCaptionAlignment('top')}
                      disabled={disableCaptions}
                      className={`flex items-center justify-center p-3 text-sm rounded-lg border transition-all ${
                        captionAlignment === 'top'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9h14M5 4h14" />
                      </svg>
                      Top
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionAlignment('middle')}
                      disabled={disableCaptions}
                      className={`flex items-center justify-center p-3 text-sm rounded-lg border transition-all ${
                        captionAlignment === 'middle'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                      Middle
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCaptionAlignment('bottom')}
                      disabled={disableCaptions}
                      className={`flex items-center justify-center p-3 text-sm rounded-lg border transition-all ${
                        captionAlignment === 'bottom'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15h14M5 20h14" />
                      </svg>
                      Bottom
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {renderCurrentStep()}
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isProcessing}
              onClick={handleSubmit}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isProcessing 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Generate Video'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Audio element for playback (hidden) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}
      
      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        audioUrl={audioUrl}
        segments={segments}
        captions={captions}
        captionPreset={captionPreset}
        captionAlignment={captionAlignment}
        screenRatio={screenRatio}
        audioDuration={audioDuration || undefined}
      />
      
      {/* History Modal */}
      <VideoHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
