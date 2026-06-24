import { useCallback, useEffect, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import { FOSSIL_IMG } from '../data/fossilImages';
import GameAssetImage from './GameAssetImage';
import { useTranslation } from '../i18n';

interface FossilSelectScreenProps {
  dispatch: Dispatch<GameAction>;
}

export default function FossilSelectScreen({ dispatch }: FossilSelectScreenProps) {
  const { t } = useTranslation();
  const stages = Object.values(STAGES);
  const [activeIdx, setActiveIdx] = useState(0);

  const selectStage = useCallback((stageId: string) => {
    dispatch({ type: 'SELECT_STAGE', stageId });
  }, [dispatch]);

  // Keyboard + DotPad panning: ←/→ move the highlighted dig site, Enter/Space選택.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(stages.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectStage(stages[activeIdx]?.id ?? stages[0]?.id ?? 'desert_rib');
      } else if (e.key === 'Escape') {
        dispatch({ type: 'SET_SCREEN', screen: 'title' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectStage, dispatch, stages, activeIdx]);

  return (
    <div
      className="gw-screen fs-screen"
      role="main"
      aria-label="화석 선택"
      style={{
        backgroundImage: `url('${ASSETS.screens.fossilSelect}'), url('${ASSETS.reference.intro}')`,
      }}
    >
      <div className="gw-frame" aria-hidden="true" />

      {/* Banner */}
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
        <div className="gw-banner-plate">{t('fossilSelect.sectionTitle')}</div>
      </div>

      {/* Character */}
      <div className="gw-char-corner" aria-hidden="true">
        <GameAssetImage
          src={ASSETS.character.idle}
          alt=""
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

      {/* Speech bubble */}
      <div className="gw-col-bubble fs-bubble" role="status" aria-live="polite">
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
          {t('fossilSelect.bubbleText')}
        </p>
      </div>

      {/* Stage cards */}
      <div className="fs-cards" role="list" aria-label="발굴지 목록">
        {stages.map((stage, i) => {
          const firstFossilImg = stage.fossils[0]
            ? FOSSIL_IMG[stage.fossils[0].fossilId] ?? ''
            : '';
          return (
            <div
              key={stage.id}
              className={`fs-card${i === activeIdx ? ' active' : ''}`}
              role="listitem"
              onClick={() => { setActiveIdx(i); selectStage(stage.id); }}
              onMouseEnter={() => setActiveIdx(i)}
              aria-label={`${stage.name} — 목표: ${stage.target}`}
              aria-current={i === activeIdx ? 'true' : undefined}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectStage(stage.id); }}
            >
              <div className="fs-card-img-wrap">
                {firstFossilImg && (
                  <GameAssetImage
                    src={firstFossilImg}
                    alt={stage.fossils[0]?.fossilId ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div className="fs-card-name">{stage.name}</div>
              <div className="fs-card-target">{stage.target}</div>
              <div className="fs-card-pieces">{stage.totalPieces}{t('fossilSelect.piecesUnit')}</div>
              <button
                className="gw-oval-btn fs-start-btn"
                onClick={e => { e.stopPropagation(); selectStage(stage.id); }}
                aria-label={`${stage.name} ${t('fossilSelect.startBtn')}`}
              >
                {t('fossilSelect.startBtn')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <nav className="gw-col-nav" aria-label="화면 이동">
        <button
          className="gw-stone-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
          aria-label="타이틀로 돌아가기"
        >
          {t('common.back')}
        </button>
      </nav>
    </div>
  );
}
