import React from 'react';

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '', 
  textClassName = '', 
  light = false,
  onClick
}) {
  const sizeMap = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const px = typeof size === 'number' ? size : (sizeMap[size] || 36);

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id={`c-bg-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#24242B" />
            <stop offset="50%" stopColor="#18181E" />
            <stop offset="100%" stopColor="#0E0E12" />
          </linearGradient>
          <linearGradient id={`c-border-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#D97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2D2D38" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`c-amber-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="25%" stopColor="#FBBF24" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id={`c-road-${px}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Squircle Container */}
        <rect 
          x="6" 
          y="6" 
          width="108" 
          height="108" 
          rx="28" 
          fill={`url(#c-bg-${px})`} 
          stroke={`url(#c-border-${px})`} 
          strokeWidth="2.5" 
        />

        {/* Highway Road Bed */}
        <path d="M 38 94 L 52 40 L 68 40 L 82 94 Z" fill={`url(#c-road-${px})`} />

        {/* Top Crossbar of T */}
        <rect x="22" y="24" width="76" height="16" rx="8" fill={`url(#c-amber-${px})`} />

        {/* GPS Waypoint Node */}
        <circle cx="33" cy="32" r="3.5" fill="#FFFFFF" opacity="0.95" />

        {/* Speed Chevron Arrow */}
        <path d="M 78 27 L 85 32 L 78 37" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Highway Lane Curbs / 'T' Stem */}
        <path d="M 40 94 L 53 42" stroke={`url(#c-amber-${px})`} strokeWidth="7.5" strokeLinecap="round" />
        <path d="M 80 94 L 67 42" stroke={`url(#c-amber-${px})`} strokeWidth="7.5" strokeLinecap="round" />

        {/* Center Dashed Highway Line */}
        <line x1="60" y1="46" x2="60" y2="56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
        <line x1="60" y1="65" x2="60" y2="82" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight ${light ? 'text-[#1C1C1E]' : 'text-white'} ${textClassName || 'text-xl'}`}>
          Transit<span className="text-[#D97706]">Ops</span>
        </span>
      )}
    </div>
  );
}
