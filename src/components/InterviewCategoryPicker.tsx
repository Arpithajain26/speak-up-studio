import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InterviewCategory } from '@/hooks/useInterviewChat';
import { Brain, Code, Server, Users, Briefcase, Shuffle, ClipboardCheck } from 'lucide-react';

interface InterviewCategoryPickerProps {
  onSelect: (category: InterviewCategory) => void;
}

const categories: { id: InterviewCategory; label: string; description: string; icon: typeof Brain; badge?: string }[] = [
  {
    id: 'mock-test',
    label: 'Full Mock Test',
    description: 'Complete interview simulation with real questions — OOPs, DSA, System Design, Coding, HR. Get a final eligibility verdict.',
    icon: ClipboardCheck,
    badge: 'Recommended',
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'STAR method questions about leadership, teamwork & problem-solving',
    icon: Users,
  },
  {
    id: 'technical',
    label: 'Technical / OOPs',
    description: 'OOP concepts, SOLID principles, design patterns, data structures',
    icon: Brain,
  },
  {
    id: 'coding',
    label: 'Coding / DSA',
    description: 'Live coding problems — arrays, trees, DP, graphs with complexity analysis',
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
    label: 'Random Mix',
    description: 'Random mix of all categories',
    icon: Shuffle,
  },
];

export const InterviewCategoryPicker = ({ onSelect }: InterviewCategoryPickerProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Choose Interview Type</h2>
        <p className="text-muted-foreground">Select a category or take the full mock test to get your eligibility verdict</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className={`p-4 cursor-pointer shadow-card hover:shadow-lg transition-all hover:-translate-y-1 hover:border-primary/50 group ${
              cat.id === 'mock-test' ? 'sm:col-span-2 lg:col-span-3 border-primary/30 bg-primary/5' : ''
            }`}
            onClick={() => onSelect(cat.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg transition-colors ${
                cat.id === 'mock-test'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
              }`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-sm">{cat.label}</h3>
                  {cat.badge && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {cat.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
