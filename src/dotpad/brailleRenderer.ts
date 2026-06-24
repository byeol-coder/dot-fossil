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
