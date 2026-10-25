import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  lightText = false,
}) => {
  const sizeMap = {
    sm: { icon: 32, textClass: 'text-lg', subClass: 'text-[9px]' },
    md: { icon: 42, textClass: 'text-xl', subClass: 'text-[10px]' },
    lg: { icon: 54, textClass: 'text-2xl', subClass: 'text-xs' },
    xl: { icon: 72, textClass: 'text-3xl', subClass: 'text-sm' },
  };

  const { icon, textClass, subClass } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* SVG Icon matching the exact Finest Tutors BD official logo */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Flame Blue-Cyan Gradient */}
          <linearGradient id="flameCyanGrad" x1="80" y1="20" x2="140" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="45%" stopColor="#00A6FB" />
            <stop offset="100%" stopColor="#0582CA" />
          </linearGradient>

          {/* Flame Green Gradient */}
          <linearGradient id="flameGreenGrad" x1="60" y1="40" x2="120" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="30%" stopColor="#34D399" />
            <stop offset="70%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Pen Nib Body Gradient */}
          <linearGradient id="penNibGrad" x1="70" y1="95" x2="130" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="40%" stopColor="#0077B6" />
            <stop offset="100%" stopColor="#03045E" />
          </linearGradient>

          {/* Pen Tip Bright Shading */}
          <linearGradient id="penTipGrad" x1="95" y1="110" x2="105" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Book Arch Gradient */}
          <linearGradient id="bookArchGrad" x1="20" y1="150" x2="180" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0077B6" />
            <stop offset="50%" stopColor="#023E8A" />
            <stop offset="100%" stopColor="#0077B6" />
          </linearGradient>
        </defs>

        {/* --- Flame Segment 1: Right Blue/Cyan Swirl --- */}
        <path
          d="M 100 15 C 105 35 125 45 130 65 C 135 85 120 105 102 112 C 118 100 124 82 116 66 C 110 54 95 40 100 15 Z"
          fill="url(#flameCyanGrad)"
        />

        {/* --- Flame Segment 2: Left Vibrant Green Curve --- */}
        <path
          d="M 102 32 C 82 45 70 70 74 95 C 77 110 90 120 100 120 C 88 116 80 105 82 90 C 84 72 94 50 114 40 C 109 37 105 34 102 32 Z"
          fill="url(#flameGreenGrad)"
        />

        {/* --- Flame Segment 3: Center Cyan Wave --- */}
        <path
          d="M 112 48 C 118 62 118 78 106 90 C 96 99 92 110 100 120 C 105 110 112 102 118 92 C 124 80 122 62 112 48 Z"
          fill="url(#flameCyanGrad)"
        />

        {/* --- Pen Nib Upper Collar --- */}
        <path
          d="M 82 116 C 88 118 112 118 118 116 L 126 130 C 114 133 86 133 74 130 Z"
          fill="#0077B6"
        />

        {/* --- Pen Nib Main Body --- */}
        <path
          d="M 76 128 L 86 150 L 100 176 L 114 150 L 124 128 C 112 131 88 131 76 128 Z"
          fill="url(#penNibGrad)"
        />

        {/* --- Nib Breather Hole & Center Slit --- */}
        <circle cx="100" cy="144" r="4.2" fill="#FFFFFF" />
        <path
          d="M 100 148 L 100 176"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* --- Open Book Base Curves --- */}
        <path
          d="M 28 155 C 56 142 85 146 100 162 C 115 146 144 142 172 155 C 146 149 116 153 100 167 C 84 153 54 149 28 155 Z"
          fill="url(#bookArchGrad)"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1 font-extrabold tracking-tight">
            <span className={lightText ? 'text-white' : 'text-[#002B5B]'}>Finest</span>
            <span className="bg-gradient-to-r from-[#0072EA] via-[#0096C7] to-[#10B981] bg-clip-text text-transparent">
              Tutors BD
            </span>
          </div>
          <span
            className={`font-medium tracking-wider uppercase mt-0.5 ${
              subClass
            } ${lightText ? 'text-cyan-200/80' : 'text-slate-500'}`}
          >
            Tuition Platform • Bangladesh
          </span>
        </div>
      )}
    </div>
  );
};
