import type { Dispatch } from 'react';
import type { GameAction, ToolType, CharacterAction } from '../types';
import { TOOL_DEFS } from '../data/tools';

const TOOL_LIST: ToolType[] = ['brush', 'careful_dig', 'probe'];

// SVG icons matching the reference gameplay image
function BrushToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="13" y="1" width="3" height="15" rx="1.5" fill="#c8a45a"/>
      <rect x="11" y="13" width="7" height="3.5" rx="1.2" fill="#e8c87a"/>
      <path d="M12 16.5 Q14 25 14 28" stroke="#c8a45a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M14 16.5 Q15.5 24 16 28" stroke="#b8943a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M16 16.5 Q17 24 16.5 28" stroke="#b8943a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function TrowelToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 22 L18 8" stroke="#c8a45a" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 8 L22 4 C23 3 25 3 25 5 C25 7 23 7 22 8 L18 8 Z" fill="#c8a45a"/>
      <path d="M6 22 L4 26 C3.5 27 4.5 28 5.5 27.5 L8 25 Z" fill="#8b6020"/>
      <rect x="4" y="23" width="5" height="3" rx="1" transform="rotate(-45 4 23)" fill="#6b4520"/>
    </svg>
  );
}

function PickaxeToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M8 20 L20 8" stroke="#c8a45a" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 8 C20 8 24 3 26 4 C28 5 23 9 20 8 Z" fill="#c8a45a"/>
      <path d="M20 8 C22 6 25 5 26 4" stroke="#e8c87a" strokeWidth="1" fill="none"/>
      <path d="M8 20 L5 23 C4 24 3 27 5 27 C7 27 8 25 9 24 Z" fill="#8b6020"/>
      <rect x="6" y="21" width="5" height="3" rx="1" transform="rotate(-45 6 21)" fill="#6b4520"/>
    </svg>
  );
}

const TOOL_ICONS: Record<ToolType, () => JSX.Element> = {
  brush: BrushToolIcon,
  careful_dig: TrowelToolIcon,
  probe: PickaxeToolIcon,
};

const ACTION_LABELS: Record<CharacterAction, string> = {
  idle: '대기',
  move: '이동 중',
  brush: '브러싱',
  dig: '발굴 중',
  probe: '탐지 중',
  found: '발견!',
  warning: '주의!',
};

interface ToolPanelProps {
  currentTool: ToolType;
  characterAction: CharacterAction;
  dispatch: Dispatch<GameAction>;
}

export default function ToolPanel({ currentTool, characterAction, dispatch }: ToolPanelProps) {
  return (
    <aside className="tool-panel-overlay" aria-label="도구 패널">
      {TOOL_LIST.map(toolId => {
        const tool = TOOL_DEFS[toolId];
        const isActive = currentTool === toolId;
        const Icon = TOOL_ICONS[toolId];
        return (
          <button
            key={toolId}
            className={`tool-slot-overlay${isActive ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: toolId })}
            aria-pressed={isActive}
            aria-label={`${tool.name} (${tool.shortcut}키)`}
            title={`${tool.name} — ${tool.description}`}
          >
            <span className="tool-slot-overlay-icon"><Icon /></span>
            <div className="tool-slot-overlay-info">
              <span className="tool-slot-overlay-key">{tool.shortcut}</span>
              <span className="tool-slot-overlay-name">{tool.name}</span>
            </div>
          </button>
        );
      })}

      {/* Locked slot */}
      <div className="tool-slot-overlay locked" aria-hidden="true">
        <span className="tool-slot-overlay-icon" style={{ opacity: 0.3 }}>
          <PickaxeToolIcon />
        </span>
        <div className="tool-slot-overlay-info">
          <span className="tool-slot-overlay-name" style={{ fontSize: '0.6rem' }}>잠금</span>
        </div>
      </div>

      {/* Action status */}
      <div
        className="tool-action-status"
        aria-live="polite"
        aria-label={`현재 상태: ${ACTION_LABELS[characterAction]}`}
      >
        <div className={`tool-action-dot action-${characterAction}`} />
        <span>{ACTION_LABELS[characterAction]}</span>
      </div>
    </aside>
  );
}
