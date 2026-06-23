import { useState, useCallback } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, FossilPiece } from '../types';
import { FOSSIL_DEFS } from '../data/fossils';
import { ASSETS } from '../assets';
import GameAssetImage from './GameAssetImage';

const FOSSIL_IMG: Record<string, string> = {
  rib:             ASSETS.fossils.rib,
  shell:           ASSETS.fossils.ammonite,
  skull:           ASSETS.fossils.skull,
  leaf:            ASSETS.fossils.leaf,
  skull_demo:      ASSETS.fossils.skull,
  leaf_demo:       ASSETS.fossils.leaf,
  vertebra:        ASSETS.fossils.vertebra,
  claw:            ASSETS.fossils.claw,
  tooth:           ASSETS.fossils.tooth,
  fish:            ASSETS.fossils.fish,
  footprint:       ASSETS.fossils.footprint,
  ammonite:        ASSETS.fossils.ammonite,
  pottery:         ASSETS.fossils.pottery,
  medallion:       ASSETS.fossils.medallion,
  bone_fragment:   ASSETS.fossils.boneFragment,
  legfoot:         ASSETS.fossils.legfoot,
  partialSkeleton: ASSETS.fossils.partialSkeleton,
};

const CARDS_PER_PAGE = 4;

const ALL_FOSSILS = Object.values(FOSSIL_DEFS);

function AmmoniteSVG() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38" fill="none" aria-hidden="true">
      <ellipse cx="26" cy="9" rx="8" ry="5.5" fill="#5a90d0" />
      <ellipse cx="26" cy="8" rx="5.5" ry="3.5" fill="#7ab0ee" opacity="0.7" />
      <ellipse cx="26" cy="7" rx="2.5" ry="1.5" fill="#a8d0ff" opacity="0.6" />
      <path d="M4 22 Q4 9 26 9 Q48 9 48 22" stroke="#9a7840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="4" cy="24" r="3.5" fill="#9a7840" />
      <circle cx="48" cy="24" r="3.5" fill="#9a7840" />
      <path d="M8 30 Q8 22 26 22 Q44 22 44 30" stroke="#7a5820" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

interface CollectionBookProps {
  collectedFossils: string[];
  fossilPieces: FossilPiece[];
  totalPieces: number;
  dispatch: Dispatch<GameAction>;
}

export default function CollectionBook({ collectedFossils, fossilPieces, dispatch }: CollectionBookProps) {
  const [page, setPage] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const totalPages = Math.ceil(ALL_FOSSILS.length / CARDS_PER_PAGE);
  const pageCards = ALL_FOSSILS.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);
  const activeCard = pageCards[activeIdx] ?? pageCards[0];

  const collected = useCallback(
    (id: string) => collectedFossils.includes(id),
    [collectedFossils],
  );

  const piecesFound = activeCard
    ? fossilPieces.filter(fp => fp.fossilId === activeCard.id && fp.found).length
    : 0;

  const speechText = activeCard
    ? collected(activeCard.id)
      ? `${activeCard.name} 발굴 완료!\n도감에 등록됐어요 🎉`
      : piecesFound > 0
        ? `${activeCard.name} ${piecesFound}/${activeCard.pieces} 조각 발굴 중!\n계속 발굴해봐요.`
        : `${activeCard.name}는 아직 미발굴이에요.\n발굴 현장으로 가볼까요?`
    : '화석을 발굴해서\n도감을 채워보자!';

  return (
    <div
      className="gw-screen gw-collection"
      role="main"
      aria-label="화석 도감"
      style={{ backgroundImage: `url('${ASSETS.reference.collection}')` }}
    >
      {/* Wooden border frame */}
      <div className="gw-frame" aria-hidden="true" />

      {/* Stone ammonite banner */}
      <div className="gw-banner" aria-hidden="true">
        <div className="gw-banner-deco" style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <AmmoniteSVG />
        </div>
        <div className="gw-banner-plate">화석 도감</div>
      </div>

      {/* 4-card horizontal strip */}
      <div className="gw-col-cards" role="list" aria-label="화석 카드 목록">
        {pageCards.map((fossil, i) => {
          const isActive = i === activeIdx;
          const isCollected = collected(fossil.id);
          const img = FOSSIL_IMG[fossil.id];
          return (
            <div
              key={fossil.id}
              role="listitem"
              className={`gw-col-card${isActive ? ' active' : ''}${isCollected ? ' collected' : ''}`}
              onClick={() => setActiveIdx(i)}
              aria-label={`${fossil.name} — ${isCollected ? '발굴완료' : '미발굴'}`}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveIdx(i); }}
            >
              {/* Circle badge */}
              <div className={`gw-card-badge${isActive ? ' gold' : ''}`} aria-hidden="true" />

              {/* Card frame */}
              <div className={`gw-col-card-inner gw-card-frame${isActive ? ' gold' : ''}`}>
                {/* Fossil image */}
                <div className="gw-col-card-img-area">
                  {img ? (
                    <GameAssetImage
                      src={img}
                      alt={fossil.name}
                      className="gw-col-card-img"
                      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2rem', opacity: 0.2, color: '#9a7840' }}>?</span>
                  )}
                  {isCollected && (
                    <span className="gw-col-card-found-tag">발굴완료</span>
                  )}
                </div>

                {/* Name label */}
                <div className="gw-col-card-name">{fossil.name}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Character (bottom-left) */}
      <div className="gw-char-corner" aria-hidden="true">
        <GameAssetImage
          src={ASSETS.character.found}
          alt=""
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

      {/* Speech bubble */}
      <div
        className="gw-col-bubble"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="루미의 메시지"
      >
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{speechText}</p>
      </div>

      {/* Bottom nav */}
      <nav className="gw-col-nav" aria-label="화면 이동">
        {page > 0 && (
          <button className="gw-stone-btn" onClick={() => { setPage(p => p - 1); setActiveIdx(0); }} aria-label="이전 페이지">
            ◀
          </button>
        )}
        <button
          className="gw-stone-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'game' })}
          aria-label="발굴 화면으로"
        >
          발굴
        </button>
        <button className="gw-stone-btn active" aria-current="page" aria-label="도감">
          도감
        </button>
        <button
          className="gw-stone-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
          aria-label="홈으로"
        >
          홈
        </button>
        {page < totalPages - 1 && (
          <button className="gw-stone-btn" onClick={() => { setPage(p => p + 1); setActiveIdx(0); }} aria-label="다음 페이지">
            ▶
          </button>
        )}
      </nav>
    </div>
  );
}
