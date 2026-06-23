import type { CharacterAction } from '../types';

const ACTION_LABELS: Record<CharacterAction, string> = {
  idle:      '대기',
  move:      '이동 중',
  brush:     '브러싱',
  dig:       '발굴 중',
  probe:     '탐지 중',
  found:     '발견!',
  warning:   '주의!',
  celebrate: '축하!',
};

const ACTION_EMOJI: Record<CharacterAction, string> = {
  idle:      '🧑‍🔬',
  move:      '🏃',
  brush:     '🖌️',
  dig:       '⛏️',
  probe:     '🔍',
  found:     '🎉',
  warning:   '⚠️',
  celebrate: '🎊',
};

interface CharacterAvatarProps {
  action: CharacterAction;
  size?: number;
}

export default function CharacterAvatar({ action, size = 72 }: CharacterAvatarProps) {
  return (
    <div
      className="character-guide-area"
      aria-live="polite"
      aria-label={`캐릭터 상태: ${ACTION_LABELS[action]}`}
    >
      <div
        className={`character-avatar char-${action}`}
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        <span>{ACTION_EMOJI[action]}</span>
      </div>
      <div className="character-action-label">{ACTION_LABELS[action]}</div>
    </div>
  );
}
