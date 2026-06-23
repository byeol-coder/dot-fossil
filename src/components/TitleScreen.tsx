import { useEffect, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';

interface TitleScreenProps {
  dispatch: Dispatch<GameAction>;
}

const BrushIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="14" y="2" width="4" height="16" rx="2" fill="#c8a45a"/>
    <rect x="12" y="15" width="8" height="4" rx="1.5" fill="#e8c87a"/>
    <path d="M13 19 Q16 30 16 32" stroke="#c8a45a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M16 19 Q17.5 28 18 32" stroke="#b8943a" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M19 19 Q19.5 28 18.5 32" stroke="#b8943a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="13" cy="13" r="8" stroke="#c8a45a" strokeWidth="2.5" fill="none"/>
    <circle cx="13" cy="13" r="4" fill="rgba(200,164,90,0.25)"/>
    <line x1="19" y1="19" x2="28" y2="28" stroke="#c8a45a" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const FossilIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="11" stroke="#c8a45a" strokeWidth="1.8" fill="none"/>
    <circle cx="16" cy="16" r="7.5" stroke="#c8a45a" strokeWidth="1.4" fill="none"/>
    <circle cx="16" cy="16" r="4" stroke="#c8a45a" strokeWidth="1.2" fill="rgba(200,164,90,0.3)"/>
    <line x1="16" y1="5" x2="16" y2="27" stroke="rgba(200,164,90,0.5)" strokeWidth="0.8"/>
    <line x1="5" y1="16" x2="27" y2="16" stroke="rgba(200,164,90,0.5)" strokeWidth="0.8"/>
    <line x1="8" y1="8" x2="24" y2="24" stroke="rgba(200,164,90,0.35)" strokeWidth="0.8"/>
    <line x1="24" y1="8" x2="8" y2="24" stroke="rgba(200,164,90,0.35)" strokeWidth="0.8"/>
  </svg>
);

const BoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M9 23 L23 9" stroke="#c8a45a" strokeWidth="2.8" strokeLinecap="round"/>
    <circle cx="7" cy="25" r="3.5" fill="#c8a45a"/>
    <circle cx="25" cy="7" r="3.5" fill="#c8a45a"/>
    <circle cx="7" cy="7" r="3" fill="rgba(200,164,90,0.5)" stroke="#c8a45a" strokeWidth="1.2"/>
    <circle cx="25" cy="25" r="3" fill="rgba(200,164,90,0.5)" stroke="#c8a45a" strokeWidth="1.2"/>
  </svg>
);

const BookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="24" height="26" rx="2.5" fill="none" stroke="#c8a45a" strokeWidth="2"/>
    <rect x="4" y="3" width="6" height="26" rx="2" fill="rgba(200,164,90,0.2)" stroke="#8b6020" strokeWidth="1"/>
    <line x1="14" y1="10" x2="23" y2="10" stroke="#c8a45a" strokeWidth="1.4"/>
    <line x1="14" y1="15" x2="23" y2="15" stroke="#c8a45a" strokeWidth="1.4"/>
    <line x1="14" y1="20" x2="21" y2="20" stroke="rgba(200,164,90,0.6)" strokeWidth="1.2"/>
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="3" stroke="#a08050" strokeWidth="1.5" fill="none"/>
    {[0,45,90,135,180,225,270,315].map((deg, i) => (
      <line
        key={i}
        x1={10 + 5 * Math.cos(deg * Math.PI / 180)}
        y1={10 + 5 * Math.sin(deg * Math.PI / 180)}
        x2={10 + 8 * Math.cos(deg * Math.PI / 180)}
        y2={10 + 8 * Math.sin(deg * Math.PI / 180)}
        stroke="#a08050" strokeWidth="2" strokeLinecap="round"
      />
    ))}
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="7" r="4" stroke="#a08050" strokeWidth="1.5" fill="none"/>
    <path d="M3 18 C3 14 6 12 10 12 C14 12 17 14 17 18" stroke="#a08050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const MENU_BUTTONS = [
  { label: '발굴', Icon: BrushIcon, key: 'dig' },
  { label: '탐색', Icon: SearchIcon, key: 'scan' },
  { label: '발견', Icon: FossilIcon, key: 'found' },
  { label: '복원', Icon: BoneIcon, key: 'restore' },
  { label: '수집', Icon: BookIcon, key: 'collect' },
] as const;

export default function TitleScreen({ dispatch }: TitleScreenProps) {
  const [activeBtn, setActiveBtn] = useState(0);

  const handleStart = () => dispatch({ type: 'SET_SCREEN', screen: 'tutorial' });
  const handlePlay = () => dispatch({ type: 'SET_SCREEN', screen: 'fossil-select' });
  const handleCollection = () => dispatch({ type: 'SET_SCREEN', screen: 'collection' });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeBtn === 4) handleCollection();
        else if (activeBtn === 0) handlePlay();
        else handleStart();
      }
      if (e.key === 'ArrowLeft') setActiveBtn(b => Math.max(0, b - 1));
      if (e.key === 'ArrowRight') setActiveBtn(b => Math.min(4, b + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBtn]);

  return (
    <div className="title-screen-img" role="main" aria-label="Dot Fossil 타이틀 화면">
      {/* Reference image fills entire screen */}

      {/* Interactive layer: bottom overlay with menu */}
      <div className="title-bottom-overlay">
        <nav className="title-menu-img" aria-label="메인 메뉴">
          <div className="menu-nav-buttons-img" role="menubar">
            {MENU_BUTTONS.map((btn, i) => (
              <button
                key={btn.key}
                className={`menu-btn-img${i === activeBtn ? ' active' : ''}`}
                role="menuitem"
                aria-current={i === activeBtn ? 'true' : undefined}
                autoFocus={i === 0}
                onClick={() => {
                  setActiveBtn(i);
                  if (btn.key === 'collect') handleCollection();
                  else if (btn.key === 'dig') handlePlay();
                  else handleStart();
                }}
              >
                <span className="menu-btn-img-icon"><btn.Icon /></span>
                <span className="menu-btn-img-label">{btn.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="title-footer-img">
          <button className="footer-icon-btn-img" aria-label="설정">
            <GearIcon />
          </button>
          <span className="footer-enter-hint-img">[ Enter 를 눌러 시작 ]</span>
          <button className="footer-icon-btn-img" aria-label="프로필">
            <ProfileIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
