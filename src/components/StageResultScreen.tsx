import { useCallback, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import { getFossilPattern } from '../dotpad/fossilPatterns';
import GameAssetImage from './GameAssetImage';

const FOSSIL_IMG: Record<string, string> = {
  rib:     ASSETS.fossils.rib,
  shell:   ASSETS.fossils.ammonite,
  skull:   ASSETS.fossils.skull,
  leaf:    ASSETS.fossils.leaf,
  vertebra: ASSETS.fossils.vertebra,
  claw:    ASSETS.fossils.claw,
  tooth:   ASSETS.fossils.tooth,
  fish:    ASSETS.fossils.fish,
  footprint: ASSETS.fossils.footprint,
  ammonite: ASSETS.fossils.ammonite,
  legfoot: ASSETS.fossils.legfoot,
  partialSkeleton: ASSETS.fossils.partialSkeleton,
};

function starRating(completion: number, damage: number): 0 | 1 | 2 | 3 {
  if (completion < 100) return 0;
  if (damage === 0) return 3;
  if (damage < 30) return 2;
  return 1;
}

function StarSVG({ filled }: { filled: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
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
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(200,180,120,0.25)" strokeWidth="8" />
      <circle
        cx="45" cy="45" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="50" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

interface StageResultScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  sendRawHex: (h: string) => void;
}

export default function StageResultScreen({ state, dispatch, sendRawHex }: StageResultScreenProps) {
  const stage = STAGES[state.stageId] ?? STAGES['desert_rib'];
  const stars = starRating(state.completion, state.damage);
  const conservePct = Math.max(0, 100 - state.damage);
  const mainFossilId = stage.fossils[0]?.fossilId ?? '';
  const fossilImg = FOSSIL_IMG[mainFossilId] ?? '';

  // Show the completed fossil's tactile pattern on DotPad when result screen opens
  useEffect(() => {
    const pattern = getFossilPattern(mainFossilId);
    if (pattern) sendRawHex(pattern);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goCollection = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'collection' });
  }, [dispatch]);

  const goTitle = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'title' });
  }, [dispatch]);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART_STAGE' });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goCollection(); }
      if (e.key === 'Escape') goTitle();
      if (e.key === 'r' || e.key === 'R') restart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goCollection, goTitle, restart]);

  const ratingLabel = ['미완성', '동메달', '은메달', '금메달'][stars];
  const ratingMsg =
    stars === 3 ? '완벽한 발굴! 화석이 손상 없이 발굴됐어요!' :
    stars === 2 ? '훌륭해요! 조금 더 조심스럽게 발굴해봐요.' :
    stars === 1 ? '발굴 완료! 다음엔 더 조심히 파봐요.' :
    '발굴이 완료되지 않았어요. 다시 도전해봐요!';

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
        <div className="gw-banner-plate">발굴 결과</div>
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
          {state.completion === 100 && (
            <div className="sr-fossil-glow" aria-hidden="true" />
          )}
        </div>
        <div className="sr-fossil-name">{stage.name}</div>
        <div className="sr-pieces-row">
          {Array.from({ length: state.totalPieces }).map((_, i) => (
            <div key={i} className={`sr-piece-dot${i < state.foundPieces ? ' found' : ''}`} aria-hidden="true" />
          ))}
        </div>
        <div className="sr-pieces-label">{state.foundPieces}/{state.totalPieces} 조각 발굴</div>
      </div>

      {/* Right panel — stats + medal */}
      <div className="sr-right-panel" role="region" aria-label="발굴 통계">
        <div className="sr-stage-name" aria-label={`스테이지: ${stage.nameEn}`}>{stage.nameEn}</div>

        {/* Progress bars */}
        <div className="sr-stat">
          <span className="sr-stat-label">발굴 완료</span>
          <div className="sr-stat-bar">
            <div className="sr-bar-fill completion" style={{ width: `${state.completion}%` }} />
          </div>
          <span className="sr-stat-val">{state.completion}%</span>
        </div>
        <div className="sr-stat">
          <span className="sr-stat-label">화석 보존율</span>
          <div className="sr-stat-bar">
            <div className="sr-bar-fill conserve" style={{ width: `${conservePct}%` }} />
          </div>
          <span className="sr-stat-val">{conservePct}%</span>
        </div>

        {/* Circle gauges row */}
        <div className="sr-gauges-row" aria-hidden="true">
          <div className="sr-gauge">
            <CircleGaugeSVG pct={state.completion} color="#5ab040" />
            <span>발굴</span>
          </div>
          <div className="sr-gauge">
            <CircleGaugeSVG pct={conservePct} color="#40a0d0" />
            <span>보존</span>
          </div>
        </div>

        {/* Stars */}
        <div className="sr-stars" aria-label={`평가: ${ratingLabel}`}>
          {[1, 2, 3].map(n => <StarSVG key={n} filled={stars >= n} />)}
        </div>
        <div className="sr-rating-label">{ratingLabel}</div>
        <p className="sr-rating-msg">{ratingMsg}</p>

        {/* Buttons */}
        <div className="sr-btns">
          <button className="gw-oval-btn" onClick={goCollection} aria-label="도감 보기 (Enter)">
            도감 보기
          </button>
          <button className="gw-stone-btn" onClick={restart} aria-label="다시 발굴 (R)">
            다시 발굴
          </button>
          <button className="gw-stone-btn" onClick={goTitle} aria-label="메인 메뉴 (Esc)">
            ← 메뉴
          </button>
        </div>
      </div>
    </div>
  );
}
