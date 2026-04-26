import { useMemo } from 'react';

interface ResourceStats {
  frameworks: number;
  models: number;
  datasets: number;
  tutorials: number;
  benchmarks: number;
}

interface ResourceChartProps {
  data: ResourceStats;
}

export function ResourceChart({ data }: ResourceChartProps) {
  const total = useMemo(() => 
    data.frameworks + data.models + data.datasets + data.tutorials + data.benchmarks,
    [data]
  );

  const items = [
    { label: 'Frameworks', value: data.frameworks, color: '#3b82f6' },
    { label: 'Models', value: data.models, color: '#a855f7' },
    { label: 'Datasets', value: data.datasets, color: '#22c55e' },
    { label: 'Tutorials', value: data.tutorials, color: '#f97316' },
    { label: 'Benchmarks', value: data.benchmarks, color: '#ec4899' },
  ];

  // Calculate SVG pie chart segments
  let currentAngle = 0;
  const segments = items.map(item => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    // Convert to radians
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (startAngle + angle - 90) * Math.PI / 180;
    
    // Calculate path
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    return {
      ...item,
      path,
      percentage: (percentage * 100).toFixed(1)
    };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Pie Chart */}
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((segment, idx) => (
            <path
              key={idx}
              d={segment.path}
              fill={segment.color}
              stroke="rgba(30, 41, 59, 0.8)"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
          {/* Center circle */}
          <circle cx="100" cy="100" r="40" fill="rgba(30, 41, 59, 0.9)" />
          <text x="100" y="95" textAnchor="middle" className="fill-slate-400 text-xs">
            Total
          </text>
          <text x="100" y="115" textAnchor="middle" className="fill-white text-lg font-bold">
            {total.toLocaleString()}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {segments.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-12 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}