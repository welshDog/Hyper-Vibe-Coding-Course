import { LucideIcon } from 'lucide-react';

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: LucideIcon;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const typeColors: Record<string, string> = {
  resource: 'text-blue-400 bg-blue-400/20',
  pr: 'text-purple-400 bg-purple-400/20',
  user: 'text-green-400 bg-green-400/20',
  test: 'text-emerald-400 bg-emerald-400/20',
  issue: 'text-orange-400 bg-orange-400/20',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const colorClass = typeColors[activity.type] || 'text-slate-400 bg-slate-400/20';
        
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.message}</p>
              <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}