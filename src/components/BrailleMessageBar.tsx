import { formatBraille } from '../dotpad/brailleRenderer';

interface BrailleMessageBarProps {
  message: string;
  label: string;
}

export default function BrailleMessageBar({ message, label }: BrailleMessageBarProps) {
  const formatted = formatBraille(message);
  return (
    <div className="braille-bar" role="status" aria-live="polite" aria-label="점자 메시지 표시줄">
      <span className="braille-label" aria-hidden="true">점자 메시지 — {label}</span>
      <span className="braille-message" aria-label={message}>{formatted}</span>
    </div>
  );
}
