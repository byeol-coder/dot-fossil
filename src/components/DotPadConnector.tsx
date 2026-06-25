import type { DotPadStatus } from '../dotpad/useDotPad';

interface DotPadConnectorProps {
  status: DotPadStatus;
  onConnect: () => void;
  onConnectDemo?: () => void;
  onDisconnect: () => void;
  onSelfTest?: () => void;
}

const STATUS_LABEL: Record<DotPadStatus, string> = {
  disconnected: '미연결',
  connecting:   '연결 중…',
  connected:    '연결됨',
  unsupported:  '미지원',
};

export default function DotPadConnector({ status, onConnect, onConnectDemo, onDisconnect, onSelfTest }: DotPadConnectorProps) {
  const isConnected   = status === 'connected';
  const isBusy        = status === 'connecting';
  const isUnsupported = status === 'unsupported';

  return (
    <div className={`dp-card status-${status}`} aria-label="DotPad 연결 상태">
      <div className="dp-card-header">
        <span className="dp-card-label">DotPad</span>
        <span className="dp-status-dot" aria-hidden="true" />
      </div>
      <div className="dp-status-text" aria-live="polite" aria-atomic="true">
        {STATUS_LABEL[status]}
      </div>
      {isUnsupported ? (
        <div className="dp-unsupported-hint">Chrome/Edge 필요</div>
      ) : (
        <div className="dp-card-actions">
          {!isConnected && (
            <button
              className="dp-action-btn"
              onClick={onConnect}
              disabled={isBusy}
              aria-busy={isBusy}
              aria-label="DotPad 블루투스 연결"
            >
              {isBusy ? '…' : '연결'}
            </button>
          )}
          {!isConnected && onConnectDemo && (
            <button
              className="dp-action-btn"
              onClick={onConnectDemo}
              aria-label="DotPad 데모 모드 (하드웨어 없이 시뮬레이션)"
            >
              데모
            </button>
          )}
          {isConnected && onSelfTest && (
            <button
              className="dp-action-btn"
              onClick={onSelfTest}
              aria-label="DotPad 기기 점검"
            >
              점검
            </button>
          )}
          {isConnected && (
            <button
              className="dp-action-btn"
              onClick={onDisconnect}
              aria-label="DotPad 연결 해제"
            >
              해제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
