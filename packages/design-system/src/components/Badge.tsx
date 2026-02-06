import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: 'var(--ds-success, #22c55e)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: 'var(--ds-warning, #f59e0b)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--ds-error, #ef4444)',
  },
  info: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: 'var(--ds-info, #3b82f6)',
  },
  neutral: {
    background: 'var(--ds-bg-muted, rgba(29, 26, 22, 0.08))',
    color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: '0.15rem 0.5rem', fontSize: '0.7rem' },
  md: { padding: '0.25rem 0.65rem', fontSize: '0.8rem' },
};

const baseStyle: React.CSSProperties = {
  borderRadius: 'var(--ds-radius-pill, 999px)',
  fontWeight: 600,
  display: 'inline-block',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  style,
  children,
  ...props
}) => {
  return (
    <span
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
