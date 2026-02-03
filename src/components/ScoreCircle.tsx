import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ScoreCircle = ({
  score,
  label,
  size = 'md',
  animated = false,
  className,
}: ScoreCircleProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-warning';
    return 'stroke-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-lg', label: 'text-[10px]', stroke: 4 },
    md: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs', stroke: 6 },
    lg: { container: 'w-32 h-32', text: 'text-4xl', label: 'text-sm', stroke: 8 },
  };

  const { container, text, label: labelSize, stroke } = sizeClasses[size];
  const radius = size === 'lg' ? 56 : size === 'md' ? 40 : 28;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('relative', container, animated && 'animate-score-reveal')}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${radius * 2 + stroke} ${radius * 2 + stroke}`}>
          {/* Background circle */}
          <circle
            cx={radius + stroke / 2}
            cy={radius + stroke / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx={radius + stroke / 2}
            cy={radius + stroke / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className={cn(getScoreColor(score), 'transition-all duration-1000 ease-out')}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-display font-bold', text, getScoreBgColor(score))}>
            {score}
          </span>
        </div>
      </div>
      <span className={cn('text-muted-foreground font-medium uppercase tracking-wide', labelSize)}>
        {label}
      </span>
    </div>
  );
};
