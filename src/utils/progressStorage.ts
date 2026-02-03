import { PracticeSession, DailyProgress, UserStats } from '@/types/fluency';

const STORAGE_KEY = 'fluency_practice_sessions';

export const savePracticeSession = (session: Omit<PracticeSession, 'id'>): PracticeSession => {
  const sessions = getPracticeSessions();
  const newSession: PracticeSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  
  return newSession;
};

export const getPracticeSessions = (): PracticeSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const sessions = JSON.parse(stored);
    return sessions.map((s: any) => ({
      ...s,
      date: new Date(s.date),
    }));
  } catch {
    return [];
  }
};

export const getRecentSessions = (count: number = 10): PracticeSession[] => {
  const sessions = getPracticeSessions();
  return sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getDailyProgress = (days: number = 7): DailyProgress[] => {
  const sessions = getPracticeSessions();
  const progress: DailyProgress[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
    
    if (daySessions.length > 0) {
      progress.push({
        date: dateStr,
        sessionsCount: daySessions.length,
        averageFluency: Math.round(
          daySessions.reduce((sum, s) => sum + s.fluencyScore, 0) / daySessions.length
        ),
        averageGrammar: Math.round(
          daySessions.reduce((sum, s) => sum + s.grammarScore, 0) / daySessions.length
        ),
        totalSpeakingTime: Math.round(
          daySessions.reduce((sum, s) => sum + s.duration, 0) / 60
        ),
        averageWPM: Math.round(
          daySessions.reduce((sum, s) => sum + s.wordsPerMinute, 0) / daySessions.length
        ),
      });
    } else {
      progress.push({
        date: dateStr,
        sessionsCount: 0,
        averageFluency: 0,
        averageGrammar: 0,
        totalSpeakingTime: 0,
        averageWPM: 0,
      });
    }
  }
  
  return progress;
};

export const getUserStats = (): UserStats => {
  const sessions = getPracticeSessions();
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalSpeakingTime: 0,
      averageFluency: 0,
      averageGrammar: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestScore: 0,
    };
  }
  
  const totalSpeakingTime = Math.round(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  
  const averageFluency = Math.round(
    sessions.reduce((sum, s) => sum + s.fluencyScore, 0) / sessions.length
  );
  
  const averageGrammar = Math.round(
    sessions.reduce((sum, s) => sum + s.grammarScore, 0) / sessions.length
  );
  
  const bestScore = Math.max(...sessions.map(s => s.overallScore));
  
  // Calculate streak
  const sortedDates = [...new Set(
    sessions.map(s => new Date(s.date).toISOString().split('T')[0])
  )].sort().reverse();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check if practiced today or yesterday for current streak
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  if (sortedDates.length > 0) {
    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  
  return {
    totalSessions: sessions.length,
    totalSpeakingTime,
    averageFluency,
    averageGrammar,
    currentStreak,
    longestStreak,
    bestScore,
  };
};
