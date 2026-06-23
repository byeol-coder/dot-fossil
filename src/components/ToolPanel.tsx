import type { Dispatch } from 'react';
import type { GameAction, ToolType, CharacterAction } from '../types';
import { TOOL_DEFS } from '../data/tools';
import { ASSETS, CHARACTER_ACTION_ASSET, TOOL_ASSET } from '../assets';
import GameAssetImage from './GameAssetImage';

const TOOL_LIST: ToolType[] = ['brush', 'careful_dig', 'probe'];

const LOCKED_TOOLS = [
  { key: 'hammer',  icon: ASSETS.tools.hammer,         label: '망치' },
  { key: 'pickaxe', icon: ASSETS.tools.pickaxe,        label: '곡괭이' },
  { key: 'kit',     icon: ASSETS.tools.restorationKit, label: '복원킷' },
];

const ACTION_LABELS: Record<CharacterAction, string> = {
  idle:      '대기',
  move:      '이동',
  brush:     '브러싱',
  dig:       '발굴 중',
  probe:     '탐지 중',
  found:     '발견!',
  warning:   '주의!',
  celebrate: '축하!',
};

interface ToolPanelProps {
  currentTool: ToolType;
  characterAction: CharacterAction;
  dispatch: Dispatch<GameAction>;
}

export default function ToolPanel({ currentTool, characterAction, dispatch }: ToolPanelProps) {
  return (
    <aside className="tool-panel-overlay" aria-label="도구 패널">
      {/* Character avatar — state-driven image */}
      <div className="char-avatar-slot" aria-live="polite" aria-label={`탐험가 상태: ${ACTION_LABELS[characterAction]}`}>
        <GameAssetImage
          src={CHARACTER_ACTION_ASSET[characterAction]}
          alt={`탐험가 ${ACTION_LABELS[characterAction]}`}
          className="char-avatar-img"
          width={88}
          height={88}
        />
        <span className={`char-avatar-label action-${characterAction}`}>
          {ACTION_LABELS[characterAction]}
        </span>
      </div>

      {/* Active tools */}
      <div className="tool-divider" aria-hidden="true" />
      <div className="tool-slots-group" role="group" aria-label="사용 가능한 도구">
        {TOOL_LIST.map((toolId) => {
          const tool = TOOL_DEFS[toolId];
          const isActive = currentTool === toolId;
          return (
            <button
              key={toolId}
              className={`tool-slot-overlay${isActive ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: toolId })}
              aria-pressed={isActive}
              aria-label={`${tool.name} — ${tool.shortcut}키`}
              title={tool.description}
            >
              <span className="tool-slot-img-wrap">
                <GameAssetImage
                  src={TOOL_ASSET[toolId]}
                  alt={tool.name}
                  width={44}
                  height={44}
                  style={{ objectFit: 'contain' }}
                />
              </span>
              <span className="tool-slot-meta">
                <span className="tool-slot-key">{tool.shortcut}</span>
                <span className="tool-slot-name">{tool.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Locked tools */}
      <div className="tool-divider" aria-hidden="true" />
      <div className="tool-slots-group locked" aria-label="잠긴 도구">
        {LOCKED_TOOLS.map(lt => (
          <div key={lt.key} className="tool-slot-overlay locked" aria-label={`${lt.label} — 잠금`}>
            <span className="tool-slot-img-wrap">
              <GameAssetImage
                src={lt.icon}
                alt={lt.label}
                width={36}
                height={36}
                style={{ objectFit: 'contain', opacity: 0.35 }}
              />
            </span>
            <span className="tool-slot-meta">
              <span className="tool-slot-name" style={{ opacity: 0.4 }}>{lt.label}</span>
              <GameAssetImage
                src={ASSETS.ui.badgeLock}
                alt="잠금"
                width={14}
                height={14}
                style={{ objectFit: 'contain' }}
              />
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
