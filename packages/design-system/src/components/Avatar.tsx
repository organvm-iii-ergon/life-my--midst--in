import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'offline' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeMap: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 56 };
const fontSizeMap: Record<AvatarSize, string> = { sm: '0.7rem', md: '0.85rem', lg: '1.1rem' };
const dotSizeMap: Record<AvatarSize, number> = { sm: 8, md: 10, lg: 14 };

const statusColorMap: Record<AvatarStatus, string> = {
  online: 'var(--ds-success, #22c55e)',
  offline: 'var(--ds-bg-muted, rgba(29, 26, 22, 0.08))',
  away: 'var(--ds-warning, #f59e0b)',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  initials,
  size = 'md',
  status,
  style,
  ...props
}) => {
  const dim = sizeMap[size];
  const dotDim = dotSizeMap[size];

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: dim,
    height: dim,
    ...style,
  };

  const circleStyle: React.CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--ds-bg-muted, rgba(29, 26, 22, 0.08))',
    color: 'var(--ds-ink, #1d1a16)',
    fontWeight: 600,
    fontSize: fontSizeMap[size],
    fontFamily: 'inherit',
  };

  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: dotDim,
    height: dotDim,
    borderRadius: '50%',
    border: '2px solid var(--ds-white, #fff)',
    background: status ? statusColorMap[status] : 'transparent',
  };

  return (
    <div style={containerStyle} {...props}>
      <div style={circleStyle}>
        {src ? (
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          (initials ?? '?')
        )}
      </div>
      {status && <span style={dotStyle} />}
    </div>
  );
};
