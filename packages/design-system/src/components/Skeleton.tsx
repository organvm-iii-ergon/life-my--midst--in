import React from 'react';

export type SkeletonVariant = 'text' | 'card' | 'circle';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const shimmerKeyframes = `
@keyframes ds-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const variantDefaults: Record<SkeletonVariant, { width: string; height: string }> = {
  text: { width: '100%', height: '1em' },
  card: { width: '100%', height: '120px' },
  circle: { width: '48px', height: '48px' },
};

const baseStyle: React.CSSProperties = {
  background:
    'linear-gradient(90deg, var(--ds-bg-muted, rgba(29,26,22,0.08)) 25%, var(--ds-bg-subtle, rgba(29,26,22,0.04)) 50%, var(--ds-bg-muted, rgba(29,26,22,0.08)) 75%)',
  backgroundSize: '200% 100%',
  animation: 'ds-shimmer 1.5s ease-in-out infinite',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  style,
  ...props
}) => {
  const defaults = variantDefaults[variant];

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          ...baseStyle,
          width: width ?? defaults.width,
          height: height ?? defaults.height,
          borderRadius:
            variant === 'circle'
              ? '50%'
              : variant === 'card'
                ? 'var(--ds-radius-md, 8px)'
                : 'var(--ds-radius-sm, 4px)',
          ...style,
        }}
        {...props}
      />
    </>
  );
};
