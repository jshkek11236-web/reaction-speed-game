import { Timer, Trophy, Activity, Hash } from 'lucide-react';
import { Attempt } from '../types';

interface StatsGridProps {
  attempts: Attempt[];
  lastResult: number | null;
}

export default function StatsGrid({ attempts, lastResult }: StatsGridProps) {
  // Compute High Score (best reaction time)
  const bestScore = attempts.length > 0 
    ? Math.min(...attempts.map(a => a.timeMs)) 
    : null;

  // Compute Average Score
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.timeMs, 0) / attempts.length)
    : null;

  const tryCount = attempts.length;

  const stats = [
    {
      id: 'last-result',
      label: '최근 반응속도',
      value: lastResult !== null ? `${lastResult} ms` : '-',
      description: '마지막 성공 속도',
      icon: Timer,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-100',
    },
    {
      id: 'best-score',
      label: '최고 기록 (Best)',
      value: bestScore !== null ? `${bestScore} ms` : '-',
      description: '가장 마른 클릭 반응',
      icon: Trophy,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
    },
    {
      id: 'average-score',
      label: '평균 반응속도',
      value: averageScore !== null ? `${averageScore} ms` : '-',
      description: '전체 성공 평균',
      icon: Activity,
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-100',
    },
    {
      id: 'try-count',
      label: '성공 횟수',
      value: `${tryCount} 회`,
      description: '총 성공한 시도 수',
      icon: Hash,
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50/50',
      borderColor: 'border-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full" id="stats-grid-container">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-3" id={`stat-header-${stat.id}`}>
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.textColor} border ${stat.borderColor}`} id={`stat-icon-wrapper-${stat.id}`}>
                <IconComponent className="w-5 h-5 animate-pulse" id={`stat-icon-${stat.id}`} />
              </div>
            </div>
            
            <div id={`stat-value-container-${stat.id}`}>
              <div className="text-3xl font-bold font-display tracking-tight text-slate-900" id={`stat-value-${stat.id}`}>
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 mt-1" id={`stat-description-${stat.id}`}>
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
