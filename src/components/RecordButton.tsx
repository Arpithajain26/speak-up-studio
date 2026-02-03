import { cn } from '@/lib/utils';
import { Mic, Square, Loader2 } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const RecordButton = ({
  isRecording,
  isProcessing = false,
  onClick,
  disabled = false,
  className,
}: RecordButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        'relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300',
        'focus:outline-none focus:ring-4 focus:ring-primary/30',
        isRecording
          ? 'bg-destructive hover:bg-destructive/90'
          : 'gradient-hero hover:opacity-90 shadow-glow',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Pulsing ring when recording */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-destructive/40 animate-recording-pulse" />
          <span className="absolute inset-[-8px] rounded-full border-4 border-destructive/30 animate-recording-pulse" style={{ animationDelay: '0.2s' }} />
        </>
      )}
      
      {/* Icon */}
      <span className="relative z-10 text-primary-foreground">
        {isProcessing ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : isRecording ? (
          <Square className="w-8 h-8 fill-current" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </span>
    </button>
  );
};
