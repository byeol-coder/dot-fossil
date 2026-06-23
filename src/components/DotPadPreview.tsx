import { useEffect, useRef, useCallback } from 'react';
import type { DotGrid } from '../dotpad/tactilePatterns';

// Intensity → color mapping (0=deep dark soil, 4=near-white raised dot)
const DOT_COLORS: Record<number, string> = {
  0: '#0d0a06',
  1: '#2b1c0c',
  2: '#7a5830',
  3: '#d4aa50',
  4: '#f0e8b4',
};

const DOT_COLS = 60;
const DOT_ROWS = 40;

function DotPadCanvas({
  dotGrid, dotSize = 6,
  stageWidth, stageHeight,
  onCellClick,
}: {
  dotGrid: DotGrid;
  dotSize?: number;
  stageWidth?: number;
  stageHeight?: number;
  onCellClick?: (cellX: number, cellY: number) => void;
}) {
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

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick || !stageWidth || !stageHeight) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dotX = ((e.clientX - rect.left) / rect.width) * DOT_COLS;
    const dotY = ((e.clientY - rect.top) / rect.height) * DOT_ROWS;
    const cellX = Math.max(0, Math.min(stageWidth - 1, Math.floor(dotX * stageWidth / DOT_COLS)));
    const cellY = Math.max(0, Math.min(stageHeight - 1, Math.floor(dotY * stageHeight / DOT_ROWS)));
    onCellClick(cellX, cellY);
  }, [onCellClick, stageWidth, stageHeight]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="DotPad 촉각 디스플레이 (60×40) — 클릭하여 커서 이동"
      role="img"
      onClick={onCellClick ? handleClick : undefined}
      style={{
        display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated',
        cursor: onCellClick ? 'crosshair' : 'default',
      }}
    />
  );
}

interface DotPadPreviewProps {
  dotGrid: DotGrid;
  stageWidth?: number;
  stageHeight?: number;
  onCellClick?: (cellX: number, cellY: number) => void;
}

export default function DotPadPreview({ dotGrid, stageWidth, stageHeight, onCellClick }: DotPadPreviewProps) {
  return (
    <div className="dotpad-main" aria-label="DotPad 촉각 미리보기">
      <DotPadCanvas
        dotGrid={dotGrid}
        dotSize={6}
        stageWidth={stageWidth}
        stageHeight={stageHeight}
        onCellClick={onCellClick}
      />
    </div>
  );
}
