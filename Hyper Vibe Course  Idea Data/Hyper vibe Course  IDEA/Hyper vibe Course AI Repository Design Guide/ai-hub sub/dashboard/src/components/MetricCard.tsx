import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
};

export function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const isPositive = change.startsWith('+') || change.startsWith('-');
  const changeColor = change.startsWith('+') ? 'text-green-400' : 
                      change.startsWith('-') && !change.includes('%') ? 'text-green-400' : 
                      'text-red-400';

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <p className={`text-sm mt-1 ${changeColor}`}>
              {change} from last month
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}