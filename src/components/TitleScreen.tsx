import { useEffect, useState, type CSSProperties } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';
import { useTranslation } from '../i18n';
import { ASSETS } from '../assets';
import DotPadConnector from './DotPadConnector';
import type { DotPadStatus } from '../dotpad/useDotPad';

interface TitleScreenProps {
  dispatch: Dispatch<GameAction>;
  dotpadStatus: DotPadStatus;
  onConnect: () => void;
  onConnectDemo: () => void;
  onDisconnect: () => void;
}

// ─── Image-sync positioning ──────────────────────────────────────────────────
// Source image native size
const IMG_W = 1672;
const IMG_H = 941;

// Parchment scroll bounding box in source-image pixels
// Measured from 1672×941 intro image with debug markers at 1920×1080
const PARCHMENT = { left: 50, right: 880, top: 355, bottom: 447 } as const;

// Overlay anchor points in source-image pixels (1672×941).
// The new hero art has NO baked-in buttons, so these place VISIBLE controls
// onto the open wood-desk strip along the bottom.
const IMG = {
  buttons: { cx: 760, cy: 872 }, // centre of the 3-button menu row (bottom centre)
  lang:    { cx: 1530, cy: 872 }, // language toggle (bottom right) — same baseline as menu
  dotpad:  { cx: 250,  cy: 864 }, // DotPad connect chip (bottom left) — raised so its tall stack isn't clipped
} as const;

interface ImgTransform { scale: number; ox: number; oy: number; }

function computeTransform(): ImgTransform {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / IMG_W, vh / IMG_H);
  // background-position: center center → equal vertical crop top/bottom
  return { scale, ox: (IMG_W * scale - vw) / 2, oy: (IMG_H * scale - vh) / 2 };
}

// Recomputes whenever the viewport resizes
function useImgTransform(): ImgTransform {
  const [tf, setTf] = useState(computeTransform);
  useEffect(() => {
    const upd = () => setTf(computeTransform());
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
  return tf;
}

// Returns absolute position style centred on the given image-space point
function centredStyle(
  cx: number, cy: number, tf: ImgTransform,
  extra?: CSSProperties
): CSSProperties {
  return {
    position: 'absolute',
    left: cx * tf.scale - tf.ox,
    top:  cy * tf.scale - tf.oy,
    transform: 'translate(-50%, -50%)',
    ...extra,
  };
}

// Compute subtitle style that centres on the VISIBLE portion of the parchment.
// When the viewport is narrow, the image is cropped horizontally (cover),
// so the visible parchment center shifts right — this accounts for that.
function computeSubtitleStyle(tf: ImgTransform): CSSProperties {
  const vw = window.innerWidth;
  // Visible parchment screen extents (clamped to viewport)
  const pLeft  = Math.max(0,  PARCHMENT.left  * tf.scale - tf.ox);
  const pRight = Math.min(vw, PARCHMENT.right * tf.scale - tf.ox);
  const pCx    = (pLeft + pRight) / 2;
  const pCy    = ((PARCHMENT.top + PARCHMENT.bottom) / 2) * tf.scale - tf.oy;
  const pW     = Math.min(pRight - pLeft, vw * 0.52);
  return {
    position:  'absolute',
    left:      pCx,
    top:       pCy,
    transform: 'translate(-50%, -50%)',
    width:     pW,
    minHeight: (PARCHMENT.bottom - PARCHMENT.top) * tf.scale,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const ShovelIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="12.5" y="2" width="3" height="14" rx="1.5" fill="#c8a45a"/>
    <path d="M8 13 Q8 20 14 22 Q20 20 20 13 Z" fill="#c8a45a"/>
    <rect x="13" y="20" width="2" height="7" rx="1" fill="#a07830"/>
  </svg>
);

const BackpackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="5" y="9" width="18" height="16" rx="3" fill="none" stroke="#c8a45a" strokeWidth="2"/>
    <path d="M10 9 Q10 4 14 4 Q18 4 18 9" stroke="#c8a45a" strokeWidth="2" fill="none"/>
    <line x1="5" y1="16" x2="23" y2="16" stroke="#c8a45a" strokeWidth="1.5"/>
    <rect x="11" y="13" width="6" height="3" rx="1.5" fill="#c8a45a" opacity="0.6"/>
  </svg>
);

const GearIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <circle cx="13" cy="13" r="4" stroke="#c8a45a" strokeWidth="2" fill="none"/>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <line
        key={i}
        x1={13 + 6.5 * Math.cos((deg * Math.PI) / 180)}
        y1={13 + 6.5 * Math.sin((deg * Math.PI) / 180)}
        x2={13 + 10 * Math.cos((deg * Math.PI) / 180)}
        y2={13 + 10 * Math.sin((deg * Math.PI) / 180)}
        stroke="#c8a45a" strokeWidth="2.2" strokeLinecap="round"
      />
    ))}
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke="#c8a45a" strokeWidth="1.5" fill="none"/>
    <ellipse cx="9" cy="9" rx="3" ry="7.5" stroke="#c8a45a" strokeWidth="1.2" fill="none"/>
    <line x1="1.5" y1="9" x2="16.5" y2="9" stroke="#c8a45a" strokeWidth="1.2"/>
    <line x1="2.5" y1="5.5" x2="15.5" y2="5.5" stroke="#c8a45a" strokeWidth="1" opacity="0.7"/>
    <line x1="2.5" y1="12.5" x2="15.5" y2="12.5" stroke="#c8a45a" strokeWidth="1" opacity="0.7"/>
  </svg>
);

