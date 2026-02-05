import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIWordAnalysis } from '@/types/speechAnalysis';
import { AlertTriangle, Lightbulb, Star, TrendingUp, Loader2 } from 'lucide-react';

interface WordAnalysisCardProps {
  analysis: AIWordAnalysis | null;
  isAnalyzing: boolean;
}

const categoryColors: Record<string, string> = {
  filler: 'bg-warning/20 text-warning border-warning/30',
  connector: 'bg-primary/20 text-primary border-primary/30',
  habit: 'bg-accent/20 text-accent border-accent/30',
  other: 'bg-muted text-muted-foreground border-border',
};

const categoryLabels: Record<string, string> = {
  filler: 'Filler Word',
  connector: 'Connector',
  habit: 'Speech Habit',
  other: 'Repeated',
};

export const WordAnalysisCard = ({ analysis, isAnalyzing }: WordAnalysisCardProps) => {
  if (isAnalyzing) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Analyzing your speech patterns...</span>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 shadow-card space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">AI Speech Analysis</h3>
        <Badge variant="secondary" className="ml-auto">
          Vocabulary: {analysis.vocabularyScore}%
        </Badge>
      </div>

      {/* Repeated Words */}
      {analysis.repeatedWords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h4 className="font-medium">Frequently Repeated Words</h4>
          </div>
          <div className="grid gap-3">
            {analysis.repeatedWords.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <Badge className={`${categoryColors[item.category]} border`}>
                  "{item.word}" × {item.count}
                </Badge>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {categoryLabels[item.category]}
                  </p>
                  <p className="text-sm">{item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Feedback */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm leading-relaxed">{analysis.overallFeedback}</p>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-success" />
            <h4 className="font-medium text-success">Your Strengths</h4>
          </div>
          <ul className="space-y-1">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-success">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fluency Tips */}
      {analysis.fluencyTips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <h4 className="font-medium">Tips to Improve</h4>
          </div>
          <ul className="space-y-1">
            {analysis.fluencyTips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
