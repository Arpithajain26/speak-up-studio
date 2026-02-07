import { Card } from '@/components/ui/card';
import { InterviewCategory } from '@/hooks/useInterviewChat';
import { Brain, Code, Server, Users, Briefcase, Shuffle } from 'lucide-react';

interface InterviewCategoryPickerProps {
  onSelect: (category: InterviewCategory) => void;
}

const categories: { id: InterviewCategory; label: string; description: string; icon: typeof Brain }[] = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'STAR method questions about leadership, teamwork & problem-solving',
    icon: Users,
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Data structures, algorithms, OOP, system concepts',
    icon: Brain,
  },
  {
    id: 'coding',
    label: 'Coding',
    description: 'Live coding problems with complexity analysis',
    icon: Code,
  },
  {
    id: 'system-design',
    label: 'System Design',
    description: 'Design scalable systems, microservices & architecture',
    icon: Server,
  },
  {
    id: 'hr',
    label: 'HR / General',
    description: 'Career goals, strengths, weaknesses & culture fit',
    icon: Briefcase,
  },
  {
    id: 'mixed',
    label: 'Full Interview',
    description: 'Mix of all categories like a real multi-round interview',
    icon: Shuffle,
  },
];

export const InterviewCategoryPicker = ({ onSelect }: InterviewCategoryPickerProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Choose Interview Type</h2>
        <p className="text-muted-foreground">Select a category to start your mock interview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="p-4 cursor-pointer shadow-card hover:shadow-lg transition-all hover:-translate-y-1 hover:border-primary/50 group"
            onClick={() => onSelect(cat.id)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <cat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm">{cat.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
