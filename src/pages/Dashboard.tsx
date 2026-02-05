import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getDailyProgress, getPracticeSessions } from '@/utils/progressStorage';
import { UserStats, DailyProgress, PracticeSession } from '@/types/fluency';
import { StatsOverview } from '@/components/StatsOverview';
import { ProgressChart } from '@/components/ProgressChart';
import { StreakCalendar } from '@/components/StreakCalendar';
import { ScoreCircle } from '@/components/ScoreCircle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  ChevronRight, 
  ArrowLeft, 
  Calendar,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [allSessions, setAllSessions] = useState<PracticeSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const sessions = getPracticeSessions();
    setAllSessions(sessions);
    setStats(getUserStats());
    setProgress(getDailyProgress(14)); // 2 weeks of progress
    setRecentSessions(
      sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-lg">Dashboard</span>
            </div>
          </div>
          <Link to="/practice">
            <Button className="gradient-hero text-primary-foreground">
              <Mic className="w-4 h-4 mr-2" />
              Practice Now
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your speaking progress and maintain your practice streak.
          </p>
        </section>

        {/* Stats Overview */}
        {stats && stats.totalSessions > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Your Stats</h2>
            </div>
            <StatsOverview stats={stats} />
          </section>
        )}

        {/* Yearly Streak Calendar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-semibold">Practice Activity</h2>
          </div>
          <StreakCalendar sessions={allSessions} />
        </section>

        {/* Weekly Progress Chart */}
        {progress.some(p => p.sessionsCount > 0) && (
          <section>
            <ProgressChart data={progress} />
          </section>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-display font-semibold mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Card key={session.id} className="p-4 shadow-card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ScoreCircle score={session.overallScore} label="" size="sm" />
                      <div>
                        <p className="font-medium">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s • {session.wordsPerMinute} WPM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">Fluency: {session.fluencyScore}%</p>
                        <p className="text-sm text-muted-foreground">Grammar: {session.grammarScore}%</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!stats || stats.totalSessions === 0) && (
          <section className="text-center py-12">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-2xl flex items-center justify-center">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-semibold">No sessions yet</h2>
              <p className="text-muted-foreground">
                Start your first practice session to see your progress here.
              </p>
              <Link to="/practice">
                <Button size="lg" className="gradient-hero text-primary-foreground">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Practicing
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
