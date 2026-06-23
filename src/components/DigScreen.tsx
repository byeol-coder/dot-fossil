import { useMemo, useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameAction, ToolType } from '../types';
import { STAGES } from '../data/stages';
import { TOOL_DEFS } from '../data/tools';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import type { DotGrid } from '../dotpad/tactilePatterns';
import type { DotPadStatus } from '../dotpad/useDotPad';
import { getFossilPattern, getExcavationSoilPattern } from '../dotpad/fossilPatterns';
import DotPadPreview from './DotPadPreview';
import BrailleMessageBar from './BrailleMessageBar';
import DotPadConnector from './DotPadConnector';
import GameAssetImage from './GameAssetImage';
import FossilRevealLayer from './FossilRevealLayer';
import { ASSETS, TOOL_ASSET, CHARACTER_ACTION_ASSET } from '../assets';
import { useTranslation } from '../i18n';

const TOOL_LIST: ToolType[] = ['brush', 'careful_dig', 'probe'];

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
  foundPieces, totalPieces, fossilName, brailleMessage,
  onContinue, t,
}: {
  foundPieces: number; totalPieces: number; fossilName: string;
  brailleMessage: string; onContinue: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="dg-popup-overlay" role="dialog" aria-modal="true" aria-label={t('gameplay.fossilFoundTitle')}>
      <div
        className="dg-popup"
        style={{ backgroundImage: `url('${ASSETS.screens.popupFossilFound}')` }}
      >
        {/* Left panel */}
        <div className="dg-popup-left">
          <div className="dg-popup-char">
            <GameAssetImage src={ASSETS.character.found} alt="" style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom center' }} />
          </div>
          <div className="dg-fossil-glow" aria-hidden="true">
            <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
              <circle cx="45" cy="45" r="38" fill="rgba(240,192,48,0.18)" />
              <circle cx="45" cy="45" r="28" fill="rgba(240,192,48,0.28)" />
              <circle cx="45" cy="45" r="18" fill="rgba(255,220,80,0.42)" />
              <text x="45" y="52" textAnchor="middle" fontSize="26" fill="#b88010">★</text>
            </svg>
          </div>
        </div>
        {/* Right panel */}
        <div className="dg-popup-right">
          <div className="dg-popup-title">{t('gameplay.fossilFoundTitle')}</div>
          <div className="dg-popup-fossil-name">{fossilName}</div>
          <div className="dg-popup-pieces">
            {Array.from({ length: totalPieces }).map((_, i) => (
              <div key={i} className={`dg-popup-piece-dot${i < foundPieces ? ' found' : ''}`} aria-hidden="true" />
            ))}
            <span className="dg-popup-pieces-label">{foundPieces}/{totalPieces}</span>
          </div>
          <p className="dg-popup-braille">{brailleMessage}</p>
          <button
            className="gw-oval-btn"
            onClick={onContinue}
            aria-label={t('gameplay.continueBtn')}
            style={{ marginTop: 12, padding: '10px 32px' }}
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
      <div
        className="dg-popup"
        style={{ backgroundImage: `url('${ASSETS.screens.popupDamageWarn}')` }}
      >
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
  disconnect: () => void;
  sendGrid: (g: DotGrid) => void; // kept for compatibility; hardware uses sendRawHex
  sendRawHex: (h: string) => void;
}

