// Format text for braille display output
// Korean chars ~2 braille cells, ASCII ~1.
// Limit to fit 20-cell display: ~10 Korean or 20 ASCII chars
export function formatBraille(text: string): string {
  let cellCount = 0;
  let result = '';
  for (const char of text) {
    const isKorean = char >= '가' && char <= '힣';
    const cost = isKorean ? 2 : 1;
    if (cellCount + cost > 20) break;
    result += char;
    cellCount += cost;
  }
  return result;
}

export const BRAILLE_MESSAGES = {
  start: '발굴 준비 완료',
  found: '화석 발견!',
  warning: '화석 손상 주의!',
  complete: '발굴 완료!',
  noClue: '단서 없음',
  soil: '토양',
  hardSoil: '단단한 흙',
  rock: '암석',
  fossil: '화석',
  crack: '균열',
  revealed: '발굴됨',
  brushApplied: '흙을 털어냈습니다.',
  digApplied: '흙을 파냈습니다.',
  probeReady: '탐침 준비',
  moveCursor: '이동',
};
