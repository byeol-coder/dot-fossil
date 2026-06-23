import { useEffect, useRef } from 'react';
import type { DotGrid } from '../dotpad/tactilePatterns';

// Intensity → color mapping
const DOT_COLORS: Record<number, string> = {
  0: '#1a1208',
  1: '#3d2a15',
  2: '#6b4f2a',
  3: '#b8a882',
  4: '#4a9a9a',
};

function DotPadCanvas({ dotGrid, dotSize = 6 }: { dotGrid: DotGrid; dotSize?: number }) {
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

        if (val > 0) {
          const grad = ctx.createRadialGradient(
            cx - dotRadius * 0.3, cy - dotRadius * 0.3, 0,
            cx, cy, dotRadius,
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

interface DotPadPreviewProps {
  dotGrid: DotGrid;
}

export default function DotPadPreview({ dotGrid }: DotPadPreviewProps) {
  return (
    <div className="dotpad-main" aria-label="DotPad 촉각 미리보기">
      <DotPadCanvas dotGrid={dotGrid} dotSize={6} />
    </div>
  );
}
