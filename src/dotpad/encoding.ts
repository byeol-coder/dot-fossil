import type { DotGrid } from './tactilePatterns';

// 60×40 binary matrix → 300-byte graphic encoding → 600-char HEX string.
// DotPad GRAPHIC-mode pin order per 2×4 cell is COLUMN-MAJOR (NOT 8-dot braille):
//   left  column (x0) rows 0-3 → bits 0,1,2,3
//   right column (x1) rows 0-3 → bits 4,5,6,7
// Verified against the device's own .dtms patterns: byte 0x88 (bits 3 & 7) =
// the bottom row of both columns ("boundary edge, bottom-row pins only"), which
// only holds under this column-major order. This MUST match
// fossilPatterns.hexPatternToDotGrid (the inverse decoder) and the SDK's raw
// graphic-mode output (no braille→graphic remap is applied for GraphicMode).
const BIT_ORDER: { x: number; y: number; bit: number }[] = [
  { x: 0, y: 0, bit: 0 }, { x: 0, y: 1, bit: 1 }, { x: 0, y: 2, bit: 2 }, { x: 0, y: 3, bit: 3 },
  { x: 1, y: 0, bit: 4 }, { x: 1, y: 1, bit: 5 }, { x: 1, y: 2, bit: 6 }, { x: 1, y: 3, bit: 7 },
];

export function encodeMatrixToHex(dotGrid: DotGrid): string {
  const bytes: number[] = [];
  for (let cellY = 0; cellY < 10; cellY++) {
    for (let cellX = 0; cellX < 30; cellX++) {
      const baseX = cellX * 2;
      const baseY = cellY * 4;
      let byte = 0;
      for (const { x, y, bit } of BIT_ORDER) {
        const val = dotGrid[baseY + y]?.[baseX + x] ?? 0;
        if (val > 0) byte |= (1 << bit);
      }
      bytes.push(byte);
    }
  }
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}
