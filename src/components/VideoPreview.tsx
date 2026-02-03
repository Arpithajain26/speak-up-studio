import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video, VideoOff } from 'lucide-react';

interface VideoPreviewProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

export const VideoPreview = ({ stream, isActive, className }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn(
      'relative aspect-video bg-muted rounded-2xl overflow-hidden shadow-card',
      className
    )}>
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          {isActive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-destructive/90 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">REC</span>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-full bg-secondary">
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
        </div>
      )}
    </div>
  );
};
