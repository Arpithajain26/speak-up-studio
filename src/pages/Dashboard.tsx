import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getDailyProgress, getPracticeSessions } from '@/utils/progressStorage';
import { getRecentCloudSessions, deleteCloudSession } from '@/utils/videoStorage';
import { UserStats, DailyProgress, PracticeSession } from '@/types/fluency';
import { StatsOverview } from '@/components/StatsOverview';
import { ProgressChart } from '@/components/ProgressChart';
import { StreakCalendar } from '@/components/StreakCalendar';
import { ScoreCircle } from '@/components/ScoreCircle';
import { VideoPlayback } from '@/components/VideoPlayback';
import { SessionFilters, SessionFilterValues, defaultFilters } from '@/components/SessionFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft, 
  Calendar,
  TrendingUp,
  LayoutDashboard,
  Video,
  VideoOff,
  Trash2
} from 'lucide-react';

interface CloudSession {
  id: string;
  created_at: string;
  video_url: string | null;
  transcript: string | null;
  duration: number | null;
  fluency_score: number | null;
  grammar_score: number | null;
  overall_score: number | null;
  words_per_minute: number | null;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [allSessions, setAllSessions] = useState<PracticeSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [cloudSessions, setCloudSessions] = useState<CloudSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilterValues>(defaultFilters);
  const { toast } = useToast();

  const filteredCloudSessions = useMemo(() => {
    return cloudSessions.filter((session) => {
      const sessionDate = new Date(session.created_at);

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        from.setHours(0, 0, 0, 0);
        if (sessionDate < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (sessionDate > to) return false;
      }

      if (filters.minScore > 0 && (session.overall_score ?? 0) < filters.minScore) {
        return false;
      }

      if (filters.videoFilter === 'with-video' && !session.video_url) return false;
      if (filters.videoFilter === 'without-video' && session.video_url) return false;

      return true;
    });
  }, [cloudSessions, filters]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleDeleteSession = async (session: CloudSession) => {
    setDeletingId(session.id);
    const success = await deleteCloudSession(session.id, session.video_url);
    setDeletingId(null);
    if (success) {
      setCloudSessions(prev => prev.filter(s => s.id !== session.id));
      if (expandedSession === session.id) setExpandedSession(null);
      toast({ title: 'Session deleted', description: 'The recorded session has been removed.' });
    } else {
      toast({ title: 'Delete failed', description: 'Could not delete the session. Please try again.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const sessions = getPracticeSessions();
    setAllSessions(sessions);
    setStats(getUserStats());
    setProgress(getDailyProgress(14));
    setRecentSessions(
      sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    );
  }, []);

  // Fetch cloud sessions with videos
  useEffect(() => {
    const fetchCloudSessions = async () => {
      const sessions = await getRecentCloudSessions(20);
      setCloudSessions(sessions as CloudSession[]);
    };
    if (user) {
      fetchCloudSessions();
    }
  }, [user]);

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

        {/* Recorded Sessions with Videos */}
        {cloudSessions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Recorded Sessions</h2>
            </div>
            <SessionFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={cloudSessions.length}
              filteredCount={filteredCloudSessions.length}
            />
            <div className="space-y-3 mt-4">
              {filteredCloudSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No sessions match your filters.</p>
                </div>
              ) : (
              filteredCloudSessions.map((session) => (
                <Card key={session.id} className="shadow-card hover:shadow-lg transition-shadow overflow-hidden">
                  <button
                    className="w-full p-4 text-left"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ScoreCircle score={session.overall_score ?? 0} label="" size="sm" />
                        <div>
                          <p className="font-medium">
                            {new Date(session.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : '—'} • {session.words_per_minute ?? 0} WPM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.video_url ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1">
                            <VideoOff className="w-3 h-3" />
                            No video
                          </span>
                        )}
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">Fluency: {session.fluency_score ?? 0}%</p>
                          <p className="text-sm text-muted-foreground">Grammar: {session.grammar_score ?? 0}%</p>
                        </div>
                        {expandedSession === session.id ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {expandedSession === session.id && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {session.video_url ? (
                        <VideoPlayback videoUrl={session.video_url} />
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No video recorded for this session.
                        </p>
                      )}
                      {session.transcript && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-sm font-medium mb-1">Transcript</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {session.transcript}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-primary">{session.fluency_score ?? 0}%</p>
                          <p className="text-xs text-muted-foreground">Fluency</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-primary">{session.grammar_score ?? 0}%</p>
                          <p className="text-xs text-muted-foreground">Grammar</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-primary">{session.words_per_minute ?? 0}</p>
                          <p className="text-xs text-muted-foreground">WPM</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === session.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingId === session.id ? 'Deleting…' : 'Delete Session'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the recording and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </Card>
              ))
              )}
            </div>
          </section>
        )}

        {/* Local Recent Sessions (without video) */}
        {recentSessions.length > 0 && cloudSessions.length === 0 && (
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
