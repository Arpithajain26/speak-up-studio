import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw, Trophy, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InterviewVerdictProps {
  verdict: string;
  onNewInterview: () => void;
}

export const InterviewVerdict = ({ verdict, onNewInterview }: InterviewVerdictProps) => {
  const isSelected = verdict.toLowerCase().includes('selected') && !verdict.toLowerCase().includes('not selected');
  const hasNotSelected = verdict.toLowerCase().includes('not selected') || verdict.toLowerCase().includes('rejected');

  const resultStatus = hasNotSelected ? 'not-selected' : isSelected ? 'selected' : 'pending';

  return (
    <Card className="mx-4 my-4 md:mx-auto md:max-w-3xl md:w-full overflow-hidden border-2 shadow-card">
      {/* Header Banner */}
      <div
        className={`p-6 text-center ${
          resultStatus === 'selected'
            ? 'bg-green-500/10 border-b border-green-500/20'
            : resultStatus === 'not-selected'
            ? 'bg-destructive/10 border-b border-destructive/20'
            : 'bg-primary/10 border-b border-primary/20'
        }`}
      >
        <div className="flex justify-center mb-3">
          {resultStatus === 'selected' ? (
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          ) : resultStatus === 'not-selected' ? (
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-display font-bold">
          {resultStatus === 'selected'
            ? '🎉 Congratulations! You are Selected!'
            : resultStatus === 'not-selected'
            ? 'Interview Result: Not Selected'
            : 'Interview Evaluation Complete'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {resultStatus === 'selected'
            ? 'Great performance! You demonstrated strong skills.'
            : resultStatus === 'not-selected'
            ? "Don't give up! Review the feedback and try again."
            : 'Here is your detailed evaluation.'}
        </p>
      </div>

      {/* Verdict Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:text-xs [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm">
          <ReactMarkdown>{verdict}</ReactMarkdown>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t bg-muted/30 flex items-center justify-center gap-3">
        <Button onClick={onNewInterview} className="gradient-hero text-primary-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Interview
        </Button>
      </div>
    </Card>
  );
};
