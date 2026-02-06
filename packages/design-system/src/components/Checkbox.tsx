import React, { useRef, useEffect } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const wrapperStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
};

const boxBase: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 'var(--ds-radius-sm, 4px)',
  border: '2px solid var(--ds-border-strong, rgba(29, 26, 22, 0.25))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.15s ease, border-color 0.15s ease',
};

const boxChecked: React.CSSProperties = {
  background: 'var(--ds-ink, #1d1a16)',
  borderColor: 'var(--ds-ink, #1d1a16)',
};

const checkmark: React.CSSProperties = {
  color: 'var(--ds-white, #fff)',
  fontSize: '0.7rem',
  lineHeight: 1,
  fontWeight: 700,
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  indeterminate = false,
  disabled = false,
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isOn = checked || indeterminate;

  return (
    <label
      style={{
        ...wrapperStyle,
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span style={{ ...boxBase, ...(isOn ? boxChecked : {}) }}>
        {isOn && <span style={checkmark}>{indeterminate ? '\u2014' : '\u2713'}</span>}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
};
