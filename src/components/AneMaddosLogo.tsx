import React from 'react';

interface AneMaddosLogoProps {
  variant?: 'icon' | 'full' | 'badge' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  animated?: boolean;
}

export const AneMaddosLogo: React.FC<AneMaddosLogoProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  showSubtitle = true,
  animated = false,
}) => {
  // Size dimensions for icon
  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-14 h-14';
      case 'xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  // Dedicated Vector Icon Mark
  const IconMark = () => (
    <div className={`relative shrink-0 rounded-2xl ${getIconSize()} overflow-hidden shadow-lg shadow-amber-500/20 group`}>
      <svg
        viewBox="0 0 512 512"
        className={`w-full h-full ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBgGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1917" />
            <stop offset="50%" stopColor="#0C0A09" />
            <stop offset="100%" stopColor="#1C1917" />
          </linearGradient>

          <linearGradient id="logoGoldReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="logoEmeraldReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="logoRubyReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          <filter id="logoGlowReact" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Squircle */}
        <rect
          x="16"
          y="16"
          width="480"
          height="480"
          rx="108"
          fill="url(#logoBgGradReact)"
          stroke="url(#logoGoldReact)"
          strokeWidth="10"
        />

        {/* Inner Subtle Dashed Ring */}
        <rect
          x="36"
          y="36"
          width="440"
          height="440"
          rx="90"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeOpacity="0.35"
          strokeDasharray="10 8"
        />

        {/* Acoustic Resonance Rings */}
        <circle cx="256" cy="256" r="190" fill="none" stroke="url(#logoEmeraldReact)" strokeWidth="3.5" strokeOpacity="0.3" />
        <circle cx="256" cy="256" r="160" fill="none" stroke="url(#logoGoldReact)" strokeWidth="4" strokeOpacity="0.4" />
        <circle cx="256" cy="256" r="130" fill="none" stroke="url(#logoRubyReact)" strokeWidth="3" strokeOpacity="0.3" />

        {/* Voice Waveform Arcs */}
        <g stroke="url(#logoEmeraldReact)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M 120 200 A 70 70 0 0 0 120 312" />
          <path d="M 90 170 A 110 110 0 0 0 90 342" strokeWidth="6" opacity="0.65" />
          <path d="M 62 140 A 150 150 0 0 0 62 372" strokeWidth="4.5" opacity="0.4" />
        </g>

        <g stroke="url(#logoGoldReact)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M 392 200 A 70 70 0 0 1 392 312" />
          <path d="M 422 170 A 110 110 0 0 1 422 342" strokeWidth="6" opacity="0.65" />
          <path d="M 450 140 A 150 150 0 0 1 450 372" strokeWidth="4.5" opacity="0.4" />
        </g>

        {/* Aksum Obelisk Spire & Lalibela Cross Monolith */}
        <g filter="url(#logoGlowReact)">
          <path d="M 236 96 L 276 96 L 284 390 L 228 390 Z" fill="url(#logoGoldReact)" />

          {/* Obelisk Window Tiers */}
          <rect x="246" y="136" width="20" height="26" rx="4" fill="#0C0A09" />
          <rect x="246" y="178" width="20" height="26" rx="4" fill="#0C0A09" />
          <rect x="246" y="220" width="20" height="26" rx="4" fill="#0C0A09" />
          <rect x="246" y="262" width="20" height="26" rx="4" fill="#0C0A09" />
          <rect x="244" y="316" width="24" height="42" rx="4" fill="#0C0A09" />
          <rect x="248" y="334" width="16" height="24" rx="2" fill="url(#logoGoldReact)" />

          {/* Lalibela Cruciform Arms */}
          <path d="M 160 234 L 352 234 L 352 278 L 160 278 Z" fill="url(#logoGoldReact)" />
          <polygon points="160,220 134,256 160,292" fill="url(#logoGoldReact)" />
          <polygon points="352,220 378,256 352,292" fill="url(#logoGoldReact)" />

          {/* Apex Crown */}
          <path d="M 236 96 Q 256 58 276 96 Z" fill="url(#logoGoldReact)" />
        </g>

        {/* Central Core Guidance Star */}
        <g transform="translate(256, 256)">
          <polygon
            points="0,-36 26,-10 36,0 26,10 0,36 -26,10 -36,0 -26,-10"
            fill="url(#logoEmeraldReact)"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <circle cx="0" cy="0" r="9" fill="#FFFFFF" />
        </g>

        {/* Cardinal Points */}
        <circle cx="256" cy="58" r="7" fill="#F59E0B" />
        <circle cx="256" cy="454" r="7" fill="#10B981" />
        <circle cx="58" cy="256" r="7" fill="#EF4444" />
        <circle cx="454" cy="256" r="7" fill="#F59E0B" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <IconMark />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-3 p-2.5 rounded-3xl bg-stone-950/90 border border-amber-500/40 shadow-2xl backdrop-blur-md ${className}`}>
        <IconMark />
        <div className="space-y-0.5 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black font-display tracking-tight text-white">
              ANE MADDOS <span className="text-amber-400">AI</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              እኔ ማዶስ
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-stone-400 font-medium">
              Ethiopian Tourism & Language Ambassador
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <IconMark />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-stone-900 font-display">
              ANE MADDOS <span className="text-amber-600">AI</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              እኔ ማዶስ
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-stone-500 font-medium">
              Tourism Ambassador
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Brand Lockup
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <IconMark />
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-stone-900 font-display leading-tight">
            ANE MADDOS <span className="text-amber-600">AI</span>
          </h1>
          <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-50 to-amber-50 text-stone-800 text-[10px] font-extrabold rounded-full tracking-wider border border-amber-300 shadow-xs">
            እኔ ማዶስ • Ambassador
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
            Ethiopian, African & Global Tourism Language Ambassador AI
          </p>
        )}
      </div>
    </div>
  );
};