export default function TitleScreen({ dispatch, dotpadStatus, onConnect, onConnectDemo, onDisconnect }: TitleScreenProps) {
  const { t, lang, setLang } = useTranslation();
  const [activeBtn, setActiveBtn] = useState(0);
  const tf = useImgTransform();

  const BUTTONS = [
    {
      key: 'play',
      Icon: ShovelIcon,
      label: t('intro.menuDig'),
      action: () => dispatch({ type: 'SET_SCREEN', screen: 'fossil-select' }),
    },
    {
      key: 'collection',
      Icon: BackpackIcon,
      label: t('common.collection'),
      action: () => dispatch({ type: 'SET_SCREEN', screen: 'collection' }),
    },
    {
      key: 'settings',
      Icon: GearIcon,
      label: t('common.settings'),
      action: () => dispatch({ type: 'SET_SCREEN', screen: 'tutorial' }),
    },
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setActiveBtn(b => Math.max(0, b - 1));
      if (e.key === 'ArrowRight') setActiveBtn(b => Math.min(2, b + 1));
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        BUTTONS[activeBtn]?.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBtn, lang]);

  // Derived pixel positions — recalculated on every resize via tf
  const subStyle = computeSubtitleStyle(tf);

  // Clamp nav/lang to always stay within viewport (buttons near image bottom may overflow on wide/short displays)
  const vh = window.innerHeight;
  const navStyle: CSSProperties = {
    position:  'absolute',
    left:      IMG.buttons.cx * tf.scale - tf.ox,
    top:       Math.min(IMG.buttons.cy * tf.scale - tf.oy, vh - 70),
    transform: 'translate(-50%, -50%)',
  };
  const langStyle = centredStyle(IMG.lang.cx, IMG.lang.cy, tf, {
    top: Math.min(IMG.lang.cy * tf.scale - tf.oy, vh - 36),
  });
  const dotpadStyle: CSSProperties = {
    position:  'absolute',
    left:      IMG.dotpad.cx * tf.scale - tf.ox,
    top:       Math.min(IMG.dotpad.cy * tf.scale - tf.oy, vh - 30),
    transform: 'translate(-50%, -50%)',
    zIndex:    20,
  };

  return (
    <div
      className="title-new"
      role="main"
      aria-label="Dot Fossil"
      style={{ backgroundImage: `url('${ASSETS.screens.title}')` }}
    >
      {/* ── Subtitle — parchment strip below "Dot Fossil" sign ── */}
      <div className="title-subtitle-wrap" aria-hidden="true" style={subStyle}>
        <span className="title-subtitle-dash">—</span>
        <span className="title-subtitle-text">{t('intro.subtitle')}</span>
        <span className="title-subtitle-dash">—</span>
      </div>

      {/* ── Three menu buttons — visible wood/metal buttons on the open desk ── */}
      <nav className="title-pill-nav" aria-label="메인 메뉴" style={navStyle}>
        {BUTTONS.map((btn, i) => (
          <button
            key={btn.key}
            className={`title-pill-btn${i === activeBtn ? ' active' : ''}`}
            onClick={btn.action}
            aria-label={btn.label}
            aria-current={i === activeBtn ? 'true' : undefined}
            autoFocus={i === 0}
          >
            <span className="title-pill-icon" aria-hidden="true"><btn.Icon /></span>
            <span className="title-pill-label">{btn.label}</span>
          </button>
        ))}
      </nav>

      {/* ── DotPad connect — bottom left ── */}
      <div style={dotpadStyle}>
        <DotPadConnector
          status={dotpadStatus}
          onConnect={onConnect}
          onConnectDemo={onConnectDemo}
          onDisconnect={onDisconnect}
        />
      </div>

      {/* ── Language toggle ── */}
      <button
        className="title-lang-btn"
        onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
        aria-label="언어 전환 / Switch language"
        style={langStyle}
      >
        <GlobeIcon />
        <span>{t(`lang.${lang}`)}</span>
      </button>

      {/* Version label is baked into the new artwork (bottom-left), so no overlay here. */}
    </div>
  );
}
