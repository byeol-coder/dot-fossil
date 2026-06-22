import type { GameState, ToolType, DigCell, FossilPiece } from '../types';
import { TOOL_DEFS } from '../data/tools';
import { calcDamage } from './damageEngine';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function cellsInRadius(
  cx: number,
  cy: number,
  radius: number,
  width: number,
  height: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

export function applyTool(
  state: GameState,
  tool: ToolType,
): Partial<GameState> {
  const toolDef = TOOL_DEFS[tool];
  const { cursor, grid, fossilPieces } = state;
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  if (tool === 'probe') {
    // Probe: scan surroundings, return message
    const nearby = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);
    const types = new Set<string>();
    for (const pos of nearby) {
      types.add(grid[pos.y][pos.x].type);
    }
    const hasFossil = types.has('fossil');
    const hasRock = types.has('rock');
    const hasCrack = types.has('crack');
    let msg = '주변 탐지: ';
    if (hasFossil) msg += '화석 반응! ';
    if (hasRock) msg += '암석 있음. ';
    if (hasCrack) msg += '균열 발견. ';
    if (!hasFossil && !hasRock && !hasCrack) msg += '일반 토양.';
    return {
      brailleMessage: msg.trim(),
      brailleLabel: '탐침 결과',
      characterAction: 'probe',
    };
  }

  // Dig/brush: modify cells
  const newGrid: DigCell[][] = grid.map(row => row.map(cell => ({ ...cell })));
  const newFossilPieces: FossilPiece[] = fossilPieces.map(fp => ({ ...fp }));
  const affectedCells = cellsInRadius(cursor.x, cursor.y, toolDef.radius, width, height);

  let damagedFossil = false;
  let foundPieceIds: string[] = [];

  for (const pos of affectedCells) {
    const cell = newGrid[pos.y][pos.x];
    if (cell.revealed) continue;

    const newDepth = clamp(cell.depth - toolDef.removeDepth, 0, 2);

    if (newDepth <= 0) {
      // Reveal cell
      if (cell.type === 'fossil') {
        // Check damage risk
        if (toolDef.damageRisk > 0 && Math.random() < toolDef.damageRisk * cell.fragile) {
          const dmg = 0.1 + Math.random() * 0.2;
          newGrid[pos.y][pos.x] = { ...cell, damage: clamp(cell.damage + dmg, 0, 1) };
          damagedFossil = true;
          // Update fossil piece damage
          for (const fp of newFossilPieces) {
            if (fp.cells.some(c => c.x === pos.x && c.y === pos.y)) {
              fp.damage = clamp(fp.damage + dmg, 0, 1);
            }
          }
        }

        // Check if fossil piece fully revealed
        for (const fp of newFossilPieces) {
          if (!fp.found && fp.cells.some(c => c.x === pos.x && c.y === pos.y)) {
            // Mark cell revealed
            newGrid[pos.y][pos.x] = { ...newGrid[pos.y][pos.x], depth: 0, revealed: true };
            // Check if all cells in this piece are now revealed
            const allRevealed = fp.cells.every(c => newGrid[c.y][c.x].revealed || (c.x === pos.x && c.y === pos.y));
            if (allRevealed) {
              fp.found = true;
              foundPieceIds.push(fp.id);
            }
          }
        }
      } else {
        newGrid[pos.y][pos.x] = {
          ...newGrid[pos.y][pos.x],
          depth: 0,
          revealed: true,
          type: 'revealed',
        };
      }
    } else {
      newGrid[pos.y][pos.x] = { ...newGrid[pos.y][pos.x], depth: newDepth };
    }
  }

  const foundPieces = newFossilPieces.filter(fp => fp.found).length;
  const totalPieces = newFossilPieces.length;
  const completion = Math.round((foundPieces / totalPieces) * 100);
  const damage = calcDamage(newFossilPieces);

  let brailleMessage = '';
  let brailleLabel = '';
  let characterAction: GameState['characterAction'] = tool === 'brush' ? 'brush' : 'dig';

  if (foundPieceIds.length > 0) {
    brailleMessage = '화석 발견!';
    brailleLabel = '발굴 성공';
    characterAction = 'found';
  } else if (damagedFossil) {
    brailleMessage = '화석 손상 주의!';
    brailleLabel = '위험';
    characterAction = 'warning';
  } else if (tool === 'brush') {
    brailleMessage = '흙을 털어냈습니다.';
    brailleLabel = '브러시';
  } else {
    brailleMessage = '흙을 파냈습니다.';
    brailleLabel = '발굴';
  }

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
    characterAction,
    completion,
    damage,
    foundPieces,
    totalPieces,
    collectedFossils: newCollected,
  };
}
