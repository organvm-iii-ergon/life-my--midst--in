import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  style?: React.CSSProperties;
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  borderBottom: '1px solid var(--ds-border-medium, rgba(29, 26, 22, 0.15))',
};

const tabBaseStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  cursor: 'pointer',
  color: 'var(--ds-text-muted, rgba(29, 26, 22, 0.6))',
  transition: 'color 0.15s ease, border-color 0.15s ease',
  marginBottom: '-1px',
};

const tabActiveStyle: React.CSSProperties = {
  color: 'var(--ds-ink, #1d1a16)',
  borderBottomColor: 'var(--ds-ink, #1d1a16)',
  fontWeight: 600,
};

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, style }) => {
  return (
    <div role="tablist" style={{ ...barStyle, ...style }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            style={{
              ...tabBaseStyle,
              ...(isActive ? tabActiveStyle : {}),
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
