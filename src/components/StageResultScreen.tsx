import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState, ResultAction } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import { getFossilPattern } from '../dotpad/fossilPatterns';
import { FOSSIL_IMG } from '../data/fossilImages';
import GameAssetImage from './GameAssetImage';
import { useTranslation } from '../i18n';

// ─── Image-sync positioning (excavation-result-screen-bg.png, 1672×941) ──────
const SR_IMG_W = 1672;
const SR_IMG_H = 941;

// Baked-in element centres in source-image pixels
const SR_IMG = {
  fossil:        { cx: 571,  cy: 360, w: 430, h: 360 }, // left parchment (fossil skeleton)
  name:          { cx: 496,  cy: 765, w: 300 },          // bottom-left nameplate
  medal:         { cx: 811,  cy: 678, w: 240 },          // centre gold ribbon medal
  stageName:     { cx: 1193, cy: 198, w: 430 },          // right-top plate
  completionBar: { cx: 1190, cy: 343, w: 450 },          // right green bar
  gauge:         { cx: 1067, cy: 491, w: 175, h: 165 },  // circular gauge ring
  statsPanel:    { cx: 1313, cy: 494, w: 215, h: 165 },  // right cream stats panel
  btns: {
    next_fossil: { cx: 1079, cy: 773, w: 210, h: 56 },   // bottom-left green bar
    retry:       { cx: 1313, cy: 773, w: 215, h: 56 },   // bottom-right green bar
    collection:  { cx: 437,  cy: 765, w: 135, h: 50 },   // nameplate left half
    home:        { cx: 558,  cy: 765, w: 120, h: 50 },   // nameplate right half
  } as Record<ResultAction, { cx: number; cy: number; w: number; h: number }>,
} as const;

function srComputeTransform() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / SR_IMG_W, vh / SR_IMG_H);
  return { scale, ox: (SR_IMG_W * scale - vw) / 2, oy: (SR_IMG_H * scale - vh) / 2 };
}

