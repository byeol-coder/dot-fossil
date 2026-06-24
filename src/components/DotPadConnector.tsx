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
      {!isConnected && onConnectDemo && (
        <button
          className="game-btn game-btn-sm dotpad-demo-btn"
          onClick={onConnectDemo}
          aria-label="DotPad 데모 모드로 연결 (하드웨어 없이 시뮬레이션)"
        >
          데모
        </button>
      )}
      {isConnected && onSelfTest && (
        <button
          className="game-btn game-btn-sm dotpad-selftest-btn"
          onClick={onSelfTest}
          aria-label="DotPad 기기 점검 — 방향 확인용 패턴 순차 출력"
        >
          점검
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
