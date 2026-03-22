import { ChatMessage } from '@/types/speechAnalysis';
import { User, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import interviewerAvatar from '@/assets/interviewer-priya.jpg';

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
      {isAssistant ? (
        <img
          src={interviewerAvatar}
          alt="Interviewer Priya"
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-primary/20 shadow-sm"
        />
      ) : (
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
          <User className="w-4 h-4" />
        </div>
      )}
      <div className="max-w-[85%] space-y-1">
        {isAssistant && (
          <span className="text-[11px] font-medium text-muted-foreground ml-1">Priya — Interviewer</span>
        )}
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
