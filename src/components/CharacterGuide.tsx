import type { CharacterAction } from '../types';

const ACTION_LABELS: Record<CharacterAction, string> = {
  idle: '대기',
  move: '이동 중',
  brush: '브러싱',
  dig: '발굴 중',
  probe: '탐지 중',
  found: '발견!',
  warning: '주의!',
};

const ACTION_EMOJI: Record<CharacterAction, string> = {
  idle: '🧑‍🔬',
  move: '🏃',
  brush: '🖌️',
  dig: '⛏️',
  probe: '🔍',
  found: '🎉',
  warning: '⚠️',
};

interface CharacterGuideProps {
  action: CharacterAction;
}

export default function CharacterGuide({ action }: CharacterGuideProps) {
  return (
    <div className="character-guide-area" aria-live="polite" aria-label={`캐릭터 상태: ${ACTION_LABELS[action]}`}>
      <div className={`character-avatar char-${action}`} aria-hidden="true">
        <span>{ACTION_EMOJI[action]}</span>
      </div>
      <div className="character-action-label">{ACTION_LABELS[action]}</div>
    </div>
  );
}
