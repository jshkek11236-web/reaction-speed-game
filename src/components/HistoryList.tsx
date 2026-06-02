import { Calendar, Trash2, Zap } from 'lucide-react';
import { Attempt } from '../types';

interface HistoryListProps {
  attempts: Attempt[];
  onReset: () => void;
}

export default function HistoryList({ attempts, onReset }: HistoryListProps) {
  // Format local timestamp nicely
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Find the best speed to highlight it
  const bestSpeed = attempts.length > 0 
    ? Math.min(...attempts.map(a => a.timeMs)) 
    : null;

  // Let's sort attempts in descending order (latest first)
  const sortedAttempts = [...attempts].reverse();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 w-full" id="history-card-wrapper">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4" id="history-header">
        <div className="flex items-center gap-2" id="history-title-group">
          <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-900 font-sans">최근 시도 기록</h2>
          <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium" id="history-badge">
            {attempts.length}개 기록됨
          </span>
        </div>
        
        {attempts.length > 0 && (
          <button
            onClick={onReset}
            id="reset-history-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-500 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-rose-500 font-sans"
          >
            <Trash2 className="w-3.5 h-3.5" />
            기록 초기화
          </button>
        )}
      </div>

      {sortedAttempts.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center px-4" id="history-empty-state">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-full mb-4 text-slate-400" id="history-empty-icon">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">기록이 없습니다</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            상단의 반응속도 테스트 영역을 클릭하여 첫 기록을 남겨보세요!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-100" id="history-list-list">
          <table className="w-full text-left border-collapse" id="history-table">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                <th className="py-3 px-4">순서</th>
                <th className="py-3 px-4">반응속도</th>
                <th className="py-3 px-4">기록 시간</th>
                <th className="py-3 px-4 text-right">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedAttempts.slice(0, 15).map((attempt, idx) => {
                const originalIndex = attempts.indexOf(attempt) + 1;
                const isBest = attempt.timeMs === bestSpeed;

                return (
                  <tr 
                    key={attempt.id} 
                    id={`history-row-${attempt.id}`}
                    className="hover:bg-slate-55/40 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                      #{originalIndex}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      {attempt.timeMs} <span className="text-xs text-slate-400 font-normal">ms</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                      {formatTime(attempt.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isBest ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-bounce">
                          ★ 최고기록
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
                          완료
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAttempts.length > 15 && (
            <div className="bg-slate-50/50 py-2.5 text-center text-xs text-slate-400 border-t border-slate-100" id="history-limit-msg">
              최근 15개의 기록만 표시 중입니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
