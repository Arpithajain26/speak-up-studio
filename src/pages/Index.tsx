import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getDailyProgress, getRecentSessions } from '@/utils/progressStorage';
import { UserStats, DailyProgress, PracticeSession } from '@/types/fluency';
import { StatsOverview } from '@/components/StatsOverview';
import { ProgressChart } from '@/components/ProgressChart';
import { ScoreCircle } from '@/components/ScoreCircle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, ChevronRight, Sparkles, BookOpen, Target, LogIn, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    setStats(getUserStats());
    setProgress(getDailyProgress(7));
    setRecentSessions(getRecentSessions(5));
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const hasData = stats && stats.totalSessions > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">SpeakEasy</span>
          </div>
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container relative py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Speaking Coach
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Speak English with
            <span className="text-gradient block mt-1">Confidence</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Practice speaking, get instant feedback on fluency and grammar, 
            and track your daily improvement.
          </p>
          
          {user ? (
            <Link to="/practice">
              <Button size="lg" className="gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                <Mic className="w-5 h-5 mr-2" />
                Start Practice Session
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Start Practicing
              </Button>
            </Link>
          )}
        </div>
      </section>

      <main className="container pb-16 space-y-8">
        {hasData && user ? (
          <>
            {/* Stats Overview */}
            <section>
              <h2 className="text-xl font-display font-semibold mb-4">Your Progress</h2>
              <StatsOverview stats={stats} />
            </section>

            {/* Progress Chart */}
            <section>
              <ProgressChart data={progress} />
            </section>

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
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          // Empty State
          <section className="text-center py-12">
            <div className="max-w-md mx-auto space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-secondary rounded-2xl flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-semibold">Ready to improve?</h2>
                <p className="text-muted-foreground">
                  {user 
                    ? 'Complete your first practice session to start tracking your progress.'
                    : 'Sign in to start tracking your speaking progress and save your sessions.'}
                </p>
              </div>

              {user ? (
                <Link to="/practice">
                  <Button size="lg" className="gradient-hero text-primary-foreground">
                    <Mic className="w-5 h-5 mr-2" />
                    Start Your First Session
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="gradient-hero text-primary-foreground">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Get Started
                  </Button>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-4 pt-8">
          {[
            {
              icon: Mic,
              title: 'Real-time Analysis',
              description: 'Get instant feedback on your speech as you practice',
            },
            {
              icon: BookOpen,
              title: 'Grammar Check',
              description: 'Identify and correct common grammar mistakes',
            },
            {
              icon: Target,
              title: 'Track Progress',
              description: 'Monitor your improvement over time with detailed stats',
            },
          ].map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 rounded-xl bg-secondary w-fit mb-4">
                <feature.icon className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built for students to practice and improve their English speaking skills</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
