import { UserStats } from '@/types/fluency';
import { Card } from '@/components/ui/card';
import { Flame, Clock, Target, Trophy, TrendingUp, Award } from 'lucide-react';

interface StatsOverviewProps {
  stats: UserStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const statItems = [
    {
      icon: Target,
      label: 'Total Sessions',
      value: stats.totalSessions,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Clock,
      label: 'Speaking Time',
      value: `${stats.totalSpeakingTime}m`,
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Fluency',
      value: `${stats.averageFluency}%`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Award,
      label: 'Best Score',
      value: stats.bestScore,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Trophy,
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <Card
          key={item.label}
          className="p-4 shadow-card hover:shadow-lg transition-shadow animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{item.label}</p>
              <p className="text-lg font-display font-semibold">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
