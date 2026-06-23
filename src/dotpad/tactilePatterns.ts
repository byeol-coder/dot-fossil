import type { DigCell } from '../types';

export type DotGrid = number[][]; // 40 rows × 60 cols, values 0-4

// Sparse noise for soil pattern (deterministic)
function soilPattern(dotX: number, dotY: number): number {
  const v = ((dotX * 17 + dotY * 31) % 7);
  return v < 2 ? 1 : 0;
}

function hardSoilPattern(dotX: number, dotY: number): number {
  const v = ((dotX * 13 + dotY * 23) % 5);
  return v < 3 ? 2 : 1;
}

function rockPattern(dotX: number, dotY: number): number {
  const v = ((dotX * 7 + dotY * 11) % 4);
  return v < 3 ? 3 : 2;
}

function fossilPattern(dotX: number, dotY: number, cellX: number, cellY: number): number {
  // Curve/line pattern: simulate a diagonal curve
  const localX = dotX % 3;
  const localY = dotY % 3;
  const curve = Math.abs(localX - localY) <= 1;
  const bright = ((cellX + cellY) % 2 === 0);
  return curve ? (bright ? 4 : 3) : 2;
}

function crackPattern(dotX: number, dotY: number): number {
  // Zigzag
  const even = (dotY % 2 === 0);
  const offset = even ? 0 : 1;
  return (dotX + offset) % 3 === 0 ? 2 : 0;
}

export function renderToDotGrid(
  grid: DigCell[][],
  cursor: { x: number; y: number; size: 1 | 2 | 5 },
  stageWidth: number,
  stageHeight: number,
): DotGrid {
  const DOT_COLS = 60;
  const DOT_ROWS = 40;

  const scaleX = DOT_COLS / stageWidth;
  const scaleY = DOT_ROWS / stageHeight;

  // Initialize dot grid
  const dots: DotGrid = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));

  for (let dotY = 0; dotY < DOT_ROWS; dotY++) {
    for (let dotX = 0; dotX < DOT_COLS; dotX++) {
      const cellX = Math.floor(dotX / scaleX);
      const cellY = Math.floor(dotY / scaleY);

      if (cellY >= grid.length || cellX >= (grid[0]?.length ?? 0)) continue;

      const cell = grid[cellY][cellX];

      if (cell.revealed) {
        if (cell.type === 'fossil') {
          dots[dotY][dotX] = fossilPattern(dotX, dotY, cellX, cellY);
        } else {
          dots[dotY][dotX] = 0;
        }
        continue;
      }

      if (cell.type === 'fossil') {
        // Progressive reveal: map fossilRevealProgress to tactile intensity
        const progress = cell.fossilRevealProgress ?? 0;
        if (progress >= 50)      dots[dotY][dotX] = fossilPattern(dotX, dotY, cellX, cellY); // 3-4: clear outline
        else if (progress >= 25) dots[dotY][dotX] = 2;  // partial: moderate elevation
        else if (progress > 0)   dots[dotY][dotX] = 2;  // hint: slight elevation
        else                     dots[dotY][dotX] = soilPattern(dotX, dotY); // hidden: soil
        continue;
      }

      switch (cell.type) {
        case 'soil':
          dots[dotY][dotX] = soilPattern(dotX, dotY);
          break;
        case 'hard_soil':
          dots[dotY][dotX] = hardSoilPattern(dotX, dotY);
          break;
        case 'rock':
          dots[dotY][dotX] = rockPattern(dotX, dotY);
          break;
        case 'crack':
          dots[dotY][dotX] = crackPattern(dotX, dotY);
          break;
        default:
          dots[dotY][dotX] = 0;
      }
    }
  }

  // Draw cursor
  const cursorDotX = Math.round(cursor.x * scaleX);
  const cursorDotY = Math.round(cursor.y * scaleY);
  const cursorSize = Math.max(2, Math.round(cursor.size * Math.min(scaleX, scaleY)));

  for (let dy = 0; dy < cursorSize; dy++) {
    for (let dx = 0; dx < cursorSize; dx++) {
      const px = cursorDotX + dx;
      const py = cursorDotY + dy;
      if (px >= 0 && px < DOT_COLS && py >= 0 && py < DOT_ROWS) {
        dots[py][px] = 4;
      }
    }
  }

  return dots;
}
