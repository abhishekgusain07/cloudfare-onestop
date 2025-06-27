// utils/videoRenderingClient.ts
// This file goes in your Next.js app to communicate with the Express server

interface VideoParams {
    selectedTemplate: string;
    text: string;
    textPosition: 'top' | 'center' | 'bottom';
    textAlign: 'left' | 'center' | 'right';
    fontSize: number;
    textColor: string;
    musicUrl?: string;
    musicVolume: number;
  }
  
  interface Template {
    id: string;
    name: string;
    url: string;
    duration: number;
  }
  
  interface RenderResponse {
    success: boolean;
    renderId?: string;
    downloadUrl?: string;
    error?: string;
  }
  
  interface RenderStatus {
    success: boolean;
    status?: 'rendering' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    error?: string;
    createdAt?: string;
    completedAt?: string;
  }
  
  class VideoRenderingClient {
    private baseUrl: string;
  
      constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }
  
    // Start a new video render
    async startRender(videoParams: VideoParams, template: Template): Promise<RenderResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/render`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoParams,
            template,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error starting render:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  
    // Check render status
    async getRenderStatus(renderId: string): Promise<RenderStatus> {
      try {
        const response = await fetch(`${this.baseUrl}/render/${renderId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error getting render status:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  
    // Poll render status until completion
    async waitForRender(
      renderId: string, 
      onProgress?: (progress: number) => void,
      pollInterval: number = 2000
    ): Promise<RenderStatus> {
      return new Promise((resolve) => {
        const poll = async () => {
          const status = await this.getRenderStatus(renderId);
          
          if (!status.success) {
            resolve(status);
            return;
          }
  
          // Call progress callback if provided
          if (onProgress && typeof status.progress === 'number') {
            onProgress(status.progress);
          }
  
          // Check if render is complete
          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }
  
          // Continue polling
          setTimeout(poll, pollInterval);
        };
  
        poll();
      });
    }
  
    // Get all renders
    async getAllRenders(): Promise<{ success: boolean; renders?: any[]; error?: string }> {
      try {
        const response = await fetch(`${this.baseUrl}/renders`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error getting all renders:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  
    // Delete a render
    async deleteRender(renderId: string): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await fetch(`${this.baseUrl}/render/${renderId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error deleting render:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  
    // Get full download URL
    getDownloadUrl(downloadPath: string): string {
      return `${this.baseUrl}${downloadPath}`;
    }
  
    // Check server health
    async checkHealth(): Promise<{ status: string; message?: string }> {
      try {
        const response = await fetch(`${this.baseUrl}/health`);
        return await response.json();
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Server unreachable',
        };
      }
    }
  }
  
  // Export a default instance
  export const videoRenderingClient = new VideoRenderingClient();
  
  // Export the class for custom instances
  export default VideoRenderingClient;
  
  // Example usage:
  /*
  import { videoRenderingClient } from '@/utils/videoRenderingClient';
  
  // Start a render
  const result = await videoRenderingClient.startRender(videoParams, template);
  if (result.success && result.renderId) {
    // Wait for completion with progress updates
    const finalStatus = await videoRenderingClient.waitForRender(
      result.renderId,
      (progress) => {
        console.log(`Render progress: ${progress}%`);
        // Update your UI progress bar here
      }
    );
    
    if (finalStatus.success && finalStatus.status === 'completed') {
      console.log('Video ready!', finalStatus.downloadUrl);
      // Use videoRenderingClient.getDownloadUrl(finalStatus.downloadUrl) for full URL
    }
  }
  */