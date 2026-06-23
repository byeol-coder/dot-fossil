import type { DigCell } from '../types';
import type { RevealStage, FossilVisualType } from '../types';

export type DotGrid = number[][]; // 40 rows × 60 cols, values 0-4

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

function crackPattern(dotX: number, dotY: number): number {
  const even = (dotY % 2 === 0);
  const offset = even ? 0 : 1;
  return (dotX + offset) % 3 === 0 ? 2 : 0;
}

// ── Per-stage, per-visualType tactile intensity ────────────────────────────

function ribPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const curve = Math.abs((dotX % 6) - (dotY % 6)) <= 1;
  switch (stage) {
    case 'hint':    return curve ? 1 : 0;
    case 'partial': return curve ? 2 : 0;
    case 'clear':   return curve ? 3 : 1;
    case 'almost':  return curve ? 4 : 2;
    case 'found':   return curve ? 4 : (dotX % 3 === 0 ? 2 : 1);
    default:        return soilPattern(dotX, dotY);
  }
}

function toothPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const tip = (dotX % 5 === 2 && dotY % 5 === 0);
  const edge = Math.abs((dotX % 5) - 2) + dotY % 5 <= 2;
  switch (stage) {
    case 'hint':    return tip ? 1 : 0;
    case 'partial': return tip ? 2 : (edge ? 1 : 0);
    case 'clear':   return tip ? 3 : (edge ? 2 : 0);
    case 'almost':  return tip ? 4 : (edge ? 3 : 1);
    case 'found':   return tip ? 4 : (edge ? 3 : 2);
    default:        return soilPattern(dotX, dotY);
  }
}

function skullPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const cx = dotX % 8, cy = dotY % 6;
  const outline = Math.abs(Math.sqrt((cx - 4) ** 2 + (cy - 2.5) ** 2) - 3) < 1.2;
  const eyeSocket = (Math.abs(cx - 2.5) < 1 && Math.abs(cy - 2) < 1) ||
                    (Math.abs(cx - 5.5) < 1 && Math.abs(cy - 2) < 1);
  switch (stage) {
    case 'hint':    return outline ? 1 : 0;
    case 'partial': return outline ? 2 : 0;
    case 'clear':   return outline ? 3 : (eyeSocket ? 1 : 0);
    case 'almost':  return outline ? 4 : (eyeSocket ? 2 : 1);
    case 'found':   return outline ? 4 : (eyeSocket ? 3 : 1);
    default:        return soilPattern(dotX, dotY);
  }
}

function shellPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const r = Math.sqrt((dotX % 8 - 4) ** 2 + (dotY % 8 - 4) ** 2);
  const spiral = Math.abs(r - (((dotX + dotY) % 6) + 1)) < 0.8;
  switch (stage) {
    case 'hint':    return spiral ? 1 : 0;
    case 'partial': return spiral ? 2 : 0;
    case 'clear':   return spiral ? 3 : 1;
    case 'almost':  return spiral ? 4 : 2;
    case 'found':   return spiral ? 4 : 2;
    default:        return soilPattern(dotX, dotY);
  }
}

function clawPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const hook = Math.abs((dotX % 6) - (dotY % 4) * 0.8) < 0.9;
  switch (stage) {
    case 'hint':    return hook ? 1 : 0;
    case 'partial': return hook ? 2 : 0;
    case 'clear':   return hook ? 3 : 1;
    case 'almost':  return hook ? 4 : 2;
    case 'found':   return hook ? 4 : 2;
    default:        return soilPattern(dotX, dotY);
  }
}

function vertebraPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const node = (dotX % 4 === 2) && (dotY % 3 === 1);
  const link = (dotX % 4 === 2) || (dotY % 3 === 1 && dotX % 4 < 3);
  switch (stage) {
    case 'hint':    return node ? 1 : 0;
    case 'partial': return node ? 2 : (link ? 1 : 0);
    case 'clear':   return node ? 3 : (link ? 2 : 0);
    case 'almost':  return node ? 4 : (link ? 3 : 1);
    case 'found':   return node ? 4 : (link ? 3 : 2);
    default:        return soilPattern(dotX, dotY);
  }
}

function genericFossilPattern(dotX: number, dotY: number, stage: RevealStage): number {
  const outline = ((dotX + dotY) % 4 === 0);
  switch (stage) {
    case 'hint':    return outline ? 1 : 0;
    case 'partial': return outline ? 2 : 0;
    case 'clear':   return outline ? 3 : 1;
    case 'almost':  return outline ? 4 : 2;
    case 'found':   return outline ? 4 : 2;
    default:        return soilPattern(dotX, dotY);
  }
}

function tactileForStage(
  dotX: number, dotY: number,
  stage: RevealStage,
  visualType: FossilVisualType,
): number {
  switch (visualType) {
    case 'rib':       return ribPattern(dotX, dotY, stage);
    case 'tooth':     return toothPattern(dotX, dotY, stage);
    case 'skull':     return skullPattern(dotX, dotY, stage);
    case 'shell':     return shellPattern(dotX, dotY, stage);
    case 'claw':      return clawPattern(dotX, dotY, stage);
    case 'vertebra':  return vertebraPattern(dotX, dotY, stage);
    default:          return genericFossilPattern(dotX, dotY, stage);
  }
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

  const dots: DotGrid = Array.from({ length: DOT_ROWS }, () => new Array(DOT_COLS).fill(0));

  for (let dotY = 0; dotY < DOT_ROWS; dotY++) {
    for (let dotX = 0; dotX < DOT_COLS; dotX++) {
      const cellX = Math.floor(dotX / scaleX);
      const cellY = Math.floor(dotY / scaleY);
      if (cellY >= grid.length || cellX >= (grid[0]?.length ?? 0)) continue;

      const cell = grid[cellY][cellX];

      // Fully revealed fossil
      if (cell.revealed && cell.type === 'fossil') {
        dots[dotY][dotX] = tactileForStage(dotX, dotY, 'found', 'rib');
        continue;
      }
      if (cell.revealed) {
        dots[dotY][dotX] = 0;
        continue;
      }

      // Fossil cell — stage-aware tactile
      if (cell.type === 'fossil') {
        const progress = cell.fossilRevealProgress ?? 0;
        // Need visualType — derive from fossilId since DigCell doesn't store it
        const visualType: FossilVisualType =
          cell.fossilId === 'tooth' ? 'tooth' :
          cell.fossilId === 'skull' ? 'skull' :
          cell.fossilId === 'shell' ? 'shell' :
          cell.fossilId === 'claw'  ? 'claw'  :
          cell.fossilId === 'vertebra' ? 'vertebra' :
          'rib';

        const stage =
          progress >= 75 ? 'almost' :
          progress >= 50 ? 'clear'  :
          progress >= 25 ? 'partial' :
          progress > 0   ? 'hint'   : 'hidden';

        if (stage === 'hidden') {
          dots[dotY][dotX] = soilPattern(dotX, dotY);
        } else {
          dots[dotY][dotX] = tactileForStage(dotX, dotY, stage, visualType);
        }
        continue;
      }

      switch (cell.type) {
        case 'soil':      dots[dotY][dotX] = soilPattern(dotX, dotY); break;
        case 'hard_soil': dots[dotY][dotX] = hardSoilPattern(dotX, dotY); break;
        case 'rock':      dots[dotY][dotX] = rockPattern(dotX, dotY); break;
        case 'crack':     dots[dotY][dotX] = crackPattern(dotX, dotY); break;
        default:          dots[dotY][dotX] = 0;
      }
    }
  }

  // Draw cursor (value 4 = highest pin)
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
