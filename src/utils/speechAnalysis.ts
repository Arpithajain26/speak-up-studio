import { SpeechAnalysis, FillerWordInstance, GrammarIssue } from '@/types/fluency';

const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 
  'actually', 'literally', 'so', 'well', 'right', 'okay'
];

const COMMON_GRAMMAR_PATTERNS: Array<{ pattern: RegExp; suggestion: string; type: 'grammar' | 'spelling' }> = [
  { pattern: /\bi\b(?!\s+am|\s+have|\s+will|\s+would|\s+could|\s+should|\s+was|\s+were|\s+do|\s+don't|\s+think|\s+know|\s+feel|\s+want|\s+need|\s+like|\s+love|\s+hate|\s+see|\s+hear)/gi, suggestion: 'I', type: 'grammar' },
  { pattern: /\bhe don't\b/gi, suggestion: "he doesn't", type: 'grammar' },
  { pattern: /\bshe don't\b/gi, suggestion: "she doesn't", type: 'grammar' },
  { pattern: /\bit don't\b/gi, suggestion: "it doesn't", type: 'grammar' },
  { pattern: /\bthey was\b/gi, suggestion: 'they were', type: 'grammar' },
  { pattern: /\bwe was\b/gi, suggestion: 'we were', type: 'grammar' },
  { pattern: /\byou was\b/gi, suggestion: 'you were', type: 'grammar' },
  { pattern: /\bi is\b/gi, suggestion: 'I am', type: 'grammar' },
  { pattern: /\bmore better\b/gi, suggestion: 'better', type: 'grammar' },
  { pattern: /\bmore worse\b/gi, suggestion: 'worse', type: 'grammar' },
  { pattern: /\bcould of\b/gi, suggestion: 'could have', type: 'grammar' },
  { pattern: /\bwould of\b/gi, suggestion: 'would have', type: 'grammar' },
  { pattern: /\bshould of\b/gi, suggestion: 'should have', type: 'grammar' },
  { pattern: /\bmust of\b/gi, suggestion: 'must have', type: 'grammar' },
  { pattern: /\baint\b/gi, suggestion: "isn't/aren't", type: 'grammar' },
  { pattern: /\bgonna\b/gi, suggestion: 'going to', type: 'grammar' },
  { pattern: /\bwanna\b/gi, suggestion: 'want to', type: 'grammar' },
];

export const analyzeFillerWords = (text: string): FillerWordInstance[] => {
  const words = text.toLowerCase();
  const fillerInstances: FillerWordInstance[] = [];

  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = words.match(regex);
    if (matches && matches.length > 0) {
      fillerInstances.push({ word: filler, count: matches.length });
    }
  });

  return fillerInstances.sort((a, b) => b.count - a.count);
};

export const analyzeGrammar = (text: string): GrammarIssue[] => {
  const issues: GrammarIssue[] = [];
  
  COMMON_GRAMMAR_PATTERNS.forEach(({ pattern, suggestion, type }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!issues.some(i => i.original.toLowerCase() === match.toLowerCase())) {
          issues.push({ original: match, suggestion, type });
        }
      });
    }
  });

  return issues;
};

export const countPauses = (transcript: string): number => {
  // Count significant pauses based on punctuation and speech patterns
  const pauseIndicators = transcript.match(/[.]{2,}|,\s*,|\.{3}|\s{3,}/g);
  return pauseIndicators ? pauseIndicators.length : 0;
};

export const calculateFluencyScore = (
  fillerWords: FillerWordInstance[],
  wordsPerMinute: number,
  pauseCount: number,
  totalWords: number
): number => {
  if (totalWords === 0) return 0;
  
  // Base score starts at 100
  let score = 100;
  
  // Deduct for filler words (more impact with higher frequency)
  const totalFillers = fillerWords.reduce((sum, f) => sum + f.count, 0);
  const fillerRatio = totalFillers / totalWords;
  score -= Math.min(30, fillerRatio * 150); // Max 30 point deduction
  
  // Deduct for abnormal speaking pace
  if (wordsPerMinute < 100) {
    score -= Math.min(15, (100 - wordsPerMinute) / 5);
  } else if (wordsPerMinute > 180) {
    score -= Math.min(15, (wordsPerMinute - 180) / 10);
  }
  
  // Deduct for excessive pauses
  const pauseRatio = pauseCount / Math.max(1, totalWords / 50);
  score -= Math.min(20, pauseRatio * 10);
  
  return Math.max(0, Math.round(score));
};

export const calculateGrammarScore = (
  grammarIssues: GrammarIssue[],
  totalWords: number
): number => {
  if (totalWords === 0) return 0;
  
  let score = 100;
  const issueRatio = grammarIssues.length / totalWords;
  score -= Math.min(50, issueRatio * 500);
  
  return Math.max(0, Math.round(score));
};

export const generateSuggestions = (
  fillerWords: FillerWordInstance[],
  grammarIssues: GrammarIssue[],
  wordsPerMinute: number,
  fluencyScore: number
): string[] => {
  const suggestions: string[] = [];
  
  if (fillerWords.length > 0) {
    const topFiller = fillerWords[0];
    suggestions.push(
      `Try to reduce using "${topFiller.word}" - you used it ${topFiller.count} time${topFiller.count > 1 ? 's' : ''}.`
    );
  }
  
  if (grammarIssues.length > 0) {
    suggestions.push(
      `Watch out for grammar: "${grammarIssues[0].original}" should be "${grammarIssues[0].suggestion}".`
    );
  }
  
  if (wordsPerMinute < 100) {
    suggestions.push('Try speaking a bit faster to maintain listener engagement.');
  } else if (wordsPerMinute > 180) {
    suggestions.push('Slow down slightly - you\'re speaking quite fast!');
  }
  
  if (fluencyScore >= 80) {
    suggestions.push('Great fluency! Keep practicing to maintain this level.');
  } else if (fluencyScore >= 60) {
    suggestions.push('Good progress! Focus on reducing pauses and filler words.');
  } else {
    suggestions.push('Practice reading aloud daily to improve your flow.');
  }
  
  return suggestions;
};

export const analyzeSpeech = (
  transcript: string,
  durationSeconds: number
): SpeechAnalysis => {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const wordsPerMinute = durationSeconds > 0 
    ? Math.round((totalWords / durationSeconds) * 60) 
    : 0;
  
  const fillerWords = analyzeFillerWords(transcript);
  const grammarIssues = analyzeGrammar(transcript);
  const pauseCount = countPauses(transcript);
  
  const fluencyScore = calculateFluencyScore(fillerWords, wordsPerMinute, pauseCount, totalWords);
  const grammarScore = calculateGrammarScore(grammarIssues, totalWords);
  const overallScore = Math.round((fluencyScore * 0.6) + (grammarScore * 0.4));
  
  const suggestions = generateSuggestions(fillerWords, grammarIssues, wordsPerMinute, fluencyScore);
  
  return {
    transcript,
    fluencyScore,
    grammarScore,
    overallScore,
    speakingDuration: durationSeconds,
    wordsPerMinute,
    fillerWords,
    grammarIssues,
    pauseCount,
    suggestions,
  };
};
