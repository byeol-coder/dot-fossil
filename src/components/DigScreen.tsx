import { useMemo, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameAction } from '../types';
import { STAGES } from '../data/stages';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import { useDotPad } from '../dotpad/useDotPad';
import ToolPanel from './ToolPanel';
import DotPadPreview from './DotPadPreview';
import BrailleMessageBar from './BrailleMessageBar';
import DotPadConnector from './DotPadConnector';

interface DigScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

function CompassIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="rgba(15,10,4,0.7)" stroke="#c8a45a" strokeWidth="1.2"/>
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(200,164,90,0.3)" strokeWidth="0.5"/>
      <polygon points="24,8 26,24 24,26 22,24" fill="#e8c87a"/>
      <polygon points="24,40 26,24 24,22 22,24" fill="#4a3520"/>
      <circle cx="24" cy="24" r="2.5" fill="#c8a45a"/>
      <text x="24" y="14" textAnchor="middle" fill="#e8c87a" fontSize="5" fontWeight="bold">N</text>
    </svg>
  );
}

function FossilSlotIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="10" stroke="#c8a45a" strokeWidth="1.2" fill="none"/>
      <circle cx="14" cy="14" r="6" stroke="#c8a45a" strokeWidth="1" fill="none"/>
      <circle cx="14" cy="14" r="3" fill="rgba(200,164,90,0.3)"/>
    </svg>
  );
}

export default function DigScreen({ state, dispatch }: DigScreenProps) {
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces } = state;

  // Lift dotGrid so both canvas and hardware DotPad share the same data
  const dotGrid = useMemo(
    () => renderToDotGrid(state.grid, state.cursor, stage?.width ?? 20, stage?.height ?? 14),
    [state.grid, state.cursor, stage],
  );

  // DotPad hardware connection
  const { status: dotpadStatus, connect, disconnect, sendGrid } = useDotPad(dispatch);

  // Mirror game state to hardware on every grid/cursor change
  useEffect(() => {
    sendGrid(dotGrid);
  }, [dotGrid, sendGrid]);

  return (
    <div
      className="game-screen-img"
      role="main"
      aria-label="발굴 게임 화면"
    >
      {/* ── Left: Tool panel overlay ── */}
      <ToolPanel
        currentTool={state.currentTool}
        characterAction={state.characterAction}
        dispatch={dispatch}
      />

      {/* ── Center: DotPad canvas overlay ── */}
      <div className="game-dotpad-overlay">
        <DotPadPreview dotGrid={dotGrid} />
      </div>

      {/* ── Right: Stats + items overlay ── */}
      <aside className="game-stats-overlay" aria-label="게임 정보">
        {/* Compass */}
        <div className="game-compass-slot" aria-hidden="true">
          <CompassIcon />
        </div>

        {/* Progress */}
        <div className="game-stat-block">
          <div className="game-stat-label">발굴</div>
          <div className="game-stat-bar">
            <div
              className="game-stat-fill completion"
              style={{ width: `${completion}%` }}
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`발굴 완료 ${completion}%`}
            />
          </div>
          <div className="game-stat-value">{completion}%</div>
        </div>

        <div className="game-stat-block">
          <div className="game-stat-label">손상</div>
          <div className="game-stat-bar">
            <div
              className={`game-stat-fill damage${damage > 60 ? ' danger' : ''}`}
              style={{ width: `${damage}%` }}
              role="progressbar"
              aria-valuenow={damage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`화석 손상 ${damage}%`}
            />
          </div>
          <div className={`game-stat-value${damage > 60 ? ' danger' : ''}`}>{damage}%</div>
        </div>

        {/* Fossil piece slots */}
        <div className="game-fossil-slots" aria-label={`발견 조각 ${foundPieces}/${totalPieces}`}>
          {Array.from({ length: totalPieces }).map((_, i) => (
            <div key={i} className={`game-fossil-slot${i < foundPieces ? ' found' : ''}`}>
              <FossilSlotIcon />
            </div>
          ))}
        </div>

        {/* Position indicator */}
        <div className="game-pos-label" aria-live="polite">
          <span>({state.cursor.x + 1}, {state.cursor.y + 1})</span>
        </div>

        {/* DotPad hardware connector */}
        <DotPadConnector
          status={dotpadStatus}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* Nav buttons */}
        <button
          className="game-nav-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'collection' })}
          aria-label="도감 보기"
        >
          도감
        </button>
        <button
          className="game-nav-btn secondary"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
          aria-label="메인 메뉴"
        >
          ← 메뉴
        </button>
      </aside>

      {/* ── Bottom: Braille message bar overlay ── */}
      <div className="game-braille-overlay">
        <BrailleMessageBar message={state.brailleMessage} label={state.brailleLabel} />
      </div>
    </div>
  );
}
