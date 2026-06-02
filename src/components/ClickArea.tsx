import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, AlertTriangle, Zap, Play } from 'lucide-react';
import { GameState } from '../types';

interface ClickAreaProps {
  state: GameState;
  lastResult: number | null;
  onStateChange: (newState: GameState) => void;
  onSuccess: (timeMs: number) => void;
  onEarlyClick: () => void;
}

export default function ClickArea({
  state,
  lastResult,
  onStateChange,
  onSuccess,
  onEarlyClick,
}: ClickAreaProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastStateChangeTimeRef = useRef<number>(0);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const changeState = (newState: GameState) => {
    onStateChange(newState);
    lastStateChangeTimeRef.current = Date.now();
  };

  const handleInteraction = (e: React.PointerEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default behaviour if it is pointer event
    if ('button' in e) {
      if (e.button !== 0) return; // Only primary clicks (left-click)
      e.preventDefault();
    } else if ('key' in e) {
      if (e.key !== ' ' && e.key !== 'Enter') return; // Only space or enter keys
      e.preventDefault();
    }

    const now = Date.now();
    const cooldownDuration = 450; // ms cooldown to prevent accidental rapid double clicks

    if (state === 'IDLE') {
      // Transition to WAITING (waiting blue phase) and start scheduled timer
      changeState('WAITING');

      // Random delay between 2000ms (2s) and 5000ms (5s)
      const randomDelay = Math.floor(Math.random() * 3000) + 2000;

      timerRef.current = setTimeout(() => {
        changeState('SIGNAL');
        startTimeRef.current = performance.now();
      }, randomDelay);

    } else if (state === 'WAITING') {
      // Too early! Clear scheduled timer and go to EARLY red phase
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onEarlyClick();
      lastStateChangeTimeRef.current = Date.now();

    } else if (state === 'SIGNAL') {
      // Correct click! Calculate elapsed high precision timing
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTimeRef.current);
      onSuccess(elapsed);
      lastStateChangeTimeRef.current = Date.now();

    } else if (state === 'EARLY' || state === 'SUCCESS') {
      // Prevent accidental fast click transition
      if (now - lastStateChangeTimeRef.current < cooldownDuration) {
        return;
      }
      // Go back to WAITING instantly to start another game round automatically!
      changeState('WAITING');

      const randomDelay = Math.floor(Math.random() * 3000) + 2000;
      timerRef.current = setTimeout(() => {
        changeState('SIGNAL');
        startTimeRef.current = performance.now();
      }, randomDelay);
    }
  };

  // Keyboard space/enter support for the click area to make focus accessible!
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Prevent browser scrolling on spacebar if game is active
        if (state !== 'IDLE') {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [state]);

  // CSS mappings based on states
  const getStyleAndContent = () => {
    switch (state) {
      case 'IDLE':
        return {
          textColor: 'text-slate-800',
          titleColor: 'text-blue-600',
          bgColor: 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/50',
          icon: <Play className="w-12 h-12 text-blue-500 animate-pulse mb-4" id="play-icon" />,
          title: '반응속도 테스트',
          desc: '이곳을 터치하거나 스페이스바를 눌러 테스트를 시작하세요.',
          badge: '준비 완료',
          badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'WAITING':
        return {
          textColor: 'text-white',
          titleColor: 'text-white',
          bgColor: 'bg-blue-600 border-blue-700 hover:bg-blue-700 active:bg-blue-800 shadow-inner',
          icon: <Zap className="w-12 h-12 text-blue-100 animate-bounce mb-4" id="waiting-icon" />,
          title: '초록색이 되면 클릭하세요!',
          desc: '대기 중입니다... 일찍 클릭하면 실패합니다.',
          badge: '대기 중 (파란색)',
          badgeStyle: 'bg-blue-500/20 text-blue-100 border-blue-500/30',
        };
      case 'SIGNAL':
        return {
          textColor: 'text-white',
          titleColor: 'text-white',
          bgColor: 'bg-emerald-500 border-emerald-600 hover:bg-emerald-600 active:bg-emerald-700 animate-none',
          icon: <Zap className="w-12 h-12 text-emerald-100 animate-ping mb-4" id="signal-icon" />,
          title: '지금 클릭하세요!!!',
          desc: '최대한 빠르게 화면을 터치하세요!',
          badge: '신호 발생 (초록색)',
          badgeStyle: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30',
        };
      case 'EARLY':
        return {
          textColor: 'text-white',
          titleColor: 'text-white',
          bgColor: 'bg-rose-500 border-rose-600 hover:bg-rose-600 active:bg-rose-700',
          icon: <AlertTriangle className="w-12 h-12 text-rose-100 animate-bounce mb-4" id="early-icon" />,
          title: '너무 일찍 클릭했습니다!',
          desc: '초록색 불이 켜지기 전에 클릭하셨습니다. 화면을 클릭하여 다시 시도해보세요.',
          badge: '부정 출발 (빨간색)',
          badgeStyle: 'bg-rose-400/20 text-rose-100 border-rose-400/30',
        };
      case 'SUCCESS':
        return {
          textColor: 'text-slate-800',
          titleColor: 'text-emerald-700',
          bgColor: 'bg-slate-900 border-slate-950 text-white',
          icon: <Sparkles className="w-12 h-12 text-amber-400 animate-spin-slow mb-4" id="success-icon" />,
          title: lastResult ? `${lastResult} ms` : '성공!',
          desc: '멋진 타이밍입니다! 화면을 클릭해 쉬지 않고 다음 측정을 시작하세요.',
          badge: '측정 성공',
          badgeStyle: 'bg-emerald-950 text-emerald-400 border-emerald-900',
        };
    }
  };

  const styleConfig = getStyleAndContent();

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handleInteraction}
      onKeyDown={handleInteraction}
      id="main-click-area"
      className={`w-full max-w-3xl h-80 md:h-96 rounded-2xl border flex flex-col items-center justify-center text-center p-8 select-none cursor-pointer transition-all duration-300 relative overflow-hidden outline-none ${styleConfig.bgColor}`}
    >
      {/* Decorative backdrop patterns */}
      {state === 'WAITING' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)] pointer-events-none" />
      )}
      {state === 'SIGNAL' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.4)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      )}
      {state === 'EARLY' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.3)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      )}

      {/* Top action badge */}
      <span
        id="click-area-badge"
        className={`absolute top-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-solid ${styleConfig.badgeStyle}`}
      >
        {styleConfig.badge}
      </span>

      {/* Main Core Elements */}
      <div className="flex flex-col items-center max-w-lg z-10" id="click-area-core-elements">
        {styleConfig.icon}
        <h1
          id="click-area-main-title"
          className={`text-3xl md:text-5xl font-extrabold font-display tracking-tight mb-3 ${
            state === 'SUCCESS' ? 'text-amber-400 text-5xl md:text-6xl font-mono' : styleConfig.titleColor
          }`}
        >
          {styleConfig.title}
        </h1>
        <p className={`text-sm md:text-base ${state === 'SUCCESS' ? 'text-slate-300' : 'text-slate-500'} font-medium max-w-sm md:max-w-md ${state === 'WAITING' || state === 'SIGNAL' || state === 'EARLY' ? 'text-white' : ''}`} id="click-area-main-desc">
          {styleConfig.desc}
        </p>
      </div>

      {/* Bottom helper tip */}
      <div className={`absolute bottom-4 text-xs font-mono tracking-wide opacity-60 z-10 ${state === 'SUCCESS' ? 'text-slate-400' : state === 'WAITING' || state === 'SIGNAL' || state === 'EARLY' ? 'text-white' : 'text-slate-500'}`} id="click-area-instruction-tip">
        {state === 'IDLE' ? '이메일, 터치패드, 마우스 모두 가능' : '화면 어디든 클릭하면 입력됩니다'}
      </div>
    </div>
  );
}
