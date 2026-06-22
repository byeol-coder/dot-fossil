import type { DigCell } from '../types';

interface DigBoardProps {
  grid: DigCell[][];
  cursorX: number;
  cursorY: number;
  stageWidth: number;
  stageHeight: number;
}

export default function DigBoard({ grid, cursorX, cursorY, stageWidth, stageHeight }: DigBoardProps) {
  return (
    <div
      className="dig-board"
      role="grid"
      aria-label="발굴 현장"
      aria-rowcount={stageHeight}
      aria-colcount={stageWidth}
      style={{
        gridTemplateColumns: `repeat(${stageWidth}, 1fr)`,
        gridTemplateRows: `repeat(${stageHeight}, 1fr)`,
      }}
    >
      {grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isCursor = colIdx === cursorX && rowIdx === cursorY;
          const displayType = cell.revealed ? (cell.type === 'fossil' ? 'fossil revealed' : 'revealed') : cell.type;
          return (
            <div
              key={`${colIdx}-${rowIdx}`}
              className={`dig-cell ${displayType} ${isCursor ? 'cursor' : ''}`}
              role="gridcell"
              aria-rowindex={rowIdx + 1}
              aria-colindex={colIdx + 1}
              aria-label={isCursor ? `커서 위치: ${colIdx + 1}행 ${rowIdx + 1}열` : undefined}
              aria-current={isCursor ? 'true' : undefined}
              title={isCursor ? `(${colIdx + 1}, ${rowIdx + 1}) ${cell.type}` : undefined}
            />
          );
        })
      )}
    </div>
  );
}
