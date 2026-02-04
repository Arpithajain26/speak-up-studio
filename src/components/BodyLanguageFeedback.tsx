import { BodyLanguageFeedback as BodyLanguageFeedbackType } from '@/types/bodyLanguage';
import { Card } from '@/components/ui/card';
import { ScoreCircle } from '@/components/ScoreCircle';
import { User, Eye, Hand, Smile, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BodyLanguageFeedbackProps {
  feedback: BodyLanguageFeedbackType | null;
  isAnalyzing: boolean;
  className?: string;
}

const FeedbackItem = ({
  icon: Icon,
  label,
  score,
  feedback,
  color,
}: {
  icon: React.ElementType;
  label: string;
  score: number;
  feedback: string;
  color: string;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
    <div className={cn('p-2 rounded-lg', color)}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{label}</span>
        <span className={cn(
          'text-sm font-semibold',
          score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive'
        )}>
          {score}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{feedback}</p>
    </div>
  </div>
);

export const BodyLanguageFeedbackCard = ({ feedback, isAnalyzing, className }: BodyLanguageFeedbackProps) => {
  if (isAnalyzing) {
    return (
      <Card className={cn('p-6 shadow-card', className)}>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold mb-1">Analyzing Body Language</h3>
            <p className="text-sm text-muted-foreground">
              AI is reviewing your posture, gestures, and eye contact...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <Card className={cn('p-6 shadow-card animate-fade-in', className)}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">Body Language Analysis</h3>
      </div>

      {/* Overall Score */}
      <div className="flex justify-center mb-6">
        <ScoreCircle score={feedback.overallScore} label="Body Language" size="lg" animated />
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-3 mb-6">
        <FeedbackItem
          icon={User}
          label="Posture"
          score={feedback.postureScore}
          feedback={feedback.postureFeedback}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <FeedbackItem
          icon={Eye}
          label="Eye Contact"
          score={feedback.eyeContactScore}
          feedback={feedback.eyeContactFeedback}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <FeedbackItem
          icon={Hand}
          label="Gestures"
          score={feedback.gesturesScore}
          feedback={feedback.gesturesFeedback}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <FeedbackItem
          icon={Smile}
          label="Expression"
          score={feedback.expressionScore}
          feedback={feedback.expressionFeedback}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Overall Feedback */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
        <p className="text-sm text-muted-foreground">{feedback.overallFeedback}</p>
      </div>

      {/* Top Tips */}
      {feedback.topTips.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">💡 Top Tips</h4>
          <ul className="space-y-2">
            {feedback.topTips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
