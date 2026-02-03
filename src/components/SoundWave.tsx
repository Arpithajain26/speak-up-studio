import { cn } from '@/lib/utils';

interface SoundWaveProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export const SoundWave = ({ isActive, barCount = 5, className }: SoundWaveProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-1 h-8', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full bg-primary transition-all duration-200',
            isActive ? 'animate-sound-wave' : 'h-2'
          )}
          style={{
            animationDelay: isActive ? `${i * 0.1}s` : undefined,
            height: isActive ? undefined : '8px',
          }}
        />
      ))}
    </div>
  );
};
