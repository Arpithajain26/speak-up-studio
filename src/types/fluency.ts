// Types for the Fluency Practice App

export interface SpeechAnalysis {
  transcript: string;
  fluencyScore: number;
  grammarScore: number;
  overallScore: number;
  speakingDuration: number; // in seconds
  wordsPerMinute: number;
  fillerWords: FillerWordInstance[];
  grammarIssues: GrammarIssue[];
  pauseCount: number;
  suggestions: string[];
}

export interface FillerWordInstance {
  word: string;
  count: number;
}

export interface GrammarIssue {
  original: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation';
}

export interface PracticeSession {
  id: string;
  date: Date;
  duration: number;
  transcript: string;
  fluencyScore: number;
  grammarScore: number;
  overallScore: number;
  wordsPerMinute: number;
}

export interface DailyProgress {
  date: string;
  sessionsCount: number;
  averageFluency: number;
  averageGrammar: number;
  totalSpeakingTime: number; // minutes
  averageWPM: number;
}

export interface UserStats {
  totalSessions: number;
  totalSpeakingTime: number; // minutes
  averageFluency: number;
  averageGrammar: number;
  currentStreak: number;
  longestStreak: number;
  bestScore: number;
}
