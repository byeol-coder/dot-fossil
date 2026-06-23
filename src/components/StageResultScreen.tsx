import { useCallback, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState, ResultAction } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import { getFossilPattern } from '../dotpad/fossilPatterns';
import { ko } from '../i18n/ko';
import GameAssetImage from './GameAssetImage';

const FOSSIL_IMG: Record<string, string> = {
  rib:             ASSETS.fossils.rib,
  shell:           ASSETS.fossils.ammonite,
  skull:           ASSETS.fossils.skull,
  leaf:            ASSETS.fossils.leaf,
  vertebra:        ASSETS.fossils.vertebra,
  claw:            ASSETS.fossils.claw,
  tooth:           ASSETS.fossils.tooth,
  fish:            ASSETS.fossils.fish,
  footprint:       ASSETS.fossils.footprint,
  ammonite:        ASSETS.fossils.ammonite,
  legfoot:         ASSETS.fossils.legfoot,
  partialSkeleton: ASSETS.fossils.partialSkeleton,
};

const RESULT_ACTIONS: { action: ResultAction; label: string }[] = [
  { action: 'next_fossil', label: ko.result.nextFossil },
  { action: 'collection',  label: ko.result.viewCollection },
  { action: 'retry',       label: ko.result.retry },
  { action: 'home',        label: ko.result.home },
];

function StarSVG({ filled }: { filled: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden="true">
      <polygon
        points="18,3 22.5,13.5 34,14.5 25.5,22.5 28,34 18,28 8,34 10.5,22.5 2,14.5 13.5,13.5"
        fill={filled ? '#f0c040' : 'rgba(200,180,120,0.3)'}
        stroke={filled ? '#b88010' : '#b8a060'}
        strokeWidth="1.5"
      />
      {filled && (
        <polygon
          points="18,6 21.5,14 30,14.8 23.8,20.5 25.8,29 18,24.5 10.2,29 12.2,20.5 6,14.8 14.5,14"
          fill="rgba(255,240,160,0.4)"
        />
      )}
    </svg>
  );
}

