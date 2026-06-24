// Standalone proof that the DotPad graphic encoding is internally consistent and
// uses the device's column-major cell pin order. Run: node scripts/encoding-selftest.mjs
//
// Mirrors src/dotpad/encoding.ts (encode) and src/dotpad/fossilPatterns.ts
// (hexPatternToDotGrid decode). If these two are exact inverses AND the
// orientation bytes map as the device expects, the live grid will render
// correctly on hardware.

const DOT_ROWS = 40, DOT_COLS = 60;

// COLUMN-MAJOR cell pin order (must match encoding.ts BIT_ORDER):
// left column rows 0-3 -> bits 0,1,2,3 ; right column rows 0-3 -> bits 4,5,6,7
const BIT_ORDER = [
  { x: 0, y: 0, bit: 0 }, { x: 0, y: 1, bit: 1 }, { x: 0, y: 2, bit: 2 }, { x: 0, y: 3, bit: 3 },
  { x: 1, y: 0, bit: 4 }, { x: 1, y: 1, bit: 5 }, { x: 1, y: 2, bit: 6 }, { x: 1, y: 3, bit: 7 },
];

function encodeMatrixToHex(dotGrid) {
  const bytes = [];
  for (let cellY = 0; cellY < 10; cellY++) {
    for (let cellX = 0; cellX < 30; cellX++) {
      const baseX = cellX * 2, baseY = cellY * 4;
      let byte = 0;
      for (const { x, y, bit } of BIT_ORDER) {
        if ((dotGrid[baseY + y]?.[baseX + x] ?? 0) > 0) byte |= (1 << bit);
      }
      bytes.push(byte);
    }
  }
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function hexPatternToDotGrid(hex) {
  const dots = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
  const byteCount = hex.length >> 1;
  for (let i = 0; i < byteCount; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!byte) continue;
    const bRow = Math.floor(i / 30), bCol = i % 30;
    for (let pin = 0; pin < 8; pin++) {
      if ((byte >> pin) & 1) {
        const dotRow = bRow * 4 + (pin & 3);
        const dotCol = bCol * 2 + (pin >> 2);
        if (dotRow < DOT_ROWS && dotCol < DOT_COLS) dots[dotRow][dotCol] = 4;
      }
    }
  }
  return dots;
}

let pass = 0, fail = 0;
const ok  = (name, cond) => { if (cond) { pass++; } else { fail++; console.error('  ✗ FAIL:', name); } };

// 1) Round-trip: a pseudo-random binary 40×60 grid must survive encode→decode.
const g = Array.from({ length: DOT_ROWS }, (_, y) =>
  Array.from({ length: DOT_COLS }, (_, x) => ((x * 17 + y * 31) % 5 < 2 ? 1 : 0)));
const back = hexPatternToDotGrid(encodeMatrixToHex(g));
let identical = true;
for (let y = 0; y < DOT_ROWS; y++)
  for (let x = 0; x < DOT_COLS; x++)
    if ((g[y][x] > 0) !== (back[y][x] > 0)) identical = false;
ok('encode→decode round-trip is identity', identical);

// 2) Output is exactly 300 bytes / 600 hex chars (DotPad320 graphic frame).
ok('600 hex chars (300 cells)', encodeMatrixToHex(g).length === 600);

// 3) Orientation: raise only the top-left pin of cell (0,0) → byte 0 must be 0x01.
const tl = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
tl[0][0] = 1;
ok('top-left pin (0,0) → 0x01', encodeMatrixToHex(tl).slice(0, 2) === '01');

// 4) Orientation: bottom row of cell (0,0) = pins (0,3)&(1,3) → byte 0 must be 0x88.
const br = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
br[3][0] = 1; br[3][1] = 1;
ok('bottom-row pins (y3) → 0x88 (matches .dtms boundary)', encodeMatrixToHex(br).slice(0, 2) === '88');

// 5) Orientation: full left column of cell (0,0) → 0x0F ; full right column → 0xF0.
const lc = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
for (let y = 0; y < 4; y++) lc[y][0] = 1;
ok('left column → 0x0F', encodeMatrixToHex(lc).slice(0, 2) === '0F');
const rc = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
for (let y = 0; y < 4; y++) rc[y][1] = 1;
ok('right column → 0xF0', encodeMatrixToHex(rc).slice(0, 2) === 'F0');

// 6) Cell byte order is row-major: a dot in cell (cellX=1,cellY=0) → byte index 1.
const c1 = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));
c1[0][2] = 1; // cellX=1 (cols 2-3), cellY=0, top-left of that cell
ok('cell (1,0) → byte index 1', encodeMatrixToHex(c1).slice(0, 4) === '0001');

console.log(`\nencoding self-test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
