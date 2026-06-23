import { useState, useEffect, useCallback } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, CharacterAction } from '../types';
import { ASSETS, CHARACTER_ACTION_ASSET } from '../assets';
import { ko } from '../i18n/ko';
import GameAssetImage from './GameAssetImage';

interface TutorialStep {
  title: string;
  character: CharacterAction;
  text: string;
}

const CHAR_NAME = '도티';

const STEP_TITLES = [
  `탐험가 ${CHAR_NAME}를 소개해요`,
  '촉각으로 발굴해요',
  'DotPad 촉각 디스플레이',
  '지형 읽기',
  '화석 단서 찾기',
  '안전 발굴',
];

const STEP_CHARACTERS: CharacterAction[] = [
  'found',
  'idle',
  'probe',
  'idle',
  'brush',
  'warning',
];

const STEPS: TutorialStep[] = ko.tutorial.dialogues.map((text, i) => ({
  title: STEP_TITLES[i] ?? ko.tutorial.title,
  character: STEP_CHARACTERS[i] ?? 'idle',
  text,
}));

interface TutorialScreenProps {
  dispatch: Dispatch<GameAction>;
}

export default function TutorialScreen({ dispatch }: TutorialScreenProps) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const current = STEPS[Math.min(step, total - 1)];

  const goNext = useCallback(() => {
    if (step < total - 1) {
      setStep(s => Math.min(s + 1, total - 1));
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'fossil-select' });
    }
  }, [step, total, dispatch]);

  const skip = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'fossil-select' });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'Escape') skip();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, skip, step]);

  const isLast = step === total - 1;

  return (
    <div
      className="tutorial-screen"
      style={{ backgroundImage: `url('${ASSETS.reference.tutorial}')` }}
      role="main"
      aria-label="튜토리얼"
    >
      {/* Wooden border frame */}
      <div className="gw-frame" aria-hidden="true" />

      {/* Skip button — top right */}
      <button className="tutorial-skip-btn" onClick={skip} aria-label="튜토리얼 건너뛰기">
        건너뛰기
      </button>

      {/* Stone ammonite banner — top center */}
      <div className="gw-banner" aria-hidden="true">
        <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
            <ellipse cx="26" cy="9" rx="8" ry="5.5" fill="#5a90d0" />
            <ellipse cx="26" cy="8" rx="5.5" ry="3.5" fill="#7ab0ee" opacity="0.7" />
            <ellipse cx="26" cy="7" rx="2.5" ry="1.5" fill="#a8d0ff" opacity="0.6" />
            <path d="M4 22 Q4 9 26 9 Q48 9 48 22" stroke="#9a7840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="4" cy="24" r="3.5" fill="#9a7840" />
            <circle cx="48" cy="24" r="3.5" fill="#9a7840" />
          </svg>
        </div>
        <div className="gw-banner-plate" role="heading" aria-level={2}>{current.title}</div>
      </div>

      {/* Character — left */}
      <div className="tutorial-character-wrap" aria-hidden="true">
        <GameAssetImage
          src={CHARACTER_ACTION_ASSET[current.character]}
          alt=""
          className="tutorial-character-img"
        />
      </div>

      {/* Speech bubble — center-right */}
      <div
        className="tutorial-bubble"
        role="region"
        aria-label="튜토리얼 내용"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="tutorial-bubble-text">{current.text}</p>
      </div>

      {/* Character name plate — bottom left */}
      <div className="tutorial-name-plate" aria-label={`말하는 캐릭터: ${CHAR_NAME}`}>
        {CHAR_NAME}
      </div>

      {/* Step dots + nav — bottom right */}
      <div className="tutorial-nav">
        <div className="tutorial-step-dots" aria-label={`${step + 1} / ${total} 단계`}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tutorial-step-dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`${i + 1}번 단계`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>
        {step > 0 && (
          <button className="tutorial-prev-btn" onClick={() => setStep(s => s - 1)} aria-label="이전">
            ←
          </button>
        )}
        <button className="gw-oval-btn" onClick={goNext} aria-label={isLast ? '게임 시작' : '다음'}
                style={{ padding: '11px 40px', fontSize: '1rem' }}>
          {isLast ? '시작!' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
