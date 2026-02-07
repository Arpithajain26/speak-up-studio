import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, Square, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewVideoRecorderProps {
  isRecording: boolean;
  videoStream: MediaStream | null;
  transcript: string;
  interimTranscript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendTranscript: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export const InterviewVideoRecorder = ({
  isRecording,
  videoStream,
  transcript,
  interimTranscript,
  onStartRecording,
  onStopRecording,
  onSendTranscript,
  onCancel,
  isLoading,
  error,
}: InterviewVideoRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const hasTranscript = transcript.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Video Preview */}
      {(isRecording || videoStream) && (
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden max-h-[200px]">
          {videoStream ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-destructive/90 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-white">REC</span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Live Transcript */}
      {(isRecording || hasTranscript) && (
        <div className="bg-secondary/50 rounded-lg p-3 max-h-[100px] overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            {isRecording ? 'Listening...' : 'Your answer:'}
          </p>
          <p className="text-sm">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground italic">{interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && isRecording && (
              <span className="text-muted-foreground italic">Start speaking...</span>
            )}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive px-1">{error}</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isRecording && !hasTranscript && (
          <Button
            onClick={onStartRecording}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            Record Answer
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={onStopRecording}
            variant="destructive"
            size="sm"
            className="gap-1.5"
          >
            <Square className="w-3 h-3" />
            Stop Recording
          </Button>
        )}

        {!isRecording && hasTranscript && (
          <>
            <Button
              onClick={onSendTranscript}
              disabled={isLoading}
              size="sm"
              className="gap-1.5 gradient-hero text-primary-foreground"
            >
              <Send className="w-3.5 h-3.5" />
              Send Answer
            </Button>
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
