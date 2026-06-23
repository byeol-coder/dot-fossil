import { ASSETS } from '../assets';
import { formatBraille } from '../dotpad/brailleRenderer';

interface BrailleMessageBarProps {
  message: string;
  label: string;
}

export default function BrailleMessageBar({ message, label }: BrailleMessageBarProps) {
  const formatted = formatBraille(message);

  return (
    <div className="braille-panel" role="status" aria-live="polite" aria-label="20셀 점자 메시지">
      {/* Device image as decorative background frame */}
      <img
        src={ASSETS.ui.brailleBar}
        alt=""
        aria-hidden="true"
        className="braille-panel-device-img"
        draggable={false}
      />
      {/* Live content overlay */}
      <div className="braille-panel-content">
        <span className="braille-panel-label">{label}</span>
        <span className="braille-panel-text" aria-label={message}>{formatted}</span>
      </div>
    </div>
  );
}
