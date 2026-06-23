import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, CharacterAction } from '../types';
import { ASSETS, CHARACTER_ACTION_ASSET } from '../assets';
import GameAssetImage from './GameAssetImage';
import { useTranslation } from '../i18n';

interface TutorialStep {
  title: string;
  character: CharacterAction;
  text: string;
}

const STEP_CHARACTERS: CharacterAction[] = [
  'found',
  'idle',
  'probe',
  'idle',
  'brush',
  'warning',
];

interface TutorialScreenProps {
  dispatch: Dispatch<GameAction>;
}

export default function TutorialScreen({ dispatch }: TutorialScreenProps) {
  const { t, tArr } = useTranslation();
  const [step, setStep] = useState(0);

  const STEPS: TutorialStep[] = useMemo(() => {
    const titles = tArr('tutorial.stepTitles');
    const dialogues = tArr('tutorial.dialogues');
    return dialogues.map((text, i) => ({
      title: titles[i] ?? t('tutorial.title'),
      character: STEP_CHARACTERS[i] ?? 'idle',
      text,
    }));
  }, [t, tArr]);

  const total = STEPS.length;
  const current = STEPS[Math.min(step, total - 1)];
  const charName = t('tutorial.charName');

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
      aria-label={t('tutorial.title')}
    >
      {/* Wooden border frame */}
      <div className="gw-frame" aria-hidden="true" />

      {/* Skip button — top right */}
      <button className="tutorial-skip-btn" onClick={skip} aria-label={t('tutorial.skipBtn')}>
        {t('tutorial.skipBtn')}
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
        <div className="gw-banner-plate" role="heading" aria-level={2}>{current?.title}</div>
      </div>

      {/* Character — left */}
      <div className="tutorial-character-wrap" aria-hidden="true">
        <GameAssetImage
          src={CHARACTER_ACTION_ASSET[current?.character ?? 'idle']}
          alt=""
          className="tutorial-character-img"
        />
      </div>

      {/* Speech bubble — center-right */}
      <div
        className="tutorial-bubble"
        role="region"
        aria-label={t('tutorial.title')}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="tutorial-bubble-text">{current?.text}</p>
      </div>

      {/* Character name plate — bottom left */}
      <div className="tutorial-name-plate" aria-label={charName}>
        {charName}
      </div>

      {/* Step dots + nav — bottom right */}
      <div className="tutorial-nav">
        <div className="tutorial-step-dots" aria-label={`${step + 1} / ${total}`}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tutorial-step-dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`${i + 1}`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>
        {step > 0 && (
          <button className="tutorial-prev-btn" onClick={() => setStep(s => s - 1)} aria-label={t('common.back')}>
            ←
          </button>
        )}
        <button className="gw-oval-btn" onClick={goNext} aria-label={isLast ? t('tutorial.startBtn') : t('common.next')}
                style={{ padding: '11px 40px', fontSize: '1rem' }}>
          {isLast ? t('tutorial.startBtn') : t('common.next')}
        </button>
      </div>
    </div>
  );
}
