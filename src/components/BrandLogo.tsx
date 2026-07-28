import React from 'react';
import verticalLogo from '../assets/images/pureaty_logo_asset_1785224618420.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  showSubtext?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = 'md',
  showSubtext = true,
  className = ''
}: BrandLogoProps) {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    full: 'h-48 sm:h-56',
  };

  const selectedHeight = heights[size] || heights.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative rounded-xl overflow-hidden bg-black p-0.5 border border-neutral-800/80 shadow-md flex items-center justify-center shrink-0 group-hover:border-emerald-500/60 transition-all">
        <img
          src={verticalLogo}
          alt="PUREATY Tiffin Service Logo"
          className={`${selectedHeight} w-auto object-contain rounded-lg`}
        />
      </div>
      {showSubtext && size !== 'sm' && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-base sm:text-xl font-black tracking-wider text-neutral-900 dark:text-white flex items-center">
            PUREATY<span className="text-emerald-500 font-black animate-pulse">!</span>
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-emerald-500 mt-1 block">
            PREMIUM FOOD TIFFINS
          </span>
        </div>
      )}
    </div>
  );
}


