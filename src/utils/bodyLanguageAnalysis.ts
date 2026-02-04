import { supabase } from '@/integrations/supabase/client';
import { BodyLanguageFeedback } from '@/types/bodyLanguage';

/**
 * Extract a frame from a video blob as a base64 JPEG image
 */
export const extractVideoFrame = async (videoBlob: Blob, timeInSeconds: number = 2): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const url = URL.createObjectURL(videoBlob);
    video.src = url;

    video.onloadedmetadata = () => {
      // Seek to the specified time or middle of video
      const seekTime = Math.min(timeInSeconds, video.duration / 2);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      
      // Clean up
      URL.revokeObjectURL(url);
      
      resolve(base64);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    // Timeout fallback
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(null);
    }, 10000);
  });
};

/**
 * Analyze body language from a video using AI
 */
export const analyzeBodyLanguage = async (videoBlob: Blob): Promise<BodyLanguageFeedback | null> => {
  try {
    // Extract a frame from the video
    const imageBase64 = await extractVideoFrame(videoBlob);
    
    if (!imageBase64) {
      console.error('Failed to extract frame from video');
      return null;
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('analyze-body-language', {
      body: { imageBase64 }
    });

    if (error) {
      console.error('Error analyzing body language:', error);
      return null;
    }

    if (data.error) {
      console.error('AI analysis error:', data.error);
      return null;
    }

    return data as BodyLanguageFeedback;
  } catch (err) {
    console.error('Failed to analyze body language:', err);
    return null;
  }
};
