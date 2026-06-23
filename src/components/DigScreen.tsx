import { useMemo, useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameAction, ToolType } from '../types';
import { STAGES } from '../data/stages';
import { TOOL_DEFS } from '../data/tools';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import type { DotGrid } from '../dotpad/tactilePatterns';
import type { DotPadStatus } from '../dotpad/useDotPad';
import { getFossilPattern } from '../dotpad/fossilPatterns';
import DotPadPreview from './DotPadPreview';
import BrailleMessageBar from './BrailleMessageBar';
import DotPadConnector from './DotPadConnector';
import GameAssetImage from './GameAssetImage';
import { ASSETS, TOOL_ASSET, CHARACTER_ACTION_ASSET } from '../assets';

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
  onContinue,
}: {
  foundPieces: number; totalPieces: number; fossilName: string;
  brailleMessage: string; onContinue: () => void;
}) {
  return (
    <div className="dg-popup-overlay" role="dialog" aria-modal="true" aria-label="화석 발견!">
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
          <div className="dg-popup-title">화석 조각 발견!</div>
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
            aria-label="계속 발굴"
            style={{ marginTop: 12, padding: '10px 32px' }}
            autoFocus
          >
            계속 발굴
          </button>
        </div>
      </div>
    </div>
  );
}

function DamageWarningPopup({
  damage, completion, currentTool, onContinue,
}: {
  damage: number; completion: number; currentTool: ToolType; onContinue: () => void;
}) {
  const tool = TOOL_DEFS[currentTool];
  return (
    <div className="dg-popup-overlay" role="dialog" aria-modal="true" aria-label="손상 경고">
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
          <div className="dg-popup-title dg-warn-title">화석 손상 위험!</div>
          <p className="dg-popup-msg">
            {'화석이 손상되고 있어요!\n더 부드러운 도구를 사용하거나\n조심스럽게 발굴해주세요.'}
          </p>
          <div className="dg-warn-tool-row">
            <span className="dg-warn-tool-label">현재 도구</span>
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
              <span>손상도</span>
              <div className="dg-warn-bar"><div className="dg-warn-bar-fill damage" style={{ width: `${damage}%` }} /></div>
              <span className="dg-warn-pct" style={{ color: '#c03030' }}>{damage}%</span>
            </div>
            <div className="dg-warn-meter">
              <span>발굴률</span>
              <div className="dg-warn-bar"><div className="dg-warn-bar-fill completion" style={{ width: `${completion}%` }} /></div>
              <span className="dg-warn-pct">{completion}%</span>
            </div>
          </div>
          <button
            className="gw-oval-btn"
            onClick={onContinue}
            aria-label="조심히 계속하기"
            style={{ marginTop: 12, padding: '10px 28px' }}
            autoFocus
          >
            조심히 계속하기
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
  sendGrid: (g: DotGrid) => void;
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

export default function DigScreen({ state, dispatch, dotpadStatus, connect, disconnect, sendGrid, sendRawHex }: DigScreenProps) {
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces, currentTool, characterAction } = state;

  const [digView, setDigView] = useState<DigView>('playing');
  const prevFoundPieces = useRef(state.foundPieces);
  const prevCompletion = useRef(state.completion);

  const dotGrid = useMemo(
    () => renderToDotGrid(state.grid, state.cursor, stage?.width ?? 20, stage?.height ?? 14),
    [state.grid, state.cursor, stage],
  );

  useEffect(() => {
    sendGrid(dotGrid);
  }, [dotGrid, sendGrid]);

  // Fossil piece found popup — also send the fossil's tactile pattern to DotPad
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
      const t = setTimeout(() => dispatch({ type: 'COMPLETE_STAGE' }), 1800);
      return () => clearTimeout(t);
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
        <div className="gw-dig-board-inner">
          <DotPadPreview dotGrid={dotGrid} />
        </div>
      </div>

      {/* ── Right info card ── */}
      <div className="gw-dig-rcard gw-card-frame" aria-label="발굴 정보">
        <div className="gw-card-badge" aria-hidden="true" style={{ marginTop: -17 }} />

        <div className="gw-dig-rcard-body">
          {/* Progress stats */}
          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">발굴 진행도</div>
            <div className="gw-dig-stat-bar">
              <div
                className="gw-dig-bar-fill completion"
                style={{ width: `${completion}%` }}
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`발굴 완료 ${completion}%`}
              />
            </div>
            <div className="gw-dig-stat-val">{completion}%</div>
          </div>

          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">화석 손상도</div>
            <div className="gw-dig-stat-bar">
              <div
                className={`gw-dig-bar-fill damage${damage > 60 ? ' danger' : ''}`}
                style={{ width: `${damage}%` }}
                role="progressbar"
                aria-valuenow={damage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`화석 손상 ${damage}%`}
              />
            </div>
            <div className={`gw-dig-stat-val${damage > 60 ? ' danger' : ''}`}
                 style={damage > 60 ? { color: '#c03030' } : undefined}>
              {damage}%
            </div>
          </div>

          {/* Fossil piece slots */}
          <div className="gw-dig-stat">
            <div className="gw-dig-stat-label">발굴 조각 ({foundPieces}/{totalPieces})</div>
            <div className="gw-dig-piece-slots" aria-label={`${foundPieces}/${totalPieces} 조각 발견`}>
              {Array.from({ length: totalPieces }).map((_, i) => (
                <div key={i} className={`gw-dig-piece-slot${i < foundPieces ? ' found' : ''}`} aria-hidden="true" />
              ))}
            </div>
          </div>

          {/* Mode & cursor position */}
          <div className="gw-dig-stat" aria-live="polite" style={{ color: '#6a4420', fontSize: '0.7rem' }}>
            위치: ({state.cursor.x + 1}, {state.cursor.y + 1}) — {state.mode === 'clue_scan' ? '단서 탐색' : '정밀 발굴'}
          </div>

          <div className="gw-dig-divider" aria-hidden="true" />

          {/* Tool selection */}
          <div className="gw-dig-section-label">도구 선택</div>
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
              aria-label="도감 보기"
            >
              도감 보기
            </button>
            <button
              className="gw-stone-btn"
              style={{ fontSize: '0.82rem', padding: '7px 12px', width: '100%' }}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
              aria-label="메인 메뉴"
            >
              ← 메뉴
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
          aria-label="도구 사용 (Space)"
          style={{ padding: '12px 36px', fontSize: '1rem' }}
        >
          도구 사용
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
        />
      )}

      {/* Stage complete flash */}
      {completion >= 100 && digView === 'playing' && (
        <div className="dg-complete-flash" aria-live="assertive">
          발굴 완료! 결과를 확인합니다...
        </div>
      )}
    </div>
  );
}
