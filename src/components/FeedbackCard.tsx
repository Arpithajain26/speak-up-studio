import { SpeechAnalysis } from '@/types/fluency';
import { Card } from '@/components/ui/card';
import { ScoreCircle } from '@/components/ScoreCircle';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Zap, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  analysis: SpeechAnalysis;
  className?: string;
}

export const FeedbackCard = ({ analysis, className }: FeedbackCardProps) => {
  const {
    fluencyScore,
    grammarScore,
    overallScore,
    speakingDuration,
    wordsPerMinute,
    fillerWords,
    grammarIssues,
    suggestions,
  } = analysis;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn('space-y-6 animate-fade-in', className)}>
      {/* Score Overview */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-display font-semibold mb-6 text-center">Your Performance</h3>
        <div className="flex justify-center items-end gap-8">
          <ScoreCircle score={fluencyScore} label="Fluency" size="md" animated />
          <ScoreCircle score={overallScore} label="Overall" size="lg" animated />
          <ScoreCircle score={grammarScore} label="Grammar" size="md" animated />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Clock className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-display font-semibold">{formatDuration(speakingDuration)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Zap className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Speed</p>
              <p className="text-xl font-display font-semibold">{wordsPerMinute} WPM</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filler Words */}
      {fillerWords.length > 0 && (
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-warning" />
            <h4 className="font-semibold">Filler Words Detected</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {fillerWords.map((filler, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium"
              >
                "{filler.word}" × {filler.count}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Grammar Issues */}
      {grammarIssues.length > 0 && (
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold">Grammar Suggestions</h4>
          </div>
          <ul className="space-y-2">
            {grammarIssues.slice(0, 5).map((issue, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-destructive line-through">{issue.original}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-success font-medium">{issue.suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 shadow-card border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Tips for Improvement</h4>
        </div>
        <ul className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {suggestion}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
