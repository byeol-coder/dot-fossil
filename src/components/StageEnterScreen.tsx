import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import { useTranslation } from '../i18n';

// ─── Image-sync positioning (stage-enter-desert-bg.png, 1672×941) ────────────
const SE_IMG_W = 1672;
const SE_IMG_H = 941;

// Baked-in element centers in source-image pixels
const SE_IMG = {
  titleCard: { cx: 800, cy: 200 },  // large sign board center
  targetCard: { cx: 1450, cy: 400 }, // right card area center
  btn:        { cx: 1045, cy: 855 }, // green "start" button center
  bubble:     { cx: 220,  cy: 790 }, // speech bubble center
} as const;

function seComputeTransform() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / SE_IMG_W, vh / SE_IMG_H);
  return { scale, ox: (SE_IMG_W * scale - vw) / 2, oy: (SE_IMG_H * scale - vh) / 2 };
}

function useSeTransform() {
  const [tf, setTf] = useState(seComputeTransform);
  useEffect(() => {
    const upd = () => setTf(seComputeTransform());
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
  return tf;
}

function seCentred(cx: number, cy: number, tf: ReturnType<typeof seComputeTransform>, extra?: CSSProperties): CSSProperties {
  return { position: 'absolute', left: cx * tf.scale - tf.ox, top: cy * tf.scale - tf.oy, transform: 'translate(-50%, -50%)', ...extra };
}
// ─────────────────────────────────────────────────────────────────────────────

interface StageEnterScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export default function StageEnterScreen({ state, dispatch }: StageEnterScreenProps) {
  const { t } = useTranslation();
  const stage = STAGES[state.stageId] ?? STAGES['desert_rib'];
  const tf = useSeTransform();

  const enter = useCallback(() => {
    dispatch({ type: 'ENTER_STAGE' });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  return (
    <div
      className="gw-screen se-screen"
      role="main"
      aria-label="발굴지 입장"
      style={{
        backgroundImage: `url('${ASSETS.screens.stageEnterDesert}'), url('${ASSETS.reference.gameplay}')`,
      }}
    >
      <div className="gw-frame" aria-hidden="true" />

      {/* Stage name — synced to baked-in sign board */}
      <div className="se-title-card" aria-label={`발굴지: ${stage.name}`}
        style={seCentred(SE_IMG.titleCard.cx, SE_IMG.titleCard.cy, tf, { width: 400 * tf.scale })}
      >
        <div className="se-title-label">{t('stage.enterTitle')}</div>
        <div className="se-title-name">{stage.name}</div>
        <div className="se-title-sub">{stage.nameEn}</div>
      </div>

      {/* Target — synced to baked-in right card */}
      <div className="se-target-card" role="region" aria-label="발굴 목표"
        style={seCentred(SE_IMG.targetCard.cx, SE_IMG.targetCard.cy, tf, { width: 260 * tf.scale })}
      >
        <div className="se-target-label">{t('stage.todayGoal')}</div>
        <p className="se-target-text">{stage.target}</p>
        <div className="se-target-pieces">
          <span className="se-pieces-num">{stage.totalPieces}</span>
          <span className="se-pieces-label">{t('stage.piecesUnit')}</span>
        </div>
      </div>

      {/* Speech bubble — synced to character speech area */}
      <div className="gw-col-bubble se-bubble" role="status" aria-live="polite"
        style={{ left: SE_IMG.bubble.cx * tf.scale - tf.ox, top: SE_IMG.bubble.cy * tf.scale - tf.oy, transform: 'translate(0, -50%)', position: 'absolute', width: 330 * tf.scale }}
      >
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
          {`${stage.name}${t('stage.enterBubble')}`}
        </p>
      </div>

      {/* Enter button — synced to baked-in green button */}
      <div className="se-cta" style={seCentred(SE_IMG.btn.cx, SE_IMG.btn.cy, tf)}>
        <button
          className="gw-oval-btn"
          onClick={enter}
          aria-label="발굴 시작"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', color: '#fff', textShadow: '0 1px 5px rgba(0,0,0,0.6)', fontSize: '1.15rem', fontWeight: 700, padding: '14px 56px', letterSpacing: '0.03em' }}
        >
          {t('stage.startBtn')}
        </button>
        <p className="se-hint" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{t('stage.keyHint')}</p>
      </div>
    </div>
  );
}
