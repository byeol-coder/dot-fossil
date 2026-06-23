import type { DotPadStatus } from '../dotpad/useDotPad';

interface DotPadConnectorProps {
  status: DotPadStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

const STATUS_LABEL: Record<DotPadStatus, string> = {
  disconnected: '미연결',
  connecting:   '연결 중…',
  connected:    '연결됨',
  unsupported:  '미지원',
};

export default function DotPadConnector({ status, onConnect, onDisconnect }: DotPadConnectorProps) {
  const isConnected = status === 'connected';
  const isBusy = status === 'connecting';
  const isUnsupported = status === 'unsupported';

  return (
    <div className="dotpad-connector" aria-label="DotPad 하드웨어 연결">
      <span className={`dotpad-status-pill status-${status}`} aria-live="polite" aria-atomic="true">
        <span className="dotpad-status-dot" aria-hidden="true" />
        DotPad {STATUS_LABEL[status]}
      </span>
      {!isConnected && !isUnsupported && (
        <button
          className="game-btn game-btn-sm dotpad-connect-btn"
          onClick={onConnect}
          disabled={isBusy}
          aria-busy={isBusy}
          aria-label="DotPad 블루투스 연결"
        >
          {isBusy ? '연결 중…' : '연결'}
        </button>
      )}
      {isConnected && (
        <button
          className="game-btn game-btn-sm dotpad-disconnect-btn"
          onClick={onDisconnect}
          aria-label="DotPad 연결 해제"
        >
          해제
        </button>
      )}
      {isUnsupported && (
        <span className="dotpad-unsupported-hint">Chrome/Edge 필요</span>
      )}
    </div>
  );
}
