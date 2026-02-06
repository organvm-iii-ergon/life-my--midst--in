import React from 'react';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
}

const variantColors: Record<ProgressVariant, string> = {
  default: 'var(--ds-ink, #1d1a16)',
  success: 'var(--ds-success, #22c55e)',
  warning: 'var(--ds-warning, #f59e0b)',
  error: 'var(--ds-error, #ef4444)',
};

const trackStyle: React.CSSProperties = {
  width: '100%',
  height: 8,
  borderRadius: 'var(--ds-radius-pill, 999px)',
  background: 'var(--ds-bg-muted, rgba(29, 26, 22, 0.08))',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  textAlign: 'right',
  marginTop: '0.25rem',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'default',
  showLabel = false,
  style,
  ...props
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${String(clamped)}%`,
    borderRadius: 'var(--ds-radius-pill, 999px)',
    background: variantColors[variant],
    transition: 'width 0.3s ease',
  };

  return (
    <div style={style} {...props}>
      <div
        style={trackStyle}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={fillStyle} />
      </div>
      {showLabel && <div style={labelStyle}>{clamped}%</div>}
    </div>
  );
};
