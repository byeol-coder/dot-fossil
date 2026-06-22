import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, FossilPiece } from '../types';
import { FOSSIL_DEFS } from '../data/fossils';

// ===== Fossil dot patterns (30×20 grid, 0=empty, 1=dot) =====
// Each pattern is a 20-row × 30-col array

const FOSSIL_DOT_PATTERNS: Record<string, number[][]> = {
  rib: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  shell: [
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  skull: [
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,1,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  leaf: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

// Placeholder silhouette pattern (locked fossil)
function makeSilhouette(): number[][] {
  const rows: number[][] = [];
  for (let r = 0; r < 20; r++) {
    const row: number[] = [];
    for (let c = 0; c < 30; c++) {
      const inside = r >= 3 && r <= 16 && c >= 3 && c <= 22;
      row.push(inside ? 1 : 0);
    }
    rows.push(row);
  }
  return rows;
}

const SILHOUETTE_PATTERN = makeSilhouette();

// Canvas dot renderer for fossil cards
interface FossilDotCanvasProps {
  pattern: number[][];
  collected: boolean;
  locked: boolean;
}

function FossilDotCanvas({ pattern, collected, locked }: FossilDotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ROWS = 20;
    const COLS = 30;
    const dotSize = 4;
    const gap = 1;
    const cellSize = dotSize + gap;

    canvas.width = COLS * cellSize;
    canvas.height = ROWS * cellSize;

    // Background
    ctx.fillStyle = '#0d0a05';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = pattern[r]?.[c] ?? 0;
        if (val === 0) continue;

        const cx = c * cellSize + dotSize / 2;
        const cy = r * cellSize + dotSize / 2;
        const radius = dotSize / 2 * 0.75;

        let color: string;
        if (locked) {
          color = '#2a1a0a';
        } else if (collected) {
          color = '#c8b896';
        } else {
          color = '#6b4f2a';
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (!locked && val) {
          const grad = ctx.createRadialGradient(
            cx - radius * 0.3, cy - radius * 0.3, 0,
            cx, cy, radius
          );
          grad.addColorStop(0, 'rgba(255,255,255,0.2)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    }
  }, [pattern, collected, locked]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '150px', height: '100px', imageRendering: 'pixelated' }}
    />
  );
}

// Category tabs data
const CATEGORIES = [
  { id: 'all', icon: '🪨', label: '전체' },
  { id: 'bone', icon: '🦴', label: '뼈 화석' },
  { id: 'shell', icon: '🐚', label: '조개류' },
  { id: 'plant', icon: '🌿', label: '식물' },
  { id: 'skull', icon: '💀', label: '두개골' },
  { id: 'other', icon: '❓', label: '기타' },
];

interface CollectionBookProps {
  collectedFossils: string[];
  fossilPieces: FossilPiece[];
  totalPieces: number;
  dispatch: Dispatch<GameAction>;
}

// Additional demo fossil cards for display richness
const DEMO_FOSSILS = [
  { id: 'skull_demo', name: '두개골 화석', nameEn: 'Skull', pieces: 1, description: '고대 공룡의 두개골 화석', patternKey: 'skull' },
  { id: 'leaf_demo', name: '나뭇잎 화석', nameEn: 'Leaf', pieces: 1, description: '고대 양치식물의 잎 화석', patternKey: 'leaf' },
  { id: 'locked_1', name: '???', nameEn: '???', pieces: 0, description: '아직 발굴되지 않았습니다', patternKey: '__locked__' },
  { id: 'locked_2', name: '???', nameEn: '???', pieces: 0, description: '아직 발굴되지 않았습니다', patternKey: '__locked__' },
];

export default function CollectionBook({ collectedFossils, fossilPieces, totalPieces, dispatch }: CollectionBookProps) {
  const foundPieces = fossilPieces.filter(fp => fp.found).length;
  const completion = totalPieces > 0 ? Math.round((foundPieces / totalPieces) * 100) : 0;

  // Build unified fossil list
  const realFossils = Object.values(FOSSIL_DEFS).map(fd => ({
    id: fd.id,
    name: fd.name,
    nameEn: fd.nameEn,
    pieces: fd.pieces,
    description: fd.description,
    patternKey: fd.id,
    isDemo: false,
  }));

  const demoFossils = DEMO_FOSSILS.map(d => ({ ...d, isDemo: true }));
  const allFossils = [...realFossils, ...demoFossils];

  return (
    <main className="collection-screen" aria-label="화석 도감">
      {/* Left sidebar */}
      <div className="collection-sidebar">
        <div className="collection-sidebar-title">카테고리</div>
        {CATEGORIES.map((cat, idx) => {
          return (
            <div key={cat.id} className={`category-tab${idx === 0 ? ' selected' : ''}`} role="button" tabIndex={0}>
              <div className="category-icon" aria-hidden="true">{cat.icon}</div>
              <div className="category-name">{cat.label}</div>
              <div className="category-progress-bar">
                <div className="category-progress-fill" style={{ width: idx === 0 ? `${completion}%` : '0%' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right main area */}
      <div className="collection-main">
        {/* Header */}
        <div className="collection-header">
          <h1 className="collection-title">화석 도감</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="collection-progress-text">
              {completion}% 완료 ({foundPieces}/{totalPieces} 조각)
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'game' })}
              aria-label="게임으로 돌아가기"
            >
              ← 발굴로
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
              aria-label="타이틀 화면으로 돌아가기"
            >
              🏠 타이틀
            </button>
          </div>
        </div>

        {/* Fossil grid */}
        <div className="fossil-grid">
          {allFossils.map(fossil => {
            const collected = collectedFossils.includes(fossil.id);
            const piecesFound = fossilPieces.filter(fp => fp.fossilId === fossil.id && fp.found).length;
            const isLocked = fossil.patternKey === '__locked__';
            const pattern = isLocked
              ? SILHOUETTE_PATTERN
              : (FOSSIL_DOT_PATTERNS[fossil.patternKey] ?? FOSSIL_DOT_PATTERNS['rib']);

            return (
              <div
                key={fossil.id}
                className={`fossil-card${collected ? ' collected' : ''}${isLocked ? ' locked' : ''}`}
                aria-label={
                  isLocked
                    ? '잠긴 화석'
                    : `${fossil.name} — ${collected ? '완전 발굴' : `${piecesFound}/${fossil.pieces} 조각`}`
                }
              >
                <div className="fossil-card-canvas">
                  <FossilDotCanvas
                    pattern={pattern}
                    collected={collected || piecesFound > 0}
                    locked={isLocked}
                  />
                  {collected && (
                    <div className="fossil-star" aria-hidden="true">⭐</div>
                  )}
                </div>
                <div className="fossil-card-info">
                  <div className="fossil-name">{isLocked ? '???' : fossil.name}</div>
                  <div className="fossil-name-en">{isLocked ? '???' : fossil.nameEn}</div>
                  {!isLocked && (
                    <div className={`fossil-status${collected ? ' complete' : ''}`}>
                      {collected
                        ? '완전 발굴!'
                        : piecesFound > 0
                          ? `${piecesFound}/${fossil.pieces} 조각 발굴`
                          : '미발굴'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom nav */}
        <div className="collection-bottom-nav">
          <button className="collection-tab active" aria-label="도감">
            <span aria-hidden="true">📖</span> 도감
          </button>
          <button className="collection-tab" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'game' })} aria-label="발굴">
            <span aria-hidden="true">⛏️</span> 발굴
          </button>
          <button className="collection-tab" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })} aria-label="타이틀">
            <span aria-hidden="true">🏠</span> 타이틀
          </button>
        </div>
      </div>
    </main>
  );
}
