export interface RepeatedWord {
  word: string;
  count: number;
  category: 'filler' | 'connector' | 'habit' | 'other';
  suggestion: string;
}

export interface AIWordAnalysis {
  repeatedWords: RepeatedWord[];
  overallFeedback: string;
  fluencyTips: string[];
  strengths: string[];
  vocabularyScore: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
