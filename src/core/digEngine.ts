import type { GameState, ToolType, DigCell, FossilPiece } from '../types';
import { TOOL_DEFS } from '../data/tools';
import { calcDamage } from './damageEngine';
import { ko } from '../i18n/ko';

// How much fossilRevealProgress each tool adds per use (0-100 scale)
const TOOL_REVEAL_POWER: Record<ToolType, number> = {
  brush:       20,   // ~5 uses to fully reveal
  careful_dig: 34,   // ~3 uses to fully reveal
  probe:        0,   // scan only, no reveal
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function cellsInRadius(
  cx: number, cy: number, radius: number, width: number, height: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) cells.push({ x, y });
    }
  }
  return cells;
}

// Derive a character message from how far along the fossil reveal is
function fossilRevealMessage(progress: number, _tool: ToolType) {
  if (progress >= 100) return { msg: ko.gameplay.fossilFound, braille: ko.braille.fossilFound };
  if (progress >= 50)  return { msg: ko.gameplay.fossilMoreVisible, braille: ko.braille.fossilMoreVisible };
  if (progress >= 25)  return { msg: ko.gameplay.bonePartVisible,   braille: ko.braille.bonePartVisible };
  return { msg: ko.gameplay.boneHint, braille: ko.braille.boneHint };
}

export function applyTool(
  state: GameState,
  tool: ToolType,
): Partial<GameState> {
  const toolDef = TOOL_DEFS[tool];
  const { cursor, grid, fossilPieces } = state;
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  // ── Probe: scan surroundings without modifying cells ──────────────────────
  if (tool === 'probe') {
    const nearby = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);
    const types = new Set<string>();
    for (const pos of nearby) types.add(grid[pos.y][pos.x].type);
    const hasFossil = types.has('fossil');
    const hasRock   = types.has('rock');
    const hasCrack  = types.has('crack');
    let msg = '주변 탐지: ';
    if (hasFossil) msg += `${ko.gameplay.clueCurve}! `;
    if (hasRock)   msg += '암석 있음. ';
    if (hasCrack)  msg += `${ko.gameplay.clueCrack}. `;
    if (!hasFossil && !hasRock && !hasCrack) msg += ko.gameplay.noReaction;
    return {
      brailleMessage: msg.trim(),
      brailleLabel: '탐침 결과',
      dialogueMessage: msg.trim(),
      characterAction: 'probe',
    };
  }

  // ── Dig / Brush ───────────────────────────────────────────────────────────
  const newGrid: DigCell[][] = grid.map(row => row.map(cell => ({ ...cell })));
  const newFossilPieces: FossilPiece[] = fossilPieces.map(fp => ({ ...fp }));
  const affectedCells = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);

  let damagedFossil = false;
  const foundPieceIds: string[] = [];

  // Track best reveal stage seen this action (for message selection)
  let bestRevealProgress = 0;
  let hitFossil = false;

  for (const pos of affectedCells) {
    const cell = newGrid[pos.y][pos.x];
    if (cell.revealed) continue;

    if (cell.type === 'fossil') {
      hitFossil = true;
      const revealPower = TOOL_REVEAL_POWER[tool];
      const prevProgress = cell.fossilRevealProgress ?? 0;
      const nextProgress = clamp(prevProgress + revealPower, 0, 100);
      bestRevealProgress = Math.max(bestRevealProgress, nextProgress);

      let cellDamage = cell.damage;

      // Careful-dig has a chance to damage fragile fossil cells
      if (tool === 'careful_dig' && toolDef.damageRisk > 0 && Math.random() < toolDef.damageRisk * cell.fragile) {
        const dmg = 0.1 + Math.random() * 0.1;
        cellDamage = clamp(cellDamage + dmg, 0, 1);
        damagedFossil = true;
        for (const fp of newFossilPieces) {
          if (fp.cells.some(c => c.x === pos.x && c.y === pos.y)) {
            fp.damage = clamp(fp.damage + dmg, 0, 1);
          }
        }
      }

      newGrid[pos.y][pos.x] = {
        ...cell,
        fossilRevealProgress: nextProgress,
        damage: cellDamage,
      };

      // Fully revealed — mark cell and check if piece is complete
      if (nextProgress >= 100) {
        newGrid[pos.y][pos.x] = { ...newGrid[pos.y][pos.x], depth: 0, revealed: true };

        for (const fp of newFossilPieces) {
          if (!fp.found && fp.cells.some(c => c.x === pos.x && c.y === pos.y)) {
            const allRevealed = fp.cells.every(
              c => newGrid[c.y][c.x].revealed || (c.x === pos.x && c.y === pos.y),
            );
            if (allRevealed) {
              fp.found = true;
              foundPieceIds.push(fp.id);
            }
          }
        }
      }

    } else {
      // Non-fossil cells: depth-based removal
      const newDepth = clamp(cell.depth - toolDef.removeDepth, 0, 2);
      if (newDepth <= 0) {
        newGrid[pos.y][pos.x] = { ...cell, depth: 0, revealed: true, type: 'revealed' };
      } else {
        newGrid[pos.y][pos.x] = { ...cell, depth: newDepth };
      }
    }
  }

  const foundPieces = newFossilPieces.filter(fp => fp.found).length;
  const totalPieces = newFossilPieces.length;
  const completion  = Math.round((foundPieces / Math.max(1, totalPieces)) * 100);
  const damage      = calcDamage(newFossilPieces);

  // ── Pick message based on what happened ───────────────────────────────────
  let brailleMessage = '';
  let brailleLabel   = '';
  let dialogueMessage = '';
  let characterAction: GameState['characterAction'] = tool === 'brush' ? 'brush' : 'dig';

  if (foundPieceIds.length > 0) {
    brailleMessage  = ko.braille.fossilFound;
    brailleLabel    = ko.braille.fossilFound;
    dialogueMessage = ko.gameplay.fossilFound;
    characterAction = 'found';
  } else if (damagedFossil) {
    brailleMessage  = ko.braille.crackWarning;
    brailleLabel    = ko.braille.crackWarning;
    dialogueMessage = ko.gameplay.damageWarning;
    characterAction = 'warning';
  } else if (hitFossil) {
    const { msg, braille } = fossilRevealMessage(bestRevealProgress, tool);
    brailleMessage  = braille;
    brailleLabel    = braille;
    dialogueMessage = msg;
  } else {
    brailleMessage  = ko.braille.soilRemoved;
    brailleLabel    = tool === 'brush' ? ko.tools.brush : '발굴';
    dialogueMessage = ko.gameplay.soilRemoved;
  }

  // Update collection of completed fossils
  const newCollected = [...state.collectedFossils];
  for (const fp of newFossilPieces) {
    if (fp.found && !newCollected.includes(fp.fossilId)) {
      const allPiecesOfFossil = newFossilPieces.filter(p => p.fossilId === fp.fossilId);
      if (allPiecesOfFossil.every(p => p.found)) {
        newCollected.push(fp.fossilId);
      }
    }
  }

  return {
    grid: newGrid,
    fossilPieces: newFossilPieces,
    brailleMessage,
    brailleLabel,
    dialogueMessage,
    characterAction,
    completion,
    damage,
    foundPieces,
    totalPieces,
    collectedFossils: newCollected,
  };
}
