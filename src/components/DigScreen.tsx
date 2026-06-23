import { useMemo, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameAction, ToolType } from '../types';
import { STAGES } from '../data/stages';
import { TOOL_DEFS } from '../data/tools';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import { useDotPad } from '../dotpad/useDotPad';
import DotPadPreview from './DotPadPreview';
import BrailleMessageBar from './BrailleMessageBar';
import DotPadConnector from './DotPadConnector';
import GameAssetImage from './GameAssetImage';
import { ASSETS, TOOL_ASSET } from '../assets';

const TOOL_LIST: ToolType[] = ['brush', 'careful_dig', 'probe'];

interface DigScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
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

export default function DigScreen({ state, dispatch }: DigScreenProps) {
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces, currentTool } = state;

  const dotGrid = useMemo(
    () => renderToDotGrid(state.grid, state.cursor, stage?.width ?? 20, stage?.height ?? 14),
    [state.grid, state.cursor, stage],
  );

  const { status: dotpadStatus, connect, disconnect, sendGrid } = useDotPad(dispatch);

  useEffect(() => {
    sendGrid(dotGrid);
  }, [dotGrid, sendGrid]);

  return (
    <div
      className="gw-screen gw-dig"
      role="main"
      aria-label="발굴 게임 화면"
      style={{ backgroundImage: `url('${ASSETS.reference.gameplay}')` }}
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
      <div className="gw-dig-board" aria-label="발굴 지도">
        <div className="gw-dig-board-inner">
          <DotPadPreview dotGrid={dotGrid} />
        </div>
      </div>

      {/* ── Right info card ── */}
      <div className="gw-dig-rcard gw-card-frame" aria-label="발굴 정보">
        {/* Circle badge */}
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

          {/* Position */}
          <div className="gw-dig-stat" aria-live="polite" style={{ color: '#6a4420', fontSize: '0.7rem' }}>
            위치: ({state.cursor.x + 1}, {state.cursor.y + 1})
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
          src={ASSETS.character[state.characterAction === 'move' ? 'idle' : (state.characterAction as keyof typeof ASSETS.character)] ?? ASSETS.character.idle}
          alt=""
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

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
    </div>
  );
}
