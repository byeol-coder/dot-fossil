import { useState, useCallback, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, FossilPiece } from '../types';
import { FOSSIL_DEFS } from '../data/fossils';
import { FOSSIL_IMG } from '../data/fossilImages';
import { DINOSAUR_IMG, DINOSAUR_KO } from '../data/dinosaurImages';
import { ASSETS } from '../assets';
import { getFossilPattern } from '../dotpad/fossilPatterns';
import GameAssetImage from './GameAssetImage';
import { useTranslation } from '../i18n';

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
  sendRawHex: (h: string) => void;
}

export default function CollectionBook({ collectedFossils, fossilPieces, dispatch, sendRawHex }: CollectionBookProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const totalPages = Math.ceil(ALL_FOSSILS.length / CARDS_PER_PAGE);
  const pageCards = ALL_FOSSILS.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);
  const activeCard = pageCards[activeIdx] ?? pageCards[0];

  const collected = useCallback(
    (id: string) => collectedFossils.includes(id),
    [collectedFossils],
  );

  // Send tactile pattern to DotPad whenever the active fossil card changes
  useEffect(() => {
    if (!activeCard) return;
    const pattern = getFossilPattern(activeCard.id);
    if (pattern) sendRawHex(pattern);
  }, [activeCard, sendRawHex]);

  // Keyboard + DotPad panning: ←/→ browse fossils across pages, Esc → 타이틀.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const total = ALL_FOSSILS.length;
      const globalIdx = page * CARDS_PER_PAGE + activeIdx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(total - 1, globalIdx + 1);
        setPage(Math.floor(next / CARDS_PER_PAGE));
        setActiveIdx(next % CARDS_PER_PAGE);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(0, globalIdx - 1);
        setPage(Math.floor(prev / CARDS_PER_PAGE));
        setActiveIdx(prev % CARDS_PER_PAGE);
      } else if (e.key === 'Escape') {
        dispatch({ type: 'SET_SCREEN', screen: 'title' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, activeIdx, dispatch]);

  const piecesFound = activeCard
    ? fossilPieces.filter(fp => fp.fossilId === activeCard.id && fp.found).length
    : 0;

  const speechText = activeCard
    ? collected(activeCard.id)
      ? `${activeCard.name} ${t('collection.foundMsg')}`
      : piecesFound > 0
        ? `${activeCard.name} ${piecesFound}/${activeCard.pieces} ${t('collection.progressMsg')}`
        : `${activeCard.name}${t('collection.notStartedMsg')}`
    : t('collection.noFossil');

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
        <div className="gw-banner-plate">{t('collection.title')}</div>
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
              aria-label={`${fossil.name} — ${isCollected ? t('collection.foundTag') : ''}`}
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
                    <span className="gw-col-card-found-tag">{t('collection.foundTag')}</span>
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
        aria-label="도티의 메시지"
      >
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{speechText}</p>
        {activeCard?.dinosaur && DINOSAUR_IMG[activeCard.dinosaur] && (
          <div className="gw-col-dino">
            <GameAssetImage
              src={DINOSAUR_IMG[activeCard.dinosaur]}
              alt={DINOSAUR_KO[activeCard.dinosaur] ?? ''}
              className="gw-col-dino-img"
              multiplyBlend
            />
            <span className="gw-col-dino-label">{DINOSAUR_KO[activeCard.dinosaur]}</span>
          </div>
        )}
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
          aria-label={t('collection.navDig')}
        >
          {t('collection.navDig')}
        </button>
        <button className="gw-stone-btn active" aria-current="page" aria-label={t('collection.navCollection')}>
          {t('collection.navCollection')}
        </button>
        <button
          className="gw-stone-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}
          aria-label={t('collection.navHome')}
        >
          {t('collection.navHome')}
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
