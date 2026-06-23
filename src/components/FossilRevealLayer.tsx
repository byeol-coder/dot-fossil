import type { FossilPiece, FossilVisualType, RevealStage } from '../types';

// SVG shapes per fossil type — each morphs by stage
function FossilSVG({ visualType, stage }: { visualType: FossilVisualType; stage: RevealStage }) {
  const size = 56;
  const half = size / 2;

  switch (visualType) {
    case 'rib':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <path d="M8 44 Q28 16 48 44" stroke="#d4a850" strokeWidth={stage === 'found' ? 3 : stage === 'almost' ? 2.5 : 2} strokeLinecap="round" fill="none" opacity={stage === 'hint' ? 0.4 : 1} />
              {(stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <path d="M12 40 Q28 22 44 40" stroke="#c49040" strokeWidth={2} strokeLinecap="round" fill="none" />
              )}
              {(stage === 'almost' || stage === 'found') && (
                <path d="M16 36 Q28 26 40 36" stroke="#b08030" strokeWidth={1.5} strokeLinecap="round" fill="none" />
              )}
            </>
          )}
        </svg>
      );

    case 'tooth':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <polygon
                points="28,10 38,44 28,38 18,44"
                stroke="#d4a850"
                strokeWidth={stage === 'found' ? 2.5 : 2}
                fill={stage === 'found' ? 'rgba(212,168,80,0.18)' : stage === 'almost' ? 'rgba(212,168,80,0.1)' : 'none'}
                opacity={stage === 'hint' ? 0.35 : 1}
              />
              {(stage === 'almost' || stage === 'found') && (
                <line x1="28" y1="14" x2="28" y2="40" stroke="#b08030" strokeWidth="1" strokeDasharray="3 2" />
              )}
            </>
          )}
        </svg>
      );

    case 'skull':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <ellipse
                cx={half} cy="24" rx="18" ry="15"
                stroke="#d4a850"
                strokeWidth={stage === 'found' ? 2.5 : 2}
                fill={stage === 'found' ? 'rgba(212,168,80,0.12)' : 'none'}
                opacity={stage === 'hint' ? 0.35 : 1}
              />
              {(stage === 'partial' || stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <>
                  <path d="M20 42 L20 36 Q28 32 36 36 L36 42" stroke="#c49040" strokeWidth="2" fill="none" />
                </>
              )}
              {(stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <>
                  <ellipse cx="21" cy="23" rx="4" ry="4.5" fill="rgba(0,0,0,0.3)" stroke="#a07020" strokeWidth="1" />
                  <ellipse cx="35" cy="23" rx="4" ry="4.5" fill="rgba(0,0,0,0.3)" stroke="#a07020" strokeWidth="1" />
                </>
              )}
            </>
          )}
        </svg>
      );

    case 'shell':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <path d="M28 28 Q36 16 44 28 Q36 40 28 28" stroke="#d4a850" strokeWidth="2" fill="none" opacity={stage === 'hint' ? 0.4 : 1} />
              {(stage === 'partial' || stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <path d="M28 28 Q20 12 12 28 Q20 44 28 28" stroke="#c49040" strokeWidth="2" fill="none" />
              )}
              {(stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <circle cx="28" cy="28" r="4" stroke="#b08030" strokeWidth="1.5" fill="none" />
              )}
              {(stage === 'almost' || stage === 'found') && (
                <>
                  <path d="M28 28 Q44 6 42 28" stroke="#a07020" strokeWidth="1" fill="none" />
                  <path d="M28 28 Q12 50 14 28" stroke="#a07020" strokeWidth="1" fill="none" />
                </>
              )}
            </>
          )}
        </svg>
      );

    case 'claw':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <path
              d="M18 46 Q10 20 30 12 Q46 10 44 30"
              stroke="#d4a850"
              strokeWidth={stage === 'found' ? 3 : 2.5}
              strokeLinecap="round"
              fill="none"
              opacity={stage === 'hint' ? 0.4 : 1}
            />
          )}
          {(stage === 'almost' || stage === 'found') && (
            <path d="M44 30 L48 38 L40 36" stroke="#c49040" strokeWidth="1.5" fill="none" />
          )}
        </svg>
      );

    case 'vertebra':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <line x1="28" y1="8" x2="28" y2="48" stroke="#c49040" strokeWidth="2" opacity={stage === 'hint' ? 0.4 : 0.8} />
              {[12, 22, 32, 42].map((y, i) => (
                (stage === 'hint' && i === 1) ||
                (stage === 'partial' && i <= 2) ||
                (stage === 'clear' || stage === 'almost' || stage === 'found')
              ) ? (
                <rect key={y} x="20" y={y - 4} width="16" height="8" rx="2"
                  stroke="#d4a850" strokeWidth="1.5" fill={stage === 'found' ? 'rgba(212,168,80,0.15)' : 'none'}
                />
              ) : null)}
            </>
          )}
        </svg>
      );

    case 'footprint':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <ellipse cx="28" cy="36" rx="12" ry="9"
                stroke="#d4a850" strokeWidth="2"
                fill={stage === 'found' ? 'rgba(212,168,80,0.12)' : 'none'}
                opacity={stage === 'hint' ? 0.4 : 1}
              />
              {(stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <>
                  {[18, 24, 30, 36].map((x) => (
                    <circle key={x} cx={x} cy="22" r="3" stroke="#c49040" strokeWidth="1.5" fill="none" />
                  ))}
                </>
              )}
            </>
          )}
        </svg>
      );

    case 'horn':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <polygon
              points="28,8 38,46 18,46"
              stroke="#d4a850"
              strokeWidth="2"
              fill={stage === 'found' ? 'rgba(212,168,80,0.12)' : 'none'}
              opacity={stage === 'hint' ? 0.4 : 1}
            />
          )}
        </svg>
      );

    case 'plate':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <polygon
              points="14,44 28,10 42,44"
              stroke="#d4a850"
              strokeWidth="2"
              fill={stage === 'found' ? 'rgba(212,168,80,0.12)' : 'none'}
              opacity={stage === 'hint' ? 0.4 : 1}
            />
          )}
        </svg>
      );

    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
          {stage !== 'hidden' && (
            <>
              <path d="M28 48 Q8 32 16 12 Q28 6 40 12 Q48 32 28 48 Z"
                stroke="#d4a850" strokeWidth="2"
                fill={stage === 'found' ? 'rgba(212,168,80,0.1)' : 'none'}
                opacity={stage === 'hint' ? 0.4 : 1}
              />
              {(stage === 'clear' || stage === 'almost' || stage === 'found') && (
                <line x1="28" y1="48" x2="28" y2="12" stroke="#b08030" strokeWidth="1" />
              )}
              {(stage === 'almost' || stage === 'found') && (
                <>
                  <line x1="28" y1="24" x2="18" y2="18" stroke="#b08030" strokeWidth="0.8" />
                  <line x1="28" y1="32" x2="38" y2="26" stroke="#b08030" strokeWidth="0.8" />
                </>
              )}
            </>
          )}
        </svg>
      );

    default:
      return null;
  }
}

interface FossilRevealLayerProps {
  fossilPieces: FossilPiece[];
  stageWidth: number;
  stageHeight: number;
}

export default function FossilRevealLayer({ fossilPieces, stageWidth, stageHeight }: FossilRevealLayerProps) {
  return (
    <div className="fossil-reveal-layer" aria-hidden="true">
      {fossilPieces.map((piece) => {
        if (piece.stage === 'hidden') return null;

        const avgX = piece.cells.reduce((s, c) => s + c.x, 0) / piece.cells.length;
        const avgY = piece.cells.reduce((s, c) => s + c.y, 0) / piece.cells.length;

        const leftPct = ((avgX + 0.5) / stageWidth) * 100;
        const topPct  = ((avgY + 0.5) / stageHeight) * 100;

        return (
          <div
            key={piece.id}
            className={[
              'fossil-piece-overlay',
              `stage-${piece.stage}`,
              `type-${piece.visualType}`,
              piece.damaged ? 'is-damaged' : '',
            ].filter(Boolean).join(' ')}
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            <FossilSVG visualType={piece.visualType} stage={piece.stage} />
          </div>
        );
      })}
    </div>
  );
}
