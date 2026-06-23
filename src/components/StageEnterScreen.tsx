import { useCallback, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { STAGES } from '../data/stages';
import { ASSETS } from '../assets';
import GameAssetImage from './GameAssetImage';
import { useTranslation } from '../i18n';

interface StageEnterScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export default function StageEnterScreen({ state, dispatch }: StageEnterScreenProps) {
  const { t } = useTranslation();
  const stage = STAGES[state.stageId] ?? STAGES['desert_rib'];

  const enter = useCallback(() => {
    dispatch({ type: 'ENTER_STAGE' });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  return (
    <div
      className="gw-screen se-screen"
      role="main"
      aria-label="발굴지 입장"
      style={{
        backgroundImage: `url('${ASSETS.screens.stageEnterDesert}'), url('${ASSETS.reference.gameplay}')`,
      }}
    >
      <div className="gw-frame" aria-hidden="true" />

      {/* Stage name */}
      <div className="se-title-card" aria-label={`발굴지: ${stage.name}`}>
        <div className="se-title-label">{t('stage.enterTitle')}</div>
        <div className="se-title-name">{stage.name}</div>
        <div className="se-title-sub">{stage.nameEn}</div>
      </div>

      {/* Target */}
      <div className="se-target-card" role="region" aria-label="발굴 목표">
        <div className="se-target-label">{t('stage.todayGoal')}</div>
        <p className="se-target-text">{stage.target}</p>
        <div className="se-target-pieces">
          <span className="se-pieces-num">{stage.totalPieces}</span>
          <span className="se-pieces-label">{t('stage.piecesUnit')}</span>
        </div>
      </div>

      {/* Character */}
      <div className="gw-char-corner" aria-hidden="true">
        <GameAssetImage
          src={ASSETS.character.idle}
          alt=""
          style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

      {/* Speech bubble */}
      <div className="gw-col-bubble se-bubble" role="status" aria-live="polite">
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
          {`${stage.name}${t('stage.enterBubble')}`}
        </p>
      </div>

      {/* Enter button */}
      <div className="se-cta">
        <button
          className="gw-oval-btn"
          onClick={enter}
          aria-label="발굴 시작"
          style={{ padding: '14px 52px', fontSize: '1.1rem' }}
        >
          {t('stage.startBtn')}
        </button>
        <p className="se-hint">{t('stage.keyHint')}</p>
      </div>
    </div>
  );
}
