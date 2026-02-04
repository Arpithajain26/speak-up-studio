import { useState, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { analyzeSpeech } from '@/utils/speechAnalysis';
import { savePracticeSession } from '@/utils/progressStorage';
import { uploadPracticeVideo, savePracticeSessionToCloud } from '@/utils/videoStorage';
import { analyzeBodyLanguage } from '@/utils/bodyLanguageAnalysis';
import { SpeechAnalysis } from '@/types/fluency';
import { BodyLanguageFeedback } from '@/types/bodyLanguage';
import { RecordButton } from '@/components/RecordButton';
import { SoundWave } from '@/components/SoundWave';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { FeedbackCard } from '@/components/FeedbackCard';
import { BodyLanguageFeedbackCard } from '@/components/BodyLanguageFeedback';
import { VideoPreview } from '@/components/VideoPreview';
import { VideoPlayback } from '@/components/VideoPlayback';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Practice = () => {
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [bodyLanguageFeedback, setBodyLanguageFeedback] = useState<BodyLanguageFeedback | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingBodyLanguage, setIsAnalyzingBodyLanguage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudVideoUrl, setCloudVideoUrl] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
    error: speechError,
  } = useSpeechRecognition();

  const {
    isRecording,
    videoStream,
    recordedVideoUrl,
    recordedBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error: videoError,
    isSupported: videoSupported,
  } = useVideoRecording();

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording and analyze
      stopRecording();
      stopListening();
      setIsProcessing(true);
      
      const duration = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0;
      
      // Small delay to ensure final transcript is captured
      setTimeout(async () => {
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
        
        // Save session locally
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
      setBodyLanguageFeedback(null);
      setCloudVideoUrl(null);
      resetTranscript();
      resetRecording();
      startTimeRef.current = Date.now();
      
      // Start video first, then speech
      await startRecording();
      startListening();
    }
  }, [isRecording, stopRecording, stopListening, startRecording, startListening, resetTranscript, resetRecording, transcript, interimTranscript]);

  const handleAnalyzeBodyLanguage = useCallback(async () => {
    if (!recordedBlob) return;
    
    setIsAnalyzingBodyLanguage(true);
    
    try {
      const feedback = await analyzeBodyLanguage(recordedBlob);
      if (feedback) {
        setBodyLanguageFeedback(feedback);
        toast({
          title: 'Body language analyzed!',
          description: `Your body language score is ${feedback.overallScore}%`,
        });
      } else {
        toast({
          title: 'Analysis failed',
          description: 'Could not analyze body language. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Body language analysis error:', err);
      toast({
        title: 'Error',
        description: 'An error occurred during analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingBodyLanguage(false);
    }
  }, [recordedBlob]);

  const handleSaveToCloud = useCallback(async () => {
    if (!recordedBlob || !analysis) return;
    
    setIsSaving(true);
    
    try {
      // Upload video to cloud
      const videoUrl = await uploadPracticeVideo(recordedBlob);
      
      if (videoUrl) {
        setCloudVideoUrl(videoUrl);
        
        // Save session to database
        const duration = startTimeRef.current
          ? (Date.now() - startTimeRef.current) / 1000
          : 0;
        
        await savePracticeSessionToCloud(videoUrl, analysis, duration);
        
        toast({
          title: 'Saved to cloud!',
          description: 'Your practice session has been saved.',
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Could not save video to cloud. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to save to cloud:', err);
      toast({
        title: 'Error',
        description: 'An error occurred while saving.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [recordedBlob, analysis]);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setBodyLanguageFeedback(null);
    setCloudVideoUrl(null);
    resetTranscript();
    resetRecording();
    startTimeRef.current = null;
  }, [resetTranscript, resetRecording]);

  if (!speechSupported || !videoSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2">Browser Not Supported</h2>
          <p className="text-muted-foreground">
            {!speechSupported && 'Speech recognition is not supported. '}
            {!videoSupported && 'Video recording is not supported. '}
            Please use Chrome, Edge, or Safari.
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
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Practice Speaking</h1>
              <p className="text-muted-foreground">
                Turn on your camera and microphone, then speak freely
              </p>
            </div>

            {/* Video Preview */}
            <VideoPreview stream={videoStream} isActive={isRecording} />

            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4">
              <RecordButton
                isRecording={isRecording}
                isProcessing={isProcessing}
                onClick={handleToggleRecording}
              />
              <SoundWave isActive={isListening} barCount={7} />
              <p className="text-sm text-muted-foreground text-center">
                {isRecording 
                  ? 'Recording... Click to stop and analyze' 
                  : 'Tap to start camera and microphone'}
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
                <li>• Introduce yourself in 30 seconds</li>
                <li>• Describe your favorite hobby</li>
                <li>• Tell a story about your last vacation</li>
                <li>• Explain what you did today</li>
              </ul>
            </div>

            {(speechError || videoError) && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                Error: {speechError || videoError}. Please check your camera and microphone permissions.
              </div>
            )}
          </div>
        ) : (
          // Results View
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Session Complete!</h1>
              <p className="text-muted-foreground">Review your performance and recording</p>
            </div>

            {/* Video Playback */}
            {(recordedVideoUrl || cloudVideoUrl) && (
              <div className="space-y-3">
                <h3 className="font-semibold">Your Recording</h3>
                <VideoPlayback videoUrl={cloudVideoUrl || recordedVideoUrl!} />
                
                <div className="flex justify-center gap-3">
                  {!cloudVideoUrl && (
                    <Button 
                      onClick={handleSaveToCloud} 
                      disabled={isSaving}
                      variant="outline"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Save to Cloud
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!bodyLanguageFeedback && !isAnalyzingBodyLanguage && (
                    <Button 
                      onClick={handleAnalyzeBodyLanguage}
                      className="gradient-hero text-primary-foreground"
                    >
                      Analyze Body Language
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Body Language Feedback */}
            <BodyLanguageFeedbackCard 
              feedback={bodyLanguageFeedback} 
              isAnalyzing={isAnalyzingBodyLanguage} 
            />

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
