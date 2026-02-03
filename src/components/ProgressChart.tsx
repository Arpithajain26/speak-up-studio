import { DailyProgress } from '@/types/fluency';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ProgressChartProps {
  data: DailyProgress[];
}

export const ProgressChart = ({ data }: ProgressChartProps) => {
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Time') ? 'm' : entry.name === 'Sessions' ? '' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 shadow-card">
      <h3 className="text-lg font-display font-semibold mb-4">Weekly Progress</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fluencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grammarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              hide 
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="averageFluency"
              name="Fluency"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#fluencyGradient)"
            />
            <Area
              type="monotone"
              dataKey="averageGrammar"
              name="Grammar"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#grammarGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Fluency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Grammar</span>
        </div>
      </div>
    </Card>
  );
};
