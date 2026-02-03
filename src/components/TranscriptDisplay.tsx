import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript?: string;
  isListening: boolean;
  className?: string;
}

export const TranscriptDisplay = ({
  transcript,
  interimTranscript = '',
  isListening,
  className,
}: TranscriptDisplayProps) => {
  const hasContent = transcript || interimTranscript;

  return (
    <div
      className={cn(
        'min-h-[120px] p-4 rounded-xl bg-card border border-border shadow-card',
        'transition-all duration-300',
        isListening && 'ring-2 ring-primary/30',
        className
      )}
    >
      {hasContent ? (
        <p className="text-foreground leading-relaxed">
          {transcript}
          {interimTranscript && (
            <span className="text-muted-foreground italic">{interimTranscript}</span>
          )}
          {isListening && (
            <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
          )}
        </p>
      ) : (
        <p className="text-muted-foreground text-center">
          {isListening
            ? 'Listening... Start speaking!'
            : 'Click the microphone to start recording'}
        </p>
      )}
    </div>
  );
};
