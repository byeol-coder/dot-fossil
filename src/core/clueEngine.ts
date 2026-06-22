import type { GameState } from '../types';

export function getClueMessage(state: GameState): string {
  const { clues, selectedClueIndex, cursor } = state;
  if (clues.length === 0) return '단서 없음';

  const clue = clues[selectedClueIndex % clues.length];
  const dx = Math.abs(cursor.x - clue.x);
  const dy = Math.abs(cursor.y - clue.y);
  const dist = Math.sqrt(dx * dx + dy * dy);

  let proximity = '';
  if (dist < 1) {
    proximity = '바로 이곳!';
  } else if (dist < clue.radius) {
    proximity = '매우 가까움';
  } else if (dist < clue.radius * 2) {
    proximity = '근처';
  } else if (dist < clue.radius * 3) {
    proximity = '멀리';
  } else {
    proximity = '아직 멀리 있음';
  }

  const dirX = cursor.x < clue.x ? '오른쪽' : cursor.x > clue.x ? '왼쪽' : '';
  const dirY = cursor.y < clue.y ? '아래쪽' : cursor.y > clue.y ? '위쪽' : '';
  const direction = [dirX, dirY].filter(Boolean).join(' ');

  return `단서${selectedClueIndex + 1}: ${clue.description} — ${proximity}${direction ? ` (${direction})` : ''}`;
}
