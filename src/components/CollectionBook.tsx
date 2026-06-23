import type { Dispatch } from 'react';
import type { GameAction, FossilPiece } from '../types';
import { FOSSIL_DEFS } from '../data/fossils';
import { ASSETS } from '../assets';
import GameAssetImage from './GameAssetImage';

// Map fossil id → asset image
const FOSSIL_IMG: Record<string, string> = {
  rib:          ASSETS.fossils.rib,
  shell:        ASSETS.fossils.ammonite,
  skull:        ASSETS.fossils.skull,
  leaf:         ASSETS.fossils.leaf,
  skull_demo:   ASSETS.fossils.skull,
  leaf_demo:    ASSETS.fossils.leaf,
  vertebra:     ASSETS.fossils.vertebra,
  claw:         ASSETS.fossils.claw,
  tooth:        ASSETS.fossils.tooth,
  fish:         ASSETS.fossils.fish,
  footprint:    ASSETS.fossils.footprint,
  ammonite:     ASSETS.fossils.ammonite,
  pottery:      ASSETS.fossils.pottery,
  medallion:    ASSETS.fossils.medallion,
  bone_fragment: ASSETS.fossils.boneFragment,
};

const CATEGORIES = [
  { id: 'all',   label: '전체',   img: ASSETS.fossils.skull },
  { id: 'bone',  label: '뼈 화석', img: ASSETS.fossils.rib },
  { id: 'shell', label: '조개류',  img: ASSETS.fossils.ammonite },
  { id: 'plant', label: '식물',   img: ASSETS.fossils.leaf },
  { id: 'skull', label: '두개골',  img: ASSETS.fossils.skull },
  { id: 'other', label: '기타',   img: ASSETS.fossils.medallion },
];

const DEMO_FOSSILS = [
  { id: 'skull_demo', name: '두개골 화석',  nameEn: 'Skull',     pieces: 1, description: '고대 공룡의 두개골 화석' },
  { id: 'leaf_demo',  name: '나뭇잎 화석',  nameEn: 'Leaf',      pieces: 1, description: '고대 양치식물의 잎 화석' },
  { id: 'locked_1',   name: '???',         nameEn: '???',       pieces: 0, description: '아직 발굴되지 않았습니다' },
  { id: 'locked_2',   name: '???',         nameEn: '???',       pieces: 0, description: '아직 발굴되지 않았습니다' },
  { id: 'locked_3',   name: '???',         nameEn: '???',       pieces: 0, description: '아직 발굴되지 않았습니다' },
  { id: 'locked_4',   name: '???',         nameEn: '???',       pieces: 0, description: '아직 발굴되지 않았습니다' },
];

interface CollectionBookProps {
  collectedFossils: string[];
  fossilPieces: FossilPiece[];
  totalPieces: number;
  dispatch: Dispatch<GameAction>;
}

export default function CollectionBook({ collectedFossils, fossilPieces, totalPieces, dispatch }: CollectionBookProps) {
  const foundPieces = fossilPieces.filter(fp => fp.found).length;
  const completion = totalPieces > 0 ? Math.round((foundPieces / totalPieces) * 100) : 0;

  const realFossils = Object.values(FOSSIL_DEFS).map(fd => ({
    id: fd.id,
    name: fd.name,
    nameEn: fd.nameEn,
    pieces: fd.pieces,
    description: fd.description,
    isLocked: false,
  }));

  const demoFossils = DEMO_FOSSILS.map(d => ({ ...d, isLocked: d.id.startsWith('locked') }));
  const allFossils = [...realFossils, ...demoFossils];

  return (
    <main
      className="collection-screen"
      style={{ backgroundImage: `url('${ASSETS.reference.collection}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      aria-label="화석 도감"
    >
      {/* Dark overlay for readability */}
      <div className="collection-overlay">
        {/* Left sidebar */}
        <aside className="collection-sidebar" aria-label="카테고리">
          <div className="collection-sidebar-title">카테고리</div>
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className={`category-tab${idx === 0 ? ' selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-selected={idx === 0}
            >
              <GameAssetImage
                src={cat.img}
                alt={cat.label}
                width={24}
                height={24}
                style={{ objectFit: 'contain', flexShrink: 0 }}
              />
              <span className="category-name">{cat.label}</span>
              {idx === 0 && (
                <div className="category-progress-bar" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
                  <div className="category-progress-fill" style={{ width: `${completion}%` }} />
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <div className="collection-main">
          {/* Header */}
          <div className="collection-header">
            <h1 className="collection-title">화석 도감</h1>
            <div className="collection-header-right">
              <span className="collection-progress-text">{completion}% 완료 ({foundPieces}/{totalPieces} 조각)</span>
              <button className="game-btn game-btn-secondary" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'game' })} aria-label="게임으로 돌아가기">
                ← 발굴로
              </button>
              <button className="game-btn game-btn-secondary" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })} aria-label="타이틀 화면">
                홈
              </button>
            </div>
          </div>

          {/* Fossil grid */}
          <div className="fossil-grid" role="list">
            {allFossils.map(fossil => {
              const collected = collectedFossils.includes(fossil.id);
              const piecesFound = fossilPieces.filter(fp => fp.fossilId === fossil.id && fp.found).length;
              const fossilImg = FOSSIL_IMG[fossil.id];

              return (
                <div
                  key={fossil.id}
                  role="listitem"
                  className={`fossil-card${collected ? ' collected' : ''}${fossil.isLocked ? ' locked' : ''}`}
                  aria-label={
                    fossil.isLocked
                      ? '미발굴 화석'
                      : `${fossil.name} — ${collected ? '완전 발굴' : `${piecesFound}/${fossil.pieces} 조각`}`
                  }
                >
                  <div className="fossil-card-img-wrap">
                    {fossil.isLocked ? (
                      <div className="fossil-card-locked-icon" aria-hidden="true">
                        <GameAssetImage
                          src={ASSETS.ui.badgeLock}
                          alt="잠금"
                          width={32}
                          height={32}
                          style={{ objectFit: 'contain', opacity: 0.5 }}
                        />
                      </div>
                    ) : fossilImg ? (
                      <GameAssetImage
                        src={fossilImg}
                        alt={fossil.name}
                        className={`fossil-card-img${collected ? '' : ' undiscovered'}`}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="fossil-card-fallback" aria-hidden="true">?</div>
                    )}
                    {collected && (
                      <GameAssetImage
                        src={ASSETS.ui.badgeSilver}
                        alt="발굴 완료"
                        className="fossil-collected-badge"
                        width={28}
                        height={28}
                      />
                    )}
                  </div>
                  <div className="fossil-card-info">
                    <div className="fossil-name">{fossil.isLocked ? '???' : fossil.name}</div>
                    <div className="fossil-name-en">{fossil.isLocked ? '???' : fossil.nameEn}</div>
                    {!fossil.isLocked && (
                      <div className={`fossil-status${collected ? ' complete' : piecesFound > 0 ? ' partial' : ''}`}>
                        {collected ? '완전 발굴!' : piecesFound > 0 ? `${piecesFound}/${fossil.pieces} 조각` : '미발굴'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom nav */}
          <nav className="collection-bottom-nav" aria-label="화면 이동">
            <button className="game-btn game-btn-primary collection-tab active" aria-current="page">
              <GameAssetImage src={ASSETS.tools.backpack} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
              도감
            </button>
            <button className="game-btn game-btn-secondary collection-tab" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'game' })}>
              발굴
            </button>
            <button className="game-btn game-btn-secondary collection-tab" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
              홈
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
}
