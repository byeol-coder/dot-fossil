import type { GameState } from '../types';
import { STAGES } from '../data/stages';

interface StageStatusProps {
  state: GameState;
}

const MODE_LABELS = {
  clue_scan: '단서 탐색',
  precision_dig: '정밀 발굴',
  collection: '도감',
};

export default function StageStatus({ state }: StageStatusProps) {
  const stage = STAGES[state.stageId];
  const { completion, damage, foundPieces, totalPieces, mode } = state;

  return (
    <header className="stage-status" role="banner" aria-label="스테이지 상태">
      <span className="stage-name" aria-label={`스테이지: ${stage?.name ?? '알 수 없음'}`}>
        {stage?.name ?? '사막의 작은 갈비뼈'}
      </span>

      <div className="status-bar-item" title={`발굴 완료: ${completion}%`}>
        <span aria-hidden="true">🏺</span>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="발굴 진행도"
        >
          <div className="progress-fill completion" style={{ width: `${completion}%` }} />
        </div>
        <span aria-label={`완료 ${completion}%`}>{completion}%</span>
      </div>

      <div className="status-bar-item" title={`손상도: ${damage}%`}>
        <span aria-hidden="true">⚠️</span>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={damage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="화석 손상도"
        >
          <div className="progress-fill damage" style={{ width: `${damage}%` }} />
        </div>
        <span aria-label={`손상 ${damage}%`} style={{ color: damage > 50 ? 'var(--danger-red)' : undefined }}>
          {damage}%
        </span>
      </div>

      <div className="status-bar-item">
        <span aria-label={`발견 ${foundPieces}개 / 전체 ${totalPieces}개`}>
          발견 {foundPieces}/{totalPieces}
        </span>
      </div>

      <div className="mode-badge" aria-label={`현재 모드: ${MODE_LABELS[mode]}`}>
        {MODE_LABELS[mode]}
      </div>

      <div className="stage-hints" aria-label="단축키 안내">
        <span className="hint-key"><kbd>F1</kbd> 단서</span>
        <span className="hint-key"><kbd>F2</kbd> 발굴</span>
        <span className="hint-key"><kbd>Tab</kbd> 다음</span>
        <span className="hint-key"><kbd>P</kbd> 위치</span>
        <span className="hint-key"><kbd>H</kbd> 힌트</span>
      </div>
    </header>
  );
}
