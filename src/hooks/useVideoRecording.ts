import { useState, useRef, useCallback } from 'react';

interface UseVideoRecordingReturn {
  isRecording: boolean;
  videoStream: MediaStream | null;
  recordedVideoUrl: string | null;
  recordedBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  isSupported: boolean;
}

export const useVideoRecording = (): UseVideoRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const isSupported = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Video recording is not supported in this browser');
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      
      // Request both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setVideoStream(stream);
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedBlob(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
    } catch (err) {
      console.error('Failed to start video recording:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera/microphone access denied. Please allow access to continue.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found on this device.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to start recording');
      }
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    
    setIsRecording(false);
  }, [videoStream]);

  const resetRecording = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setError(null);
  }, [recordedVideoUrl]);

  return {
    isRecording,
    videoStream,
    recordedVideoUrl,
    recordedBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    isSupported,
  };
};
