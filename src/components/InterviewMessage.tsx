import { ChatMessage } from '@/types/speechAnalysis';
import { Bot, User, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface InterviewMessageProps {
  message: ChatMessage;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  ttsSupported: boolean;
}

export const InterviewMessage = ({
  message,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
  ttsSupported,
}: InterviewMessageProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${!isAssistant ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isAssistant ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="max-w-[85%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant ? 'bg-secondary' : 'bg-primary text-primary-foreground'
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:text-xs">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        {isAssistant && ttsSupported && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (isSpeaking ? onStopSpeaking() : onSpeak(message.content))}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3 h-3 mr-1" /> Stop
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 mr-1" /> Listen
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
