import { useMemo, useEffect, useRef } from 'react';
import type { DigCell } from '../types';
import { renderToDotGrid } from '../dotpad/tactilePatterns';
import type { DotGrid } from '../dotpad/tactilePatterns';

interface DotPadPreviewProps {
  grid: DigCell[][];
  cursor: { x: number; y: number; size: 1 | 2 | 5 };
  stageWidth: number;
  stageHeight: number;
}

// Intensity → color mapping for new dark theme
const DOT_COLORS: Record<number, string> = {
  0: '#1a1208', // background (very dark, barely visible)
  1: '#3d2a15', // soil (dark brown muted)
  2: '#6b4f2a', // hard soil / crack
  3: '#b8a882', // fossil (lighter ivory)
  4: '#4a9a9a', // cursor (teal)
};

function DotPadMainCanvas({ dotGrid, dotSize = 6 }: { dotGrid: DotGrid; dotSize?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = dotGrid.length;
    const cols = rows > 0 ? dotGrid[0].length : 0;
    const gap = 1;
    const cellSize = dotSize + gap;

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    // Background: near black
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val = Math.min(4, Math.max(0, dotGrid[y][x]));
        const color = DOT_COLORS[val] ?? '#1a1208';
        const radius = dotSize / 2;
        const cx = x * cellSize + radius;
        const cy = y * cellSize + radius;
        const dotRadius = radius * 0.72;

        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle raised highlight for dots with intensity > 0
        if (val > 0) {
          const grad = ctx.createRadialGradient(
            cx - dotRadius * 0.3, cy - dotRadius * 0.3, 0,
            cx, cy, dotRadius
          );
          grad.addColorStop(0, 'rgba(255,255,255,0.18)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    }
  }, [dotGrid, dotSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="DotPad 촉각 디스플레이 (60×40)"
      role="img"
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    />
  );
}

export default function DotPadPreview({ grid, cursor, stageWidth, stageHeight }: DotPadPreviewProps) {
  const dotGrid = useMemo(
    () => renderToDotGrid(grid, cursor, stageWidth, stageHeight),
    [grid, cursor, stageWidth, stageHeight],
  );

  return (
    <div className="dotpad-main" aria-label="DotPad 촉각 미리보기">
      <DotPadMainCanvas dotGrid={dotGrid} dotSize={6} />
    </div>
  );
}
