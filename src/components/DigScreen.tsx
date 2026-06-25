import { useMemo, useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameAction, ToolType } from '../types';
import { STAGES } from '../data/stages';
import { TOOL_DEFS } from '../data/tools';
import { FOSSIL_DEFS } from '../data/fossils';
import { FOSSIL_IMG } from '../data/fossilImages';
import { DINOSAUR_IMG, DINOSAUR_KO } from '../data/dinosaurImages';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import type { DotGrid } from '../dotpad/tactilePatterns';
import type { DotPadStatus } from '../dotpad/useDotPad';
import { getFossilPattern, hexPatternToDotGrid } from '../dotpad/fossilPatterns';
import DotPadPreview from './DotPadPreview';
import BrailleMessageBar from './BrailleMessageBar';
import DotPadConnector from './DotPadConnector';
import GameAssetImage from './GameAssetImage';
import FossilRevealLayer from './FossilRevealLayer';
import { ASSETS, TOOL_ASSET, CHARACTER_ACTION_ASSET } from '../assets';
import { useTranslation } from '../i18n';

const TOOL_LIST: ToolType[] = ['brush', 'careful_dig', 'probe'];

// ─── Image-sync positioning (play-screen-*-bg.png, 1672×941) ─────────────────
const DIG_IMG_W = 1672;
const DIG_IMG_H = 941;

// Baked-in UI zones in source-image pixels
const DIG_IMG = {
  hud: [
    { cx: 326,  cy: 82 },  // progress
    { cx: 616,  cy: 82 },  // damage
    { cx: 900,  cy: 82 },  // pieces
    { cx: 1246, cy: 82 },  // position / mode
  ],
  grid:      { cx: 773, cy: 430, w: 905, h: 500 },  // central excavation board
  toolPanel: { cx: 1432, cy: 461, w: 208, h: 405 }, // right vertical 4-slot panel (below header medallion)
  speech:    { cx: 508, cy: 783, w: 375 },          // bottom-left parchment
  braille:   { cx: 942, cy: 783, w: 430, h: 110 },  // bottom-center long bar
  btns: [
    { cx: 1229, cy: 783 },
    { cx: 1343, cy: 783 },
    { cx: 1457, cy: 783 },
  ],
} as const;

function digComputeTransform() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / DIG_IMG_W, vh / DIG_IMG_H);
  return { scale, ox: (DIG_IMG_W * scale - vw) / 2, oy: (DIG_IMG_H * scale - vh) / 2 };
}

