import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  type?: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

const typeStyles: Record<ToastType, React.CSSProperties> = {
  success: { borderLeft: '4px solid var(--ds-success, #22c55e)' },
  error: { borderLeft: '4px solid var(--ds-error, #ef4444)' },
  info: { borderLeft: '4px solid var(--ds-info, #3b82f6)' },
  warning: { borderLeft: '4px solid var(--ds-warning, #f59e0b)' },
};

const baseStyle: React.CSSProperties = {
  position: 'fixed',
  top: '1.5rem',
  right: '1.5rem',
  zIndex: 50,
  background: 'var(--ds-white, #fff)',
  borderRadius: 'var(--ds-radius-md, 8px)',
  padding: '0.75rem 1rem',
  boxShadow: '0 8px 24px rgba(25, 20, 15, 0.12)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  maxWidth: '380px',
  transition: 'opacity 0.2s ease, transform 0.2s ease',
};

const closeStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  fontSize: '1.1rem',
  lineHeight: 1,
  padding: '0 0 0 0.5rem',
  fontFamily: 'inherit',
};

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  duration = 4000,
  onClose,
  visible = true,
}) => {
  useEffect(() => {
    if (!visible || duration <= 0) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      style={{
        ...baseStyle,
        ...typeStyles[type],
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button style={closeStyle} onClick={onClose} aria-label="Close notification">
          &times;
        </button>
      )}
    </div>
  );
};
