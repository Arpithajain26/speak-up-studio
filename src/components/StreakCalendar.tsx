import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PracticeSession } from '@/types/fluency';

interface StreakCalendarProps {
  sessions: PracticeSession[];
}

export const StreakCalendar = ({ sessions }: StreakCalendarProps) => {
  const calendarData = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    
    // Create a map of dates with session counts
    const sessionMap = new Map<string, number>();
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      sessionMap.set(dateStr, (sessionMap.get(dateStr) || 0) + 1);
    });
    
    // Generate all days of the year
    const days: { date: Date; count: number; dateStr: string }[] = [];
    const current = new Date(startOfYear);
    
    while (current <= endOfYear) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: new Date(current),
        count: sessionMap.get(dateStr) || 0,
        dateStr,
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [sessions]);

  const weeks = useMemo(() => {
    const result: { date: Date; count: number; dateStr: string }[][] = [];
    let currentWeek: { date: Date; count: number; dateStr: string }[] = [];
    
    // Pad the first week with empty slots
    const firstDayOfWeek = calendarData[0]?.date.getDay() || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), count: -1, dateStr: '' });
    }
    
    calendarData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Push remaining days
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }, [calendarData]);

  const getIntensityClass = (count: number): string => {
    if (count === -1) return 'bg-transparent';
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-primary/40';
    if (count === 2) return 'bg-primary/60';
    if (count >= 3) return 'bg-primary';
    return 'bg-muted';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  const totalPracticeDays = calendarData.filter(d => d.count > 0).length;
  const totalSessions = sessions.filter(s => new Date(s.date).getFullYear() === currentYear).length;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold">
          {currentYear} Practice Streak
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalPracticeDays} days practiced</span>
          <span>{totalSessions} sessions</span>
        </div>
      </div>
      
      {/* Month labels */}
      <div className="flex mb-2 ml-8">
        {months.map((month, i) => (
          <div
            key={month}
            className="text-xs text-muted-foreground"
            style={{ width: `${100 / 12}%` }}
          >
            {month}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 text-xs text-muted-foreground">
          <span className="h-3">S</span>
          <span className="h-3">M</span>
          <span className="h-3">T</span>
          <span className="h-3">W</span>
          <span className="h-3">T</span>
          <span className="h-3">F</span>
          <span className="h-3">S</span>
        </div>
        
        {/* Weeks */}
        <div className="flex gap-[3px] flex-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <Tooltip key={`${weekIndex}-${dayIndex}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 rounded-sm transition-colors ${getIntensityClass(day.count)} ${
                        day.count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''
                      }`}
                    />
                  </TooltipTrigger>
                  {day.count >= 0 && (
                    <TooltipContent>
                      <p className="text-xs">
                        {day.count === 0
                          ? `No practice on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : `${day.count} session${day.count > 1 ? 's' : ''} on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};
