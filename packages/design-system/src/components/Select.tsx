import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  borderRadius: 'var(--ds-radius-sm, 4px)',
  border: '1px solid var(--ds-border-strong, rgba(29, 26, 22, 0.25))',
  background: 'var(--ds-white, #fff)',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  boxSizing: 'border-box',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27%3E%3Cpath d=%27M1 1l5 5 5-5%27 stroke=%27%231d1a16%27 fill=%27none%27/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.65rem center',
  paddingRight: '2rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  display: 'block',
  marginBottom: '0.35rem',
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  id,
  disabled,
  style,
  ...props
}) => {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={selectId} style={labelStyle}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          ...selectStyle,
          ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          ...style,
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
