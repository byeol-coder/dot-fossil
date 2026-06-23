import type { DotGrid } from './tactilePatterns';

// 60×40 binary matrix → 300-byte braille encoding → 600-char HEX string
// Eight-dot braille bit order per 2×4 pin block:
// bit 0: (0,0), bit 1: (0,1), bit 2: (0,2)
// bit 3: (1,0), bit 4: (1,1), bit 5: (1,2)
// bit 6: (0,3), bit 7: (1,3)
const BIT_ORDER: { x: number; y: number; bit: number }[] = [
  { x: 0, y: 0, bit: 0 }, { x: 0, y: 1, bit: 1 }, { x: 0, y: 2, bit: 2 },
  { x: 1, y: 0, bit: 3 }, { x: 1, y: 1, bit: 4 }, { x: 1, y: 2, bit: 5 },
  { x: 0, y: 3, bit: 6 }, { x: 1, y: 3, bit: 7 },
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
