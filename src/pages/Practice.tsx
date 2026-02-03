import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { analyzeSpeech } from '@/utils/speechAnalysis';
import { savePracticeSession } from '@/utils/progressStorage';
import { SpeechAnalysis } from '@/types/fluency';
import { RecordButton } from '@/components/RecordButton';
import { SoundWave } from '@/components/SoundWave';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { FeedbackCard } from '@/components/FeedbackCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Practice = () => {
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  } = useSpeechRecognition();

  const handleToggleRecording = useCallback(() => {
    if (isListening) {
      // Stop recording and analyze
      stopListening();
      setIsProcessing(true);
      
      const duration = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0;
      
      // Small delay to ensure final transcript is captured
      setTimeout(() => {
        const finalTranscript = transcript + interimTranscript;
        
        if (finalTranscript.trim().length < 10) {
          toast({
            title: 'Not enough speech',
            description: 'Please speak for at least a few seconds.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }
        
        const result = analyzeSpeech(finalTranscript, duration);
        setAnalysis(result);
        
        // Save session
        savePracticeSession({
          date: new Date(),
          duration: Math.round(duration),
          transcript: finalTranscript,
          fluencyScore: result.fluencyScore,
          grammarScore: result.grammarScore,
          overallScore: result.overallScore,
          wordsPerMinute: result.wordsPerMinute,
        });
        
        setIsProcessing(false);
        
        toast({
          title: 'Analysis complete!',
          description: `Your overall score is ${result.overallScore}%`,
        });
      }, 500);
    } else {
      // Start recording
      setAnalysis(null);
      resetTranscript();
      startTimeRef.current = Date.now();
      startListening();
    }
  }, [isListening, stopListening, startListening, resetTranscript, transcript, interimTranscript]);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    resetTranscript();
    startTimeRef.current = null;
  }, [resetTranscript]);

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2">Browser Not Supported</h2>
          <p className="text-muted-foreground">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          {analysis && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Session
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8 max-w-2xl mx-auto">
        {!analysis ? (
          // Recording View
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Practice Speaking</h1>
              <p className="text-muted-foreground">
                Click the microphone and start speaking in English
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-6">
              <RecordButton
                isRecording={isListening}
                isProcessing={isProcessing}
                onClick={handleToggleRecording}
              />
              <SoundWave isActive={isListening} barCount={7} />
              <p className="text-sm text-muted-foreground">
                {isListening ? 'Recording... Click to stop and analyze' : 'Tap to start recording'}
              </p>
            </div>

            {/* Transcript */}
            <TranscriptDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
              isListening={isListening}
            />

            {/* Speaking Prompts */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3">💡 Try these prompts:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Describe your favorite hobby in 30 seconds</li>
                <li>• Tell a story about your last vacation</li>
                <li>• Explain what you did today</li>
                <li>• Describe your dream job</li>
              </ul>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                Error: {error}. Please check your microphone permissions.
              </div>
            )}
          </div>
        ) : (
          // Results View
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Session Complete!</h1>
              <p className="text-muted-foreground">Here's your detailed feedback</p>
            </div>

            <FeedbackCard analysis={analysis} />

            {/* Transcript Review */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold mb-3">What you said:</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{analysis.transcript}"
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleReset} className="flex-1 gradient-hero text-primary-foreground">
                <RefreshCw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Progress
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