function useDigTransform() {
  const [tf, setTf] = useState(digComputeTransform);
  useEffect(() => {
    const upd = () => setTf(digComputeTransform());
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
  return tf;
}

type DigTf = ReturnType<typeof digComputeTransform>;

// Box centred on an image-space point with image-scaled width/height
function digBox(cx: number, cy: number, w: number, h: number | undefined, tf: DigTf): React.CSSProperties {
  return {
    position: 'absolute',
    left: cx * tf.scale - tf.ox,
    top:  cy * tf.scale - tf.oy,
    width: w * tf.scale,
    ...(h != null ? { height: h * tf.scale } : {}),
    transform: 'translate(-50%, -50%)',
  };
}
// ─────────────────────────────────────────────────────────────────────────────

type DigView = 'playing' | 'fossil-found' | 'damage-warning';

function getPlayBg(characterAction: GameState['characterAction'], damage: number): string {
  if (damage > 60) return ASSETS.screens.playWarning;
  switch (characterAction) {
    case 'probe': return ASSETS.screens.playClueFound;
    case 'brush':
    case 'dig':   return ASSETS.screens.playDigging;
    case 'found': return ASSETS.screens.playFossilFound;
    case 'warning': return ASSETS.screens.playWarning;
    default: return ASSETS.screens.playDefault;
  }
}

function FossilFoundPopup({
  foundPieces, totalPieces, fossilName, fossilImg, dinoImg, dinoName,
  brailleMessage, onContinue, t,
}: {
  foundPieces: number; totalPieces: number; fossilName: string; fossilImg: string;
  dinoImg?: string; dinoName?: string;
  brailleMessage: string; onContinue: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="dg-popup-overlay" role="dialog" aria-modal="true" aria-label={t('gameplay.fossilFoundTitle')}>
      <div className="dg-popup dg-popup-found">
        {/* Reward body — fossil is the hero, centred */}
        <div className="dg-popup-body">
          <div className="dg-popup-title">🎉 {t('gameplay.fossilFoundTitle')}</div>

          <div className="dg-popup-fossil">
            <span className="dg-popup-fossil-ring" aria-hidden="true" />
            {fossilImg && (
              <GameAssetImage src={fossilImg} alt={fossilName} className="dg-popup-fossil-img" />
            )}
          </div>

          <div className="dg-popup-fossil-name">{fossilName}</div>

          {dinoImg && (
            <div className="dg-popup-dino">
              <GameAssetImage src={dinoImg} alt={dinoName ?? ''} className="dg-popup-dino-img" multiplyBlend />
              {dinoName && <span className="dg-popup-dino-label">{dinoName}의 화석</span>}
            </div>
          )}

          <div className="dg-popup-pieces" aria-label={`${foundPieces}/${totalPieces}`}>
            {Array.from({ length: totalPieces }).map((_, i) => (
              <div key={i} className={`dg-popup-piece-dot${i < foundPieces ? ' found' : ''}`} aria-hidden="true" />
            ))}
            <span className="dg-popup-pieces-label">{foundPieces}/{totalPieces}</span>
          </div>

          <p className="dg-popup-braille">{brailleMessage}</p>

          <button
            className="gw-oval-btn dg-popup-btn"
            onClick={onContinue}
            aria-label={t('gameplay.continueBtn')}
            autoFocus
          >
            {t('gameplay.continueBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DamageWarningPopup({
  damage, completion, currentTool, onContinue, t,
}: {
  damage: number; completion: number; currentTool: ToolType; onContinue: () => void;
  t: (k: string) => string;
}) {
  const tool = TOOL_DEFS[currentTool];
  return (
    <div className="dg-popup-overlay" role="dialog" aria-modal="true" aria-label={t('gameplay.damageWarnTitle')}>
      <div className="dg-popup dg-popup-warn">
        {/* Left panel */}
        <div className="dg-popup-left">
          <div className="dg-popup-char">
            <GameAssetImage src={ASSETS.character.warning} alt="" style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom center' }} />
          </div>
          <div className="dg-warn-triangle" aria-hidden="true">
            <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
              <polygon points="36,4 68,60 4,60" fill="rgba(220,48,32,0.18)" stroke="#d03020" strokeWidth="3" strokeLinejoin="round" />
              <text x="36" y="50" textAnchor="middle" fontSize="28" fontWeight="700" fill="#d03020">!</text>
            </svg>
          </div>
        </div>
        {/* Right panel */}
        <div className="dg-popup-right">
          <div className="dg-popup-title dg-warn-title">{t('gameplay.damageWarnTitle')}</div>
          <p className="dg-popup-msg" style={{ whiteSpace: 'pre-line' }}>
            {t('gameplay.damageWarnMsg')}
          </p>
          <div className="dg-warn-tool-row">
            <span className="dg-warn-tool-label">{t('gameplay.currentTool')}</span>
            <GameAssetImage
              src={TOOL_ASSET[currentTool]}
              alt={tool.name}
              width={24}
              height={24}
              style={{ objectFit: 'contain' }}
            />
            <span className="dg-warn-tool-name">{tool.name}</span>
          </div>
          <div className="dg-warn-meters">
            <div className="dg-warn-meter">
              <span>{t('gameplay.damageLabel')}</span>
              <div className="dg-warn-bar"><div className="dg-warn-bar-fill damage" style={{ width: `${damage}%` }} /></div>
              <span className="dg-warn-pct" style={{ color: '#c03030' }}>{damage}%</span>
            </div>
            <div className="dg-warn-meter">
              <span>{t('gameplay.progressLabel')}</span>
              <div className="dg-warn-bar"><div className="dg-warn-bar-fill completion" style={{ width: `${completion}%` }} /></div>
              <span className="dg-warn-pct">{completion}%</span>
            </div>
          </div>
          <button
            className="gw-oval-btn"
            onClick={onContinue}
            aria-label={t('gameplay.carefulContinueBtn')}
            style={{ marginTop: 12, padding: '10px 28px' }}
            autoFocus
          >
            {t('gameplay.carefulContinueBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DigScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  dotpadStatus: DotPadStatus;
  connect: () => void;
  connectDemo: () => void;
  disconnect: () => void;
  selfTest: () => void;
  sendGrid: (g: DotGrid) => void; // live synthesized grid → device (graphic mode)
  sendRawHex: (h: string) => void;
}

export default function DigScreen({ state, dispatch, dotpadStatus, connect, connectDemo, disconnect, selfTest, sendGrid, sendRawHex }: DigScreenProps) {
  const { t } = useTranslation();
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces, currentTool, characterAction } = state;
  const tf = useDigTransform();

  const [digView, setDigView] = useState<DigView>('playing');
  const prevFoundPieces = useRef(state.foundPieces);
  const prevCompletion = useRef(state.completion);

  // DotPad visual preview (screen display only, not sent to hardware)
  const dotGrid = useMemo(
    () => renderToDotGrid(state.grid, state.cursor, stage?.width ?? 20, stage?.height ?? 14),
    [state.grid, state.cursor, stage],
  );

  // When a fossil piece is found, show its actual bone pattern instead of the game grid
  const fossilFoundGrid = useMemo<DotGrid | null>(() => {
    if (digView !== 'fossil-found') return null;
    const fossilId = stage?.fossils[0]?.fossilId;
    if (!fossilId) return null;
    const hex = getFossilPattern(fossilId);
    return hex ? hexPatternToDotGrid(hex) : null;
  }, [digView, stage]);

  const displayGrid = fossilFoundGrid ?? dotGrid;

  // Best in-progress reveal across all fossil pieces (0-100) — drives the
  // continuous "현재 조각 노출도" sub-bar so the player feels gradual emergence
  // between the coarse 25%-per-piece completion steps.
  const bestRevealProgress = useMemo(() => {
    const inProgress = state.fossilPieces.filter(p => p.revealProgress > 0 && p.revealProgress < 100);
    if (inProgress.length === 0) return 0;
    return Math.round(Math.max(...inProgress.map(p => p.revealProgress)));
  }, [state.fossilPieces]);

  // Send the LIVE synthesized tactile image (soil + emerging fossil shape + cursor)
  // to the device whenever it changes. The SDK diffs lines and updates only the
  // changed cells, so per-dig updates stay cheap. This makes the hardware feel the
  // soil drop away and the bone rise — matching the on-screen preview, not just a
  // generic soil-clearing animation.
  useEffect(() => {
    if (dotpadStatus === 'connected') sendGrid(displayGrid);
  }, [displayGrid, dotpadStatus, sendGrid]);

  // Fossil piece found popup — send the fossil's bone tactile pattern to DotPad
  useEffect(() => {
    if (state.foundPieces > prevFoundPieces.current && digView === 'playing') {
      setDigView('fossil-found');
      const fossilId = stage?.fossils[0]?.fossilId;
      if (fossilId) {
        const pattern = getFossilPattern(fossilId);
        if (pattern) sendRawHex(pattern);
      }
    }
    prevFoundPieces.current = state.foundPieces;
  }, [state.foundPieces, digView, stage, sendRawHex]);

  // Damage warning popup (once)
  useEffect(() => {
    if (damage > 75 && !state.damageWarningShown && digView === 'playing') {
      setDigView('damage-warning');
    }
  }, [damage, state.damageWarningShown, digView]);

  // Stage complete → result screen
  useEffect(() => {
    if (state.completion >= 100 && prevCompletion.current < 100) {
      const tid = setTimeout(() => dispatch({ type: 'COMPLETE_STAGE' }), 1800);
      return () => clearTimeout(tid);
    }
    prevCompletion.current = state.completion;
  }, [state.completion, dispatch]);

  const bg = getPlayBg(characterAction, damage);
  const fallbackBg = ASSETS.reference.gameplay;
  const mainFossilId = stage?.fossils[0]?.fossilId ?? '';
  const fossilName = FOSSIL_DEFS[mainFossilId]?.name ?? '화석';
  const fossilImg = FOSSIL_IMG[mainFossilId] ?? '';
  const fossilDinoId = FOSSIL_DEFS[mainFossilId]?.dinosaur;
  const dinoImg = fossilDinoId ? (DINOSAUR_IMG[fossilDinoId] ?? '') : '';
  const dinoName = fossilDinoId ? (DINOSAUR_KO[fossilDinoId] ?? '') : '';

  return (
    <div
      className="gw-screen gw-dig"
      role="main"
      aria-label="발굴 게임 화면"
      style={{ backgroundImage: `url('${bg}'), url('${fallbackBg}')` }}
    >
      {/* Wooden border frame */}
      <div className="gw-frame" aria-hidden="true" />

      {/* ── Top HUD panels — synced to baked-in 4 plates ── */}
      {/* Panel 1: progress (piece completion) + continuous reveal sub-bar */}
      <div className="dg-hud-panel" style={digBox(DIG_IMG.hud[0].cx, DIG_IMG.hud[0].cy, 280, 88, tf)}>
        <div className="dg-hud-label">{t('gameplay.progressLabel')} <span className="dg-hud-val-inline">{completion}%</span></div>
        <div className="gw-dig-stat-bar">
          <div
            className="gw-dig-bar-fill completion"
            style={{ width: `${completion}%` }}
            role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}
            aria-label={`${t('gameplay.progressLabel')} ${completion}%`}
          />
        </div>
        {/* Continuous reveal of the piece currently being uncovered */}
        <div className="dg-reveal-row">
          <span className="dg-reveal-label">{t('gameplay.revealLabel')}</span>
          <div className="gw-dig-stat-bar dg-reveal-bar">
            <div
              className="gw-dig-bar-fill reveal"
              style={{ width: `${bestRevealProgress}%` }}
              role="progressbar" aria-valuenow={bestRevealProgress} aria-valuemin={0} aria-valuemax={100}
              aria-label={`${t('gameplay.revealLabel')} ${bestRevealProgress}%`}
            />
          </div>
          <span className="dg-reveal-val">{bestRevealProgress}%</span>
        </div>
      </div>

      {/* Panel 2: damage */}
      <div className="dg-hud-panel" style={digBox(DIG_IMG.hud[1].cx, DIG_IMG.hud[1].cy, 280, 88, tf)}>
        <div className="dg-hud-label">{t('gameplay.damageLabel')}</div>
        <div className="gw-dig-stat-bar">
          <div
            className={`gw-dig-bar-fill damage${damage > 60 ? ' danger' : damage > 40 ? ' warn' : ''}`}
            style={{ width: `${damage}%` }}
            role="progressbar" aria-valuenow={damage} aria-valuemin={0} aria-valuemax={100}
            aria-label={`${t('gameplay.damageLabel')} ${damage}%`}
          />
        </div>
        <div
          className={`dg-hud-val${damage > 60 ? ' danger' : damage > 40 ? ' warn' : ''}`}
          style={damage > 60 ? { color: '#e06040' } : damage > 40 ? { color: '#e09030' } : undefined}
        >
          {damage}%
        </div>
      </div>

      {/* Panel 3: pieces */}
      <div className="dg-hud-panel" style={digBox(DIG_IMG.hud[2].cx, DIG_IMG.hud[2].cy, 280, 88, tf)}>
        <div className="dg-hud-label">{t('gameplay.piecesLabel')} ({foundPieces}/{totalPieces})</div>
        <div className="gw-dig-piece-slots" aria-label={`${foundPieces}/${totalPieces}`}>
          {Array.from({ length: totalPieces }).map((_, i) => (
            <div key={i} className={`gw-dig-piece-slot${i < foundPieces ? ' found' : ''}`} aria-hidden="true" />
          ))}
        </div>
      </div>

      {/* Panel 4: position + mode toggle */}
      <div className="dg-hud-panel" style={digBox(DIG_IMG.hud[3].cx, DIG_IMG.hud[3].cy, 280, 88, tf)}>
        <div className="dg-hud-label" aria-live="polite">
          {t('gameplay.posLabel')}: ({state.cursor.x + 1}, {state.cursor.y + 1})
        </div>
        <button
          className="gw-dig-mode-toggle"
          onClick={() => dispatch({ type: 'SET_MODE', mode: state.mode === 'clue_scan' ? 'precision_dig' : 'clue_scan' })}
          aria-label={`현재 모드: ${state.mode === 'clue_scan' ? t('gameplay.clueMode') : t('gameplay.precisionMode')}. 클릭하여 전환`}
        >
          <span>{state.mode === 'clue_scan' ? t('gameplay.clueMode') : t('gameplay.precisionMode')}</span>
          <span className="gw-dig-key">F1/F2</span>
        </button>
      </div>

      {/* ── Excavation board (DotPad grid) — synced to baked-in centre board ── */}
      <div
        className={`gw-dig-board${damage > 60 ? ' danger' : characterAction === 'found' ? ' found' : ''}`}
        aria-label="발굴 지도"
        style={digBox(DIG_IMG.grid.cx, DIG_IMG.grid.cy, DIG_IMG.grid.w, DIG_IMG.grid.h, tf)}
      >
        <div className="gw-dig-board-inner">
          <DotPadPreview
            dotGrid={displayGrid}
            stageWidth={stage?.width ?? 20}
            stageHeight={stage?.height ?? 14}
            onCellClick={(x, y) => dispatch({ type: 'SET_CURSOR_POSITION', x, y })}
          />
          <FossilRevealLayer
            fossilPieces={state.fossilPieces}
            stageWidth={stage?.width ?? 20}
            stageHeight={stage?.height ?? 14}
          />
        </div>
      </div>

      {/* ── Right tool panel — synced to baked-in vertical slots ── */}
      <div
        className="dg-tool-panel"
        aria-label={t('gameplay.toolSelectLabel')}
        style={digBox(DIG_IMG.toolPanel.cx, DIG_IMG.toolPanel.cy, DIG_IMG.toolPanel.w, DIG_IMG.toolPanel.h, tf)}
      >
        {TOOL_LIST.map(toolId => {
          const tool = TOOL_DEFS[toolId];
          return (
            <button
              key={toolId}
              className={`gw-dig-tool-btn${currentTool === toolId ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: toolId })}
              aria-pressed={currentTool === toolId}
              aria-label={`${tool.name} — ${tool.shortcut}키`}
            >
              <GameAssetImage
                src={TOOL_ASSET[toolId]}
                alt=""
                width={22}
                height={22}
                style={{ objectFit: 'contain', flexShrink: 0 }}
              />
              {tool.name}
              <span className="gw-dig-key">{tool.shortcut}</span>
            </button>
          );
        })}
        <div className="dg-tool-panel-connector">
          <DotPadConnector
            status={dotpadStatus}
            onConnect={connect}
            onConnectDemo={connectDemo}
            onDisconnect={disconnect}
            onSelfTest={selfTest}
          />
        </div>
      </div>

      {/* ── Character (bottom-left) ── */}
      <div className="gw-char-corner" aria-hidden="true">
        <GameAssetImage
          src={CHARACTER_ACTION_ASSET[characterAction]}
          alt=""
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

      {/* ── Character speech bubble — synced to bottom-left parchment ── */}
      {(state.dialogueMessage || state.brailleMessage) && (
        <div
          className="dg-speech-bubble"
          role="status" aria-live="polite" aria-atomic="true"
          style={digBox(DIG_IMG.speech.cx, DIG_IMG.speech.cy, DIG_IMG.speech.w, undefined, tf)}
        >
          {state.dialogueMessage || state.brailleMessage}
        </div>
      )}

      {/* ── Braille message bar — synced to bottom-center bar ── */}
      <div
        className="gw-dig-braille"
        style={digBox(DIG_IMG.braille.cx, DIG_IMG.braille.cy, DIG_IMG.braille.w, DIG_IMG.braille.h, tf)}
      >
        <BrailleMessageBar message={state.brailleMessage} label={state.brailleLabel} />
      </div>

      {/* ── Bottom-right action buttons — synced to baked-in 3 buttons ── */}
      <button
        className="dg-action-btn dg-action-use"
        onClick={() => dispatch({ type: 'USE_TOOL' })}
        aria-label={`${t('gameplay.useTool')} ${t('gameplay.useToolKey')}`}
        style={digBox(DIG_IMG.btns[0].cx, DIG_IMG.btns[0].cy, 116, 64, tf)}
      >
        {t('gameplay.useTool')}
      </button>
      <button
        className="dg-action-btn"
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'collection' })}
        aria-label={t('common.collection')}
        style={digBox(DIG_IMG.btns[1].cx, DIG_IMG.btns[1].cy, 116, 64, tf)}
      >
        {t('common.collection')}
      </button>
      <button
        className="dg-action-btn"
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
        aria-label={t('gameplay.menuBtn')}
        style={digBox(DIG_IMG.btns[2].cx, DIG_IMG.btns[2].cy, 116, 64, tf)}
      >
        {t('gameplay.menuBtn')}
      </button>

      {/* ── Popups ── */}
      {digView === 'fossil-found' && (
        <FossilFoundPopup
          foundPieces={foundPieces}
          totalPieces={totalPieces}
          fossilName={fossilName}
          fossilImg={fossilImg}
          dinoImg={dinoImg}
          dinoName={dinoName}
          brailleMessage={state.brailleMessage}
          onContinue={() => setDigView('playing')}
          t={t}
        />
      )}
      {digView === 'damage-warning' && (
        <DamageWarningPopup
          damage={damage}
          completion={completion}
          currentTool={currentTool}
          onContinue={() => {
            dispatch({ type: 'DISMISS_DAMAGE_WARNING' });
            setDigView('playing');
          }}
          t={t}
        />
      )}

      {/* Stage complete flash */}
      {completion >= 100 && digView === 'playing' && (
        <div className="dg-complete-flash" aria-live="assertive">
          {t('gameplay.completeFlash')}
        </div>
      )}
    </div>
  );
}
