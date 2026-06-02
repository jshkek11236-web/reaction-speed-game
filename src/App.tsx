/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, RotateCcw, Info, BarChart3, HelpCircle } from 'lucide-react';
import { GameState, Attempt } from './types';
import ClickArea from './components/ClickArea';
import StatsGrid from './components/StatsGrid';
import HistoryList from './components/HistoryList';

const LOCAL_STORAGE_KEY = 'reaction_test_attempts_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [lastResult, setLastResult] = useState<number | null>(null);
  
  // State for storing the list of successful reaction attempts
  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse reaction test attempts from localStorage', e);
          return [];
        }
      }
    }
    return [];
  });

  // Keep localStorage perfectly in sync
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attempts));
  }, [attempts]);

  // Handle successful reaction click
  const handleSuccess = (timeMs: number) => {
    const newAttempt: Attempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timeMs,
      timestamp: Date.now(),
    };
    
    setAttempts((prev) => [...prev, newAttempt]);
    setLastResult(timeMs);
    setGameState('SUCCESS');
  };

  // Handle too early clicking
  const handleEarlyClick = () => {
    setGameState('EARLY');
  };

  // Clear all data and reset back to Lobby (IDLE)
  const handleReset = () => {
    if (window.confirm('모든 반응속도 기록과 통계를 초기화하시겠습니까?')) {
      setAttempts([]);
      setLastResult(null);
      setGameState('IDLE');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-6 md:py-12 px-4 flex flex-col justify-between" id="app-root-container">
      {/* Centered minimalist core content wrapper */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto flex flex-col gap-6 md:gap-8 items-center"
        id="app-main-content-layout"
      >
        {/* Simple & Minimalist Header */}
        <header className="w-full text-center flex flex-col items-center border-b border-slate-100 pb-5" id="app-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold mb-3" id="header-badge-wrap">
            <Zap className="w-3.5 h-3.5 fill-blue-600/30" />
            <span>Reflex Speed Test</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans" id="app-main-title">
            반응속도 테스트
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-md font-sans" id="app-main-subtitle">
            빨간 신호에서 대기 후 초록 실시간 불빛이 켜지는 순간 클릭해 보세요. 당신의 한계 속도는 몇 ms 인가요?
          </p>
        </header>

        {/* Reaction click stage - Main Center Area */}
        <section className="w-full flex justify-center" id="reaction-timer-section">
          <ClickArea
            state={gameState}
            lastResult={lastResult}
            onStateChange={setGameState}
            onSuccess={handleSuccess}
            onEarlyClick={handleEarlyClick}
          />
        </section>

        {/* Informative quick hint dynamic section */}
        {gameState === 'IDLE' && (
          <section className="w-full bg-slate-100/60 border border-slate-200/60 rounded-xl p-4 flex gap-3 text-slate-600 text-sm align-start" id="how-to-play-tips">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" id="info-icon" />
            <div id="tips-text-container">
              <span className="font-semibold text-slate-800">측정 가이드: </span>
              <span>
                화면의 큰 대기 카드를 터치/클릭하면 상태가 시작됩니다. 
                그 상태에서 대기(파란색)하다가, 초록색 화면으로 변경되자마자 가장 민첩하고 기만하게 마우스 클릭 또는 화면 터치를 진행해 주십시오! 
                스페이스바(Space)나 엔터(Enter) 키로도 입력을 감지합니다.
              </span>
            </div>
          </section>
        )}

        {/* Mathematics and Metric Display Cards (Flat UI) */}
        <section className="w-full" id="stats-grid-section">
          <StatsGrid 
            attempts={attempts} 
            lastResult={lastResult} 
          />
        </section>

        {/* Recent attempts list with localized deletion control */}
        <section className="w-full" id="history-section">
          <HistoryList 
            attempts={attempts} 
            onReset={handleReset} 
          />
        </section>
      </motion.main>

      {/* Humble Footer */}
      <footer className="w-full max-w-3xl mx-auto mt-12 pt-6 border-t border-slate-200/60 text-center text-xs text-slate-400 font-mono flex flex-col gap-1 items-center" id="app-footer">
        <div className="flex items-center gap-1" id="footer-logo">
          <Zap className="w-3 h-3 text-slate-400" />
          <span>반응속도 테스트</span>
        </div>
        <p className="font-sans" id="footer-legal">
          본 게임은 순수 클라이언트 기반 애플리케이션으로, 수집된 결과 및 모든 기록은 개인정보 침해 없이 기기의 개인 안전 브라우저 저장소(Local Storage)에 안전하게 소장됩니다.
        </p>
      </footer>
    </div>
  );
}