function useSrTransform() {
  const [tf, setTf] = useState(srComputeTransform);
  useEffect(() => {
    const upd = () => setTf(srComputeTransform());
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
  return tf;
}

type SrTf = ReturnType<typeof srComputeTransform>;

function srBox(cx: number, cy: number, w: number, h: number | undefined, tf: SrTf, extra?: CSSProperties): CSSProperties {
  return {
    position: 'absolute',
    left: cx * tf.scale - tf.ox,
    top:  cy * tf.scale - tf.oy,
    width: w * tf.scale,
    ...(h != null ? { height: h * tf.scale } : {}),
    transform: 'translate(-50%, -50%)',
    ...extra,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const { t } = useTranslation();
  const tf        = useSrTransform();
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
    grade === 'clean'         ? t('result.clean') :
    grade === 'good'          ? t('result.good') :
                                t('result.restoreNeeded');

  const RESULT_ACTIONS: { action: ResultAction; label: string }[] = [
    { action: 'next_fossil', label: t('result.nextFossil') },
    { action: 'collection',  label: t('result.viewCollection') },
    { action: 'retry',       label: t('result.retry') },
    { action: 'home',        label: t('result.home') },
  ];

  const selectedIdx = state.selectedResultActionIndex;

  useEffect(() => {
    const pattern = getFossilPattern(mainFossilId);
    if (pattern) sendRawHex(pattern);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the latest selected index in a ref so the (stable) key handler always
  // activates the currently-highlighted action — no stale closure on rapid input.
  const selectedIdxRef = useRef(selectedIdx);
  selectedIdxRef.current = selectedIdx;
  const actionsRef = useRef(RESULT_ACTIONS);
  actionsRef.current = RESULT_ACTIONS;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'SELECT_RESULT_ACTION_DELTA', delta: 1 });
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'SELECT_RESULT_ACTION_DELTA', delta: -1 });
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dispatch({ type: 'RESULT_ACTION', action: actionsRef.current[selectedIdxRef.current].action });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  const handleAction = useCallback((action: ResultAction) => {
    dispatch({ type: 'RESULT_ACTION', action });
  }, [dispatch]);

  return (
    <div
      className="gw-screen sr-screen"
      role="main"
      aria-label={t('result.title')}
      style={{
        backgroundImage: `url('${ASSETS.screens.excavationResult}'), url('${ASSETS.reference.gameplay}')`,
      }}
    >
      <div className="gw-frame" aria-hidden="true" />

      {/* ── Fossil display — synced to left parchment ── */}
      <div className="sr-fossil-frame" aria-label={stage.name}
        style={srBox(SR_IMG.fossil.cx, SR_IMG.fossil.cy, SR_IMG.fossil.w, SR_IMG.fossil.h, tf)}
      >
        {fossilImg && (
          <GameAssetImage
            src={fossilImg}
            alt={mainFossilId}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        {completion >= 90 && <div className="sr-fossil-glow" aria-hidden="true" />}
      </div>

      {/* ── Stars + grade — synced to centre medal ── */}
      <div className="sr-medal" style={srBox(SR_IMG.medal.cx, SR_IMG.medal.cy, SR_IMG.medal.w, undefined, tf)}>
        <div className="sr-stars" aria-label={gradeLabel}>
          {[1, 2, 3].map(n => <StarSVG key={n} filled={stars >= n} />)}
        </div>
        <div className="sr-rating-label">{gradeLabel}</div>
      </div>

      {/* ── Stage name — synced to right-top plate ── */}
      <div className="sr-stage-name" aria-label={stage.name}
        style={srBox(SR_IMG.stageName.cx, SR_IMG.stageName.cy, SR_IMG.stageName.w, undefined, tf)}
      >
        <span className="sr-stage-name-ko">{stage.name}</span>
        {stage.nameEn && <span className="sr-stage-name-en">{stage.nameEn}</span>}
      </div>

      {/* ── Completion bar — synced to right green bar ── */}
      <div className="sr-stat sr-stat-bar-row"
        style={srBox(SR_IMG.completionBar.cx, SR_IMG.completionBar.cy, SR_IMG.completionBar.w, undefined, tf)}
      >
        <span className="sr-stat-label">{t('result.completion')}</span>
        <div className="sr-stat-bar">
          <div className="sr-bar-fill completion" style={{ width: `${completion}%` }} />
        </div>
        <span className="sr-stat-val">{completion}%</span>
      </div>

      {/* ── Completion gauge — synced to circle gauge ── */}
      <div className="sr-gauge"
        style={srBox(SR_IMG.gauge.cx, SR_IMG.gauge.cy, SR_IMG.gauge.w, SR_IMG.gauge.h, tf)}
        aria-hidden="true"
      >
        <CircleGaugeSVG pct={completion} color="#5ab040" />
      </div>

      {/* ── Conserve stats + pieces — synced to right cream panel ── */}
      <div className="sr-stats-panel"
        style={srBox(SR_IMG.statsPanel.cx, SR_IMG.statsPanel.cy, SR_IMG.statsPanel.w, SR_IMG.statsPanel.h, tf)}
        role="region" aria-label={t('result.conserveLabel')}
      >
        <div className="sr-statp-row">
          <span className="sr-statp-label">{t('result.conserveLabel')}</span>
          <span className="sr-statp-val" style={{ color: '#2f80b0' }}>{conservePct}<small>%</small></span>
        </div>
        <div className="sr-pieces-row">
          {Array.from({ length: state.totalPieces }).map((_, i) => (
            <div key={i} className={`sr-piece-dot${i < state.foundPieces ? ' found' : ''}`} aria-hidden="true" />
          ))}
        </div>
        <div className="sr-pieces-label">{state.foundPieces}/{state.totalPieces} {t('result.piecesLabel')}</div>
      </div>

      {/* ── Action buttons — synced to baked-in slots ── */}
      {RESULT_ACTIONS.map(({ action, label }, i) => {
        const z = SR_IMG.btns[action];
        return (
          <button
            key={action}
            className={`sr-action-btn${selectedIdx === i ? ' active' : ''}${action === 'next_fossil' ? ' primary' : ''}`}
            onClick={() => handleAction(action)}
            aria-label={label}
            aria-current={selectedIdx === i ? 'true' : undefined}
            style={srBox(z.cx, z.cy, z.w, z.h, tf)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
