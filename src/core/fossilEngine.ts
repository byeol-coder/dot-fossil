import type { Stage, DigCell, CellType, Clue, FossilPiece, FossilVisualType } from '../types';

// Simple deterministic pseudo-random using LCG
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function makeCell(x: number, y: number, type: CellType, depth: number, fragile = 0): DigCell {
  return { x, y, type, depth, revealed: false, fragile, damage: 0 };
}

const FOSSIL_VISUAL_TYPE: Record<string, FossilVisualType> = {
  rib:             'rib',
  shell:           'shell',
  skull:           'skull',
  tooth:           'tooth',
  claw:            'claw',
  vertebra:        'vertebra',
  leaf:            'leaf',
  footprint:       'footprint',
  horn:            'horn',
  plate:           'plate',
  fish:            'rib',
  legfoot:         'footprint',
  partialSkeleton: 'skull',
};

export function generateGrid(stage: Stage): {
  grid: DigCell[][];
  clues: Clue[];
  fossilPieces: FossilPiece[];
} {
  const rand = makePrng(42);
  const { width, height } = stage;

  // Build base grid
  const grid: DigCell[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      const r = rand();
      let type: CellType;
      let depth: number;
      if (r < 0.05) {
        type = 'crack';
        depth = 1;
      } else if (r < 0.15) {
        type = 'rock';
        depth = 2;
      } else if (r < 0.35) {
        type = 'hard_soil';
        depth = 2;
      } else {
        type = 'soil';
        depth = 1;
      }
      grid[y][x] = makeCell(x, y, type, depth);
    }
  }

  // Place fossil pieces
  const fossilPieces: FossilPiece[] = [];
  const clues: Clue[] = [];
  const occupiedCells = new Set<string>();

  // Fossil definitions to place — driven by stage.fossils when available
  const fossilsToPlace: { fossilId: string; pieceCount: number }[] =
    stage.fossils.length > 0
      ? stage.fossils.map(f => ({ fossilId: f.fossilId, pieceCount: f.count }))
      : [
          { fossilId: 'rib',   pieceCount: 3 },
          { fossilId: 'shell', pieceCount: 1 },
        ];

  let pieceCounter = 0;

  for (const fossil of fossilsToPlace) {
    const visualType: FossilVisualType = FOSSIL_VISUAL_TYPE[fossil.fossilId] ?? 'rib';

    for (let p = 0; p < fossil.pieceCount; p++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 200) {
        attempts++;
        const fx = Math.floor(rand() * (width - 2)) + 1;
        const fy = Math.floor(rand() * (height - 2)) + 1;
        const key = `${fx},${fy}`;
        if (!occupiedCells.has(key)) {
          occupiedCells.add(key);
          const cells = [{ x: fx, y: fy }];

          // Extend piece by 1 adjacent cell (for multi-cell fossils)
          const directions = [
            { dx: 1, dy: 0 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 0, dy: -1 },
          ];
          const dir = directions[Math.floor(rand() * directions.length)];
          const nx = fx + dir.dx;
          const ny = fy + dir.dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nkey = `${nx},${ny}`;
            if (!occupiedCells.has(nkey)) {
              occupiedCells.add(nkey);
              cells.push({ x: nx, y: ny });
            }
          }

          // Paint cells in grid
          const pieceId = `${fossil.fossilId}_${p}`;
          for (const cell of cells) {
            grid[cell.y][cell.x] = {
              ...grid[cell.y][cell.x],
              type: 'fossil',
              fossilId: fossil.fossilId,
              pieceId,
              depth: 1 + Math.floor(rand() * 2),
              fragile: 0.7,
              fossilRevealProgress: 0,
            };
          }

          fossilPieces.push({
            id: pieceId,
            fossilId: fossil.fossilId,
            visualType,
            cells,
            found: false,
            damage: 0,
            damaged: false,
            revealProgress: 0,
            stage: 'hidden',
          });

          // Create a clue near the fossil
          const clueRadius = 3 + Math.floor(rand() * 2);
          const cx = Math.max(0, Math.min(width - 1, fx + Math.floor((rand() - 0.5) * 3)));
          const cy = Math.max(0, Math.min(height - 1, fy + Math.floor((rand() - 0.5) * 3)));
          if (pieceCounter < 4) {
            const clueDesc =
              visualType === 'rib'   ? '곡선 반응' :
              visualType === 'shell' ? '나선형 반응' :
              visualType === 'tooth' ? '뾰족한 반응' :
              visualType === 'skull' ? '둥근 윤곽 반응' :
              '곡선 반응';
            clues.push({
              id: `clue_${pieceCounter}`,
              x: cx,
              y: cy,
              radius: clueRadius,
              fossilId: fossil.fossilId,
              description: clueDesc,
              discovered: false,
            });
          }

          pieceCounter++;
          placed = true;
        }
      }
    }
  }

  return { grid, clues, fossilPieces };
}
