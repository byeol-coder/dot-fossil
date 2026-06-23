import { useState } from 'react';

interface GameAssetImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  /** For white-background PNGs placed over dark panels: applies mix-blend-mode:multiply */
  multiplyBlend?: boolean;
}

/**
 * Safe image wrapper — shows a placeholder on load failure.
 * Use multiplyBlend for tool/fossil PNGs that have white backgrounds.
 */
export default function GameAssetImage({
  src,
  alt,
  className,
  style,
  fallback,
  width,
  height,
  multiplyBlend = false,
}: GameAssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`asset-placeholder ${className ?? ''}`}
        role="img"
        aria-label={alt}
        style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
      >
        {fallback ?? <span aria-hidden="true" style={{ opacity: 0.4, fontSize: '0.7em' }}>□</span>}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      draggable={false}
      style={{
        mixBlendMode: multiplyBlend ? 'multiply' : undefined,
        ...style,
      }}
    />
  );
}
