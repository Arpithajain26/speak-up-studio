import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/speechAnalysis';
import { InterviewMessage } from '@/components/InterviewMessage';
import { InterviewVideoRecorder } from '@/components/InterviewVideoRecorder';
import { CodeEditor } from '@/components/CodeEditor';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Send, Loader2, RotateCcw, Volume2, Video, Code, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InterviewCategory } from '@/hooks/useInterviewChat';

interface InterviewChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  category: InterviewCategory;
  onSendAnswer: (answer: string) => Promise<void>;
  onEndInterview: () => Promise<void>;
  onReset: () => void;
}

const categoryLabels: Record<InterviewCategory, string> = {
  behavioral: 'Behavioral',
  technical: 'Technical',
  coding: 'Coding',
  'system-design': 'System Design',
  hr: 'HR / General',
  mixed: 'Full Interview',
};

export const InterviewChatWindow = ({
  messages,
  isLoading,
  category,
  onSendAnswer,
  onEndInterview,
  onReset,
}: InterviewChatWindowProps) => {
  const [input, setInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  const lastSpokenRef = useRef<number>(-1);

  const {
    isRecording,
    videoStream,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    resetRecording,
    error: videoError,
  } = useVideoRecording();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: sttSupported,
    error: sttError,
  } = useSpeechRecognition();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!autoSpeak || !ttsSupported || isLoading) return;

    const lastAssistantIdx = messages.reduce(
      (lastIdx, m, i) => (m.role === 'assistant' ? i : lastIdx),
      -1
    );

    if (lastAssistantIdx > lastSpokenRef.current && messages[lastAssistantIdx]?.role === 'assistant') {
      lastSpokenRef.current = lastAssistantIdx;
      const timer = setTimeout(() => {
        speak(messages[lastAssistantIdx].content);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, autoSpeak, ttsSupported, speak]);

  const handleStartRecording = useCallback(async () => {
    stop(); // Stop any ongoing TTS
    setIsRecordingMode(true);
    resetTranscript();
    await startVideoRecording();
    startListening();
  }, [stop, startVideoRecording, startListening, resetTranscript]);

  const handleStopRecording = useCallback(() => {
    stopVideoRecording();
    stopListening();
  }, [stopVideoRecording, stopListening]);

  const handleSendRecordedAnswer = useCallback(async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No speech detected',
        description: 'Please record your answer again — make sure to speak clearly.',
        variant: 'destructive',
      });
      return;
    }

    const answer = transcript.trim();
    resetRecording();
    resetTranscript();
    setIsRecordingMode(false);

    try {
      await onSendAnswer(answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [transcript, onSendAnswer, resetRecording, resetTranscript]);

  const handleCancelRecording = useCallback(() => {
    stopVideoRecording();
    stopListening();
    resetRecording();
    resetTranscript();
    setIsRecordingMode(false);
  }, [stopVideoRecording, stopListening, resetRecording, resetTranscript]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const answer = input;
    setInput('');
    stop();

    try {
      await onSendAnswer(answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCodeSubmit = useCallback(async (code: string, language: string) => {
    const formattedAnswer = `\`\`\`${language}\n${code}\n\`\`\``;
    setIsCodeMode(false);
    stop();
    try {
      await onSendAnswer(formattedAnswer);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send code',
        variant: 'destructive',
      });
    }
  }, [onSendAnswer, stop]);

  const handleEndInterview = useCallback(async () => {
    stop();
    try {
      await onEndInterview();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get verdict',
        variant: 'destructive',
      });
    }
  }, [onEndInterview, stop]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div>
          <h3 className="font-display font-semibold text-sm">
            Mock Interview — {categoryLabels[category]}
          </h3>
          <p className="text-xs text-muted-foreground">Answer questions as you would in a real interview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ttsSupported && (
            <Button
              variant={autoSpeak ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                if (autoSpeak) stop();
              }}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              {autoSpeak ? 'Audio On' : 'Audio Off'}
            </Button>
          )}
          {messages.length >= 2 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={handleEndInterview}
              disabled={isLoading}
            >
              <Square className="w-3 h-3 mr-1" />
              End Interview
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onReset}>
            <RotateCcw className="w-3 h-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <InterviewMessage
              key={index}
              message={message}
              isSpeaking={isSpeaking}
              onSpeak={speak}
              onStopSpeaking={stop}
              ttsSupported={ttsSupported}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="bg-secondary rounded-2xl px-4 py-3">
                <p className="text-sm text-muted-foreground">Evaluating your answer...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t space-y-3">
        {/* Code Editor Mode */}
        {isCodeMode && (
          <div className="space-y-2">
            <CodeEditor onSubmitCode={handleCodeSubmit} isLoading={isLoading} />
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsCodeMode(false)}
            >
              Back to text input
            </Button>
          </div>
        )}

        {/* Video Recording Mode */}
        {isRecordingMode && !isCodeMode && (
          <InterviewVideoRecorder
            isRecording={isRecording || isListening}
            videoStream={videoStream}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onSendTranscript={handleSendRecordedAnswer}
            onCancel={handleCancelRecording}
            isLoading={isLoading}
            error={videoError || sttError}
          />
        )}

        {/* Text Input + Record Toggle + Code Toggle */}
        {!isRecordingMode && !isCodeMode && (
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Shift+Enter for new line)"
              disabled={isLoading}
              className="flex-1 min-h-[60px] max-h-[150px] resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-1.5 self-end">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="gradient-hero text-primary-foreground h-10 w-10"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsCodeMode(true)}
                disabled={isLoading}
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="Open code editor"
              >
                <Code className="w-4 h-4" />
              </Button>
              {sttSupported && (
                <Button
                  onClick={handleStartRecording}
                  disabled={isLoading}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  title="Record video answer"
                >
                  <Video className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
