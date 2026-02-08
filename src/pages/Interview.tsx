import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useInterviewChat, InterviewCategory } from '@/hooks/useInterviewChat';
import { InterviewCategoryPicker } from '@/components/InterviewCategoryPicker';
import { InterviewChatWindow } from '@/components/InterviewChatWindow';
import { InterviewVerdict } from '@/components/InterviewVerdict';
import { Mic, ArrowLeft } from 'lucide-react';

const Interview = () => {
  const { messages, isLoading, category, verdict, startInterview, sendAnswer, endInterview, resetInterview } = useInterviewChat();

  const hasStarted = messages.length > 0;

  const handleCategorySelect = (selectedCategory: InterviewCategory) => {
    startInterview(selectedCategory);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Mic className="w-5 h-5 text-primary" />
          <span className="font-display font-bold">Interview Prep</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {verdict ? (
          <InterviewVerdict verdict={verdict} onNewInterview={resetInterview} />
        ) : !hasStarted && !isLoading ? (
          <div className="container py-8 flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <InterviewCategoryPicker onSelect={handleCategorySelect} />
            </div>
          </div>
        ) : (
          <Card className="flex-1 flex flex-col mx-4 my-4 md:mx-auto md:max-w-3xl md:w-full overflow-hidden shadow-card border-2">
            <InterviewChatWindow
              messages={messages}
              isLoading={isLoading}
              category={category}
              onSendAnswer={sendAnswer}
              onEndInterview={endInterview}
              onReset={resetInterview}
            />
          </Card>
        )}
      </main>
    </div>
  );
};

export default Interview;