function CircleGaugeSVG({ pct, color }: { pct: number; color: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(200,180,120,0.25)" strokeWidth="7" />
      <circle
        cx="42" cy="42" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="47" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

interface StageResultScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  sendRawHex: (h: string) => void;
}

export default function StageResultScreen({ state, dispatch, sendRawHex }: StageResultScreenProps) {
  const stage     = STAGES[state.stageId] ?? STAGES['desert_rib'];
  const result    = state.result;
  const grade     = result?.grade ?? 'restore_needed';
  const completion = result?.completion ?? state.completion;
  const damage    = result?.damage ?? state.damage;
  const conservePct = Math.max(0, 100 - damage);
  const mainFossilId = stage.fossils[0]?.fossilId ?? '';
  const fossilImg = FOSSIL_IMG[mainFossilId] ?? '';

  const stars: 0 | 1 | 2 | 3 =
    grade === 'clean'          ? 3 :
    grade === 'good'           ? 2 :
    completion >= 50           ? 1 : 0;

  const gradeLabel =
    grade === 'clean'         ? ko.result.clean :
    grade === 'good'          ? ko.result.good :
                                ko.result.restoreNeeded;

  const selectedIdx = state.selectedResultActionIndex;

  // Show the fossil tactile pattern on DotPad when result screen opens
  useEffect(() => {
    const pattern = getFossilPattern(mainFossilId);
    if (pattern) sendRawHex(pattern);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard navigation for result action buttons
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'SELECT_RESULT_ACTION', index: (selectedIdx + 1) % RESULT_ACTIONS.length });
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'SELECT_RESULT_ACTION', index: (selectedIdx - 1 + RESULT_ACTIONS.length) % RESULT_ACTIONS.length });
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dispatch({ type: 'RESULT_ACTION', action: RESULT_ACTIONS[selectedIdx].action });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, selectedIdx]);

  const handleAction = useCallback((action: ResultAction) => {
    dispatch({ type: 'RESULT_ACTION', action });
  }, [dispatch]);

  return (
    <div
      className="gw-screen sr-screen"
      role="main"
      aria-label="발굴 결과"
      style={{
        backgroundImage: `url('${ASSETS.screens.excavationResult}'), url('${ASSETS.reference.gameplay}')`,
      }}
    >
      <div className="gw-frame" aria-hidden="true" />

      {/* Banner */}
      <div className="gw-banner" aria-hidden="true">
        <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
            <ellipse cx="26" cy="9" rx="8" ry="5.5" fill="#f0c040" />
            <ellipse cx="26" cy="8" rx="5.5" ry="3.5" fill="#f5d870" opacity="0.7" />
            <ellipse cx="26" cy="7" rx="2.5" ry="1.5" fill="#fff8c0" opacity="0.6" />
            <path d="M4 22 Q4 9 26 9 Q48 9 48 22" stroke="#9a7840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="4" cy="24" r="3.5" fill="#9a7840" />
            <circle cx="48" cy="24" r="3.5" fill="#9a7840" />
          </svg>
        </div>
        <div className="gw-banner-plate">{ko.result.title}</div>
      </div>

      {/* Left panel — fossil display */}
      <div className="sr-left-panel" aria-label="발굴된 화석">
        <div className="sr-fossil-frame">
          {fossilImg && (
            <GameAssetImage
              src={fossilImg}
              alt={mainFossilId}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
          {completion >= 90 && (
            <div className="sr-fossil-glow" aria-hidden="true" />
          )}
        </div>
        <div className="sr-fossil-name">{stage.name}</div>

        {/* Stars */}
        <div className="sr-stars" aria-label={`평가: ${gradeLabel}`}>
          {[1, 2, 3].map(n => <StarSVG key={n} filled={stars >= n} />)}
        </div>
        <div className="sr-rating-label">{gradeLabel}</div>

        <div className="sr-pieces-row">
          {Array.from({ length: state.totalPieces }).map((_, i) => (
            <div
              key={i}
              className={`sr-piece-dot${i < state.foundPieces ? ' found' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="sr-pieces-label">{state.foundPieces}/{state.totalPieces} 조각 발굴</div>
      </div>

      {/* Right panel — stats + actions */}
      <div className="sr-right-panel" role="region" aria-label="발굴 통계 및 다음 행동">
        <div className="sr-stage-name" aria-label={`스테이지: ${stage.nameEn ?? stage.name}`}>
          {stage.nameEn ?? stage.name}
        </div>

        {/* Progress bars */}
        <div className="sr-stat">
          <span className="sr-stat-label">{ko.result.completion}</span>
          <div className="sr-stat-bar">
            <div className="sr-bar-fill completion" style={{ width: `${completion}%` }} />
          </div>
          <span className="sr-stat-val">{completion}%</span>
        </div>
        <div className="sr-stat">
          <span className="sr-stat-label">화석 보존율</span>
          <div className="sr-stat-bar">
            <div className="sr-bar-fill conserve" style={{ width: `${conservePct}%` }} />
          </div>
          <span className="sr-stat-val">{conservePct}%</span>
        </div>

        {/* Circle gauges */}
        <div className="sr-gauges-row" aria-hidden="true">
          <div className="sr-gauge">
            <CircleGaugeSVG pct={completion} color="#5ab040" />
            <span>발굴</span>
          </div>
          <div className="sr-gauge">
            <CircleGaugeSVG pct={conservePct} color="#40a0d0" />
            <span>보존</span>
          </div>
        </div>

        {/* 4 result action buttons */}
        <div
          className="sr-btns"
          role="group"
          aria-label="다음 행동 선택 (좌우 방향키로 이동, Enter로 실행)"
        >
          {RESULT_ACTIONS.map(({ action, label }, i) => (
            <button
              key={action}
              className={`${i === 0 ? 'gw-oval-btn' : 'gw-stone-btn'} ${selectedIdx === i ? ' active' : ''}`}
              onClick={() => handleAction(action)}
              aria-label={label}
              aria-current={selectedIdx === i ? 'true' : undefined}
              style={selectedIdx === i ? { outline: '2px solid #f0c040', outlineOffset: 2 } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <p className="sr-key-hint" aria-hidden="true">
          ← → 방향키로 선택 · Enter로 실행
        </p>
      </div>
    </div>
  );
}
