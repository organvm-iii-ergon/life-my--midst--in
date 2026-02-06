import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  rows?: number;
  maxLength?: number;
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  borderRadius: 'var(--ds-radius-sm, 4px)',
  border: '1px solid var(--ds-border-strong, rgba(29, 26, 22, 0.25))',
  background: 'var(--ds-white, #fff)',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  boxSizing: 'border-box',
  resize: 'vertical',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  display: 'block',
  marginBottom: '0.35rem',
};

const countStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  textAlign: 'right',
  marginTop: '0.25rem',
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  rows = 4,
  maxLength,
  id,
  value,
  style,
  ...props
}) => {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} style={labelStyle}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        style={{ ...textareaStyle, ...style }}
        {...props}
      />
      {maxLength != null && (
        <div style={countStyle}>
          {currentLength} / {maxLength}
        </div>
      )}
    </div>
  );
};
