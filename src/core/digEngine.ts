import type { GameState, ToolType, DigCell, FossilPiece } from '../types';
import { getRevealStage } from '../types';
import { TOOL_DEFS } from '../data/tools';
import { calcDamage } from './damageEngine';
import { ko } from '../i18n/ko';

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

// Update piece-level revealProgress/stage from its cells
function syncPieceProgress(fp: FossilPiece, grid: DigCell[][]): void {
  const vals = fp.cells.map(c => grid[c.y]?.[c.x]?.fossilRevealProgress ?? 0);
  fp.revealProgress = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
  fp.stage = getRevealStage(fp.revealProgress);
  fp.damaged = fp.damage > 0.05;
}

// Pick dialogue/braille based on the best reveal stage seen this action
function revealMessages(bestProgress: number) {
  if (bestProgress >= 100) {
    return { dialogue: ko.gameplay.fossilFound, braille: ko.braille.fossilFound };
  }
  if (bestProgress >= 75) {
    return { dialogue: ko.gameplay.almostFound, braille: ko.braille.almostFound };
  }
  if (bestProgress >= 50) {
    return { dialogue: ko.gameplay.fossilMoreVisible, braille: ko.braille.fossilMoreVisible };
  }
  if (bestProgress >= 25) {
    return { dialogue: ko.gameplay.bonePartVisible, braille: ko.braille.bonePartVisible };
  }
  return { dialogue: ko.gameplay.boneHint, braille: ko.braille.boneHint };
}

export function applyTool(
  state: GameState,
  tool: ToolType,
): Partial<GameState> {
  const toolDef = TOOL_DEFS[tool];
  const { cursor, grid, fossilPieces } = state;
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  // ── Probe: scan surroundings, no reveal ────────────────────────────────────
  if (tool === 'probe') {
    const nearby = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);
    const types = new Set<string>();
    for (const pos of nearby) types.add(grid[pos.y][pos.x].type);

    // Direction hints
    const directions = [
      { label: '왼쪽', dx: -1, dy: 0 }, { label: '오른쪽', dx: 1, dy: 0 },
      { label: '위쪽', dx: 0, dy: -1 }, { label: '아래쪽', dx: 0, dy: 1 },
    ];
    const fossilDir = directions.find(d => {
      const nx = cursor.x + d.dx;
      const ny = cursor.y + d.dy;
      return nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx].type === 'fossil';
    });

    let msg = ko.gameplay.probeUsed + ' ';
    if (fossilDir) {
      msg += `${fossilDir.label}에 ${ko.gameplay.clueCurve}!`;
    } else if (types.has('fossil')) {
      msg += ko.gameplay.clueCurve + '!';
    } else if (types.has('rock')) {
      msg += ko.gameplay.rockHit;
    } else if (types.has('crack')) {
      msg += ko.gameplay.clueCrack;
    } else {
      msg += ko.gameplay.noReaction;
    }

    return {
      brailleMessage: ko.braille.probeUsed,
      brailleLabel: '탐침',
      dialogueMessage: msg.trim(),
      characterAction: 'probe',
    };
  }

  // ── Dig / Brush ────────────────────────────────────────────────────────────
  const newGrid: DigCell[][] = grid.map(row => row.map(cell => ({ ...cell })));
  const newFossilPieces: FossilPiece[] = fossilPieces.map(fp => ({ ...fp, cells: fp.cells }));
  const affectedCells = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);

  let damagedFossil = false;
  const foundPieceIds: string[] = [];
  let hitFossil = false;
  let bestRevealProgress = 0;

  for (const pos of affectedCells) {
    const cell = newGrid[pos.y][pos.x];
    if (cell.revealed) continue;

    if (cell.type === 'fossil') {
      hitFossil = true;
      const revealPower = toolDef.revealPower;
      const prevProgress = cell.fossilRevealProgress ?? 0;
      const nextProgress = clamp(prevProgress + revealPower, 0, 100);
      bestRevealProgress = Math.max(bestRevealProgress, nextProgress);

      let cellDamage = cell.damage;

      // careful_dig risks damage when fossil is partially exposed (≥ 50%)
      if (tool === 'careful_dig' && toolDef.damageRisk > 0 && prevProgress >= 50) {
        if (Math.random() < toolDef.damageRisk * cell.fragile) {
          const dmg = 0.1 + Math.random() * 0.1;
          cellDamage = clamp(cellDamage + dmg, 0, 1);
          damagedFossil = true;
          for (const fp of newFossilPieces) {
            if (fp.cells.some(c => c.x === pos.x && c.y === pos.y)) {
              fp.damage = clamp(fp.damage + dmg, 0, 1);
            }
          }
        }
      }

      newGrid[pos.y][pos.x] = {
        ...cell,
        fossilRevealProgress: nextProgress,
        damage: cellDamage,
      };

      // Fully revealed
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

  // Sync piece-level revealProgress/stage from updated cell data
  for (const fp of newFossilPieces) {
    syncPieceProgress(fp, newGrid);
  }

  const foundPieces = newFossilPieces.filter(fp => fp.found).length;
  const totalPieces = newFossilPieces.length;
  const completion  = Math.round((foundPieces / Math.max(1, totalPieces)) * 100);
  const damage      = calcDamage(newFossilPieces);

  // ── Pick message ────────────────────────────────────────────────────────────
  let brailleMessage: string;
  let brailleLabel:   string;
  let dialogueMessage: string;
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
    // Use almost stage character expression
    if (bestRevealProgress >= 75) characterAction = 'found'; // anticipation
    const msgs = revealMessages(bestRevealProgress);
    brailleMessage  = msgs.braille;
    brailleLabel    = msgs.braille;
    dialogueMessage = msgs.dialogue;
  } else {
    brailleMessage  = tool === 'brush' ? ko.braille.brushUsed : ko.braille.carefulDigUsed;
    brailleLabel    = tool === 'brush' ? ko.tools.brush : ko.tools.carefulDig;
    dialogueMessage = tool === 'brush' ? ko.gameplay.brushUsed : ko.gameplay.carefulDigUsed;
  }

  // Update collected fossils list
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
