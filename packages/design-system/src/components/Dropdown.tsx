import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (id: string) => void;
  style?: React.CSSProperties;
}

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  minWidth: 180,
  background: 'var(--ds-white, #fff)',
  border: '1px solid var(--ds-border-medium, rgba(29, 26, 22, 0.15))',
  borderRadius: 'var(--ds-radius-md, 8px)',
  boxShadow: '0 8px 24px rgba(25, 20, 15, 0.12)',
  zIndex: 30,
  padding: '0.25rem 0',
  listStyle: 'none',
};

const itemBase: React.CSSProperties = {
  padding: '0.45rem 0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  color: 'var(--ds-ink, #1d1a16)',
  textAlign: 'left',
  transition: 'background 0.1s ease',
};

const itemHover: React.CSSProperties = {
  background: 'var(--ds-bg-subtle, rgba(29, 26, 22, 0.04))',
};

const itemDisabled: React.CSSProperties = {
  opacity: 0.4,
  cursor: 'not-allowed',
};

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, onSelect, style }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {open && (
        <div style={menuStyle} role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (!item.disabled) {
                  onSelect(item.id);
                  setOpen(false);
                }
              }}
              style={{
                ...itemBase,
                ...(hovered === item.id && !item.disabled ? itemHover : {}),
                ...(item.disabled ? itemDisabled : {}),
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