function AmmoniteSVG() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38" fill="none" aria-hidden="true">
      <ellipse cx="26" cy="9" rx="8" ry="5.5" fill="#5a90d0" />
      <ellipse cx="26" cy="8" rx="5.5" ry="3.5" fill="#7ab0ee" opacity="0.7" />
      <ellipse cx="26" cy="7" rx="2.5" ry="1.5" fill="#a8d0ff" opacity="0.6" />
      <path d="M4 22 Q4 9 26 9 Q48 9 48 22" stroke="#9a7840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="4" cy="24" r="3.5" fill="#9a7840" />
      <circle cx="48" cy="24" r="3.5" fill="#9a7840" />
      <path d="M8 30 Q8 22 26 22 Q44 22 44 30" stroke="#7a5820" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export default function DigScreen({ state, dispatch, dotpadStatus, connect, disconnect, sendGrid: _sendGrid, sendRawHex }: DigScreenProps) {
  const { t } = useTranslation();
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces, currentTool, characterAction } = state;

  const [digView, setDigView] = useState<DigView>('playing');
  const prevFoundPieces = useRef(state.foundPieces);
  const prevCompletion = useRef(state.completion);

  // DotPad visual preview (screen display only, not sent to hardware)
  const dotGrid = useMemo(
    () => renderToDotGrid(state.grid, state.cursor, stage?.width ?? 20, stage?.height ?? 14),
    [state.grid, state.cursor, stage],
  );

  // Best reveal progress across all fossil pieces (0-100)
  const bestRevealProgress = useMemo(() => {
    if (state.fossilPieces.length === 0) return 0;
    return Math.max(...state.fossilPieces.map(p => p.revealProgress));
  }, [state.fossilPieces]);

  // Soil stage index (0-8) — changes only at thresholds
  const soilPageIdx = Math.min(8, Math.floor((bestRevealProgress / 100) * 9));

  // Send DotPad soil-removal stage pattern when index changes or device connects
  useEffect(() => {
    sendRawHex(getExcavationSoilPattern(bestRevealProgress));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soilPageIdx, dotpadStatus, sendRawHex]);

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
  const fossilName = stage?.fossils[0]?.fossilId ?? '화석';

  return (
    <div
      className="gw-screen gw-dig"
      role="main"
      aria-label="발굴 게임 화면"
      style={{ backgroundImage: `url('${bg}'), url('${fallbackBg}')` }}
    >
      {/* Wooden border frame */}
      <div className="gw-frame" aria-hidden="true" />

      {/* Stone ammonite banner */}
      <div className="gw-banner" aria-hidden="true">
        <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <AmmoniteSVG />
        </div>
        <div className="gw-banner-plate">{stage?.name ?? '사막 발굴지'}</div>
      </div>

      {/* ── Wooden bulletin board (DotPad grid) ── */}
      <div
        className={`gw-dig-board${damage > 60 ? ' danger' : characterAction === 'found' ? ' found' : ''}`}
        aria-label="발굴 지도"
      >
        <div className="gw-dig-board-inner" style={{ position: 'relative' }}>
          <DotPadPreview dotGrid={dotGrid} />
          <FossilRevealLayer
            fossilPieces={state.fossilPieces}
            stageWidth={stage?.width ?? 20}
            stageHeight={stage?.height ?? 14}
          />
        </div>
      </div>

      {/* ── Right info card ── */}
      <div className="gw-dig-rcard gw-card-frame" aria-label="발굴 정보">
        <div className="gw-card-badge" aria-hidden="true" style={{ marginTop: -17 }} />

        <div className="gw-dig-rcard-body">
          {/* Progress stats */}
          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">{t('gameplay.progressLabel')}</div>
            <div className="gw-dig-stat-bar">
              <div
                className="gw-dig-bar-fill completion"
                style={{ width: `${completion}%` }}
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t('gameplay.progressLabel')} ${completion}%`}
              />
            </div>
            <div className="gw-dig-stat-val">{completion}%</div>
          </div>

          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">{t('gameplay.damageLabel')}</div>
            <div className="gw-dig-stat-bar">
              <div
                className={`gw-dig-bar-fill damage${damage > 60 ? ' danger' : ''}`}
                style={{ width: `${damage}%` }}
                role="progressbar"
                aria-valuenow={damage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t('gameplay.damageLabel')} ${damage}%`}
              />
            </div>
            <div className={`gw-dig-stat-val${damage > 60 ? ' danger' : ''}`}
                 style={damage > 60 ? { color: '#c03030' } : undefined}>
              {damage}%
            </div>
          </div>

          {/* Fossil piece slots */}
          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">{t('gameplay.piecesLabel')} ({foundPieces}/{totalPieces})</div>
            <div className="gw-dig-piece-slots" aria-label={`${foundPieces}/${totalPieces}`}>
              {Array.from({ length: totalPieces }).map((_, i) => (
                <div key={i} className={`gw-dig-piece-slot${i < foundPieces ? ' found' : ''}`} aria-hidden="true" />
              ))}
            </div>
          </div>

          {/* Mode & cursor position */}
          <div className="gw-dig-stat" aria-live="polite" style={{ color: '#6a4420', fontSize: '0.7rem' }}>
            {t('gameplay.posLabel')}: ({state.cursor.x + 1}, {state.cursor.y + 1}) — {state.mode === 'clue_scan' ? t('gameplay.clueMode') : t('gameplay.precisionMode')}
          </div>

          <div className="gw-dig-divider" aria-hidden="true" />

          {/* Tool selection */}
          <div className="gw-dig-section-label">{t('gameplay.toolSelectLabel')}</div>
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

          <div className="gw-dig-divider" aria-hidden="true" />

          {/* DotPad connector */}
          <DotPadConnector
            status={dotpadStatus}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {/* Nav buttons */}
          <div className="gw-dig-rcard-nav">
            <button
              className="gw-stone-btn"
              style={{ fontSize: '0.82rem', padding: '7px 12px', width: '100%' }}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'collection' })}
              aria-label={t('common.collection')}
            >
              {t('common.collection')}
            </button>
            <button
              className="gw-stone-btn"
              style={{ fontSize: '0.82rem', padding: '7px 12px', width: '100%' }}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
              aria-label={t('gameplay.menuBtn')}
            >
              {t('gameplay.menuBtn')}
            </button>
          </div>
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

      {/* ── Character speech bubble ── */}
      {(state.dialogueMessage || state.brailleMessage) && (
        <div className="dg-speech-bubble" role="status" aria-live="polite" aria-atomic="true">
          {state.dialogueMessage || state.brailleMessage}
        </div>
      )}

      {/* ── Green CTA — use current tool ── */}
      <div className="gw-dig-cta">
        <button
          className="gw-oval-btn"
          onClick={() => dispatch({ type: 'USE_TOOL' })}
          aria-label={`${t('gameplay.useTool')} ${t('gameplay.useToolKey')}`}
          style={{ padding: '12px 36px', fontSize: '1rem' }}
        >
          {t('gameplay.useTool')}
        </button>
      </div>

      {/* ── Braille message bar ── */}
      <div className="gw-dig-braille">
        <BrailleMessageBar message={state.brailleMessage} label={state.brailleLabel} />
      </div>

      {/* ── Popups ── */}
      {digView === 'fossil-found' && (
        <FossilFoundPopup
          foundPieces={foundPieces}
          totalPieces={totalPieces}
          fossilName={fossilName}
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
