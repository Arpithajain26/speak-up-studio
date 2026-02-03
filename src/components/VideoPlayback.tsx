import { cn } from '@/lib/utils';
import { Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlaybackProps {
  videoUrl: string;
  className?: string;
}

export const VideoPlayback = ({ videoUrl, className }: VideoPlaybackProps) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `practice-session-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden shadow-card">
        <video
          src={videoUrl}
          controls
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Video
        </Button>
      </div>
    </div>
  );
};
