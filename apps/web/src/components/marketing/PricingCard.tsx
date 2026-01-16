import React from 'react';
import { NeoCard } from '@in-midst-my-life/design-system';

export interface PricingCardProps {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  tier,
  name,
  price,
  period = '/mo',
  description,
  features,
  isCurrent = false,
  isPopular = false,
  onSelect,
  loading = false,
  disabled = false,
}: PricingCardProps) {
  const isEnterprise = tier === 'ENTERPRISE';

  // Visual styles based on tier
  const variant = isPopular ? 'cyber' : isEnterprise ? 'obsidian' : 'obsidian';
  const buttonStyle = isCurrent
    ? 'bg-gray-700 text-gray-300 cursor-default'
    : isPopular
      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900';

  return (
    <NeoCard
      variant={variant}
      className={`flex flex-col h-full relative ${isPopular ? 'border-cyan-500 transform scale-105 z-10' : 'border-gray-800'}`}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommended
        </div>
      )}

      <div className="p-6 flex-grow">
        <h3 className={`text-lg font-bold mb-2 ${isPopular ? 'text-cyan-400' : 'text-white'}`}>
          {name}
        </h3>
        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{description}</p>

        <div className="mb-6">
          <span className="text-3xl font-bold text-white">{price}</span>
          {price !== 'Custom' && <span className="text-gray-500 text-sm">{period}</span>}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-sm">
              <span className={`mr-2 ${isPopular ? 'text-cyan-500' : 'text-green-500'}`}>✓</span>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <button
          onClick={onSelect}
          disabled={isCurrent || loading || disabled}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${buttonStyle} ${
            loading ? 'opacity-70 cursor-wait' : ''
          } ${(isCurrent || disabled) && !loading ? 'opacity-50 grayscale' : ''}`}
        >
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          )}
          {loading
            ? 'Redirecting...'
            : isCurrent
              ? 'Current Plan'
              : isEnterprise
                ? 'Contact Sales'
                : 'Upgrade'}
        </button>
      </div>
    </NeoCard>
  );
}
