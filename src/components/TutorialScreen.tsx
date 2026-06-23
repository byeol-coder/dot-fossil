import { useState, useEffect, useCallback } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, CharacterAction } from '../types';
import { ASSETS, CHARACTER_ACTION_ASSET } from '../assets';
import GameAssetImage from './GameAssetImage';

interface TutorialStep {
  title: string;
  character: CharacterAction;
  speaker: string;
  text: string;
}

const STEPS: TutorialStep[] = [
  {
    title: '탐험가 루미를 소개해요',
    character: 'found',
    speaker: '루미',
    text: '안녕! 나는 화석 발굴 탐험가 루미야.\n지금부터 DotPad로 함께 화석을 발굴해볼 거야!\n준비됐어?',
  },
  {
    title: 'DotPad 촉각 디스플레이',
    character: 'probe',
    speaker: '루미',
    text: '화면 가운데의 DotPad는 60×40 핀으로 된 촉각 디스플레이야.\n실제 장치를 연결하면 손으로 땅 속을 직접 느낄 수 있어!\n오른쪽 패널의 "연결" 버튼으로 블루투스 연결을 해봐.',
  },
  {
    title: '커서 이동',
    character: 'idle',
    speaker: '루미',
    text: '방향키 ← → ↑ ↓ 로 발굴 커서를 움직여.\nDotPad 실기기의 패닝(밀기)으로도 이동할 수 있어.\nShift + 방향키를 누르면 3칸씩 빠르게 이동해!',
  },
  {
    title: '발굴 도구 선택',
    character: 'brush',
    speaker: '루미',
    text: '숫자키 1 → 브러시 — 부드러운 흙을 조심스럽게 걷어내.\n숫자키 2 → 파기 — 단단한 흙을 제거해.\n숫자키 3 → 탐침 — 화석 위치를 미리 탐지해!\nSpacebar / Enter 로 선택한 도구를 사용해.',
  },
  {
    title: '발굴 목표',
    character: 'dig',
    speaker: '루미',
    text: '화석 주변 흙을 모두 걷어내면 발굴 성공!\n하지만 화석에 너무 강하게 닿으면 손상도가 올라가.\n손상 없이 완전히 발굴한 화석은 도감에 등록돼!',
  },
  {
    title: '출발!',
    character: 'found',
    speaker: '루미',
    text: '이제 첫 번째 발굴지 사막으로 출발!\n갈비뼈 화석을 찾아서 도감을 채워나가자.\n행운을 빌어!',
  },
];

interface TutorialScreenProps {
  dispatch: Dispatch<GameAction>;
}

export default function TutorialScreen({ dispatch }: TutorialScreenProps) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const current = STEPS[step];

  const goNext = useCallback(() => {
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'game' });
    }
  }, [step, total, dispatch]);

  const skip = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'game' });
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
      {/* Skip button — top right */}
      <button className="tutorial-skip-btn" onClick={skip} aria-label="튜토리얼 건너뛰기">
        건너뛰기
      </button>

      {/* Stone title banner — top center */}
      <div className="tutorial-title-banner" role="heading" aria-level={2}>
        {current.title}
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
      <div className="tutorial-name-plate" aria-label={`말하는 캐릭터: ${current.speaker}`}>
        {current.speaker}
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
        <button className="tutorial-next-btn" onClick={goNext} aria-label={isLast ? '게임 시작' : '다음'}>
          {isLast ? '시작!' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
