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
  lightText = false,
}) => {
  // Proportional sizing for the 4:3 official Finest Tutors BD logo image
  const sizeMap = {
    sm: 'h-10',
    md: 'h-13 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  };

  const heightClass = sizeMap[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* 
        Official 100% Finest Tutors BD Logo provided directly by the user:
        /assets/aistudio/finest_tutor_bd_d021ba85.jpeg
        Contains the authentic flame emblem, fountain pen nib, open book base,
        and the official "Finest Tutors BD" typography.
      */}
      <div
        className={`${
          lightText
            ? 'bg-white p-2 rounded-2xl shadow-sm border border-slate-700/50 inline-flex items-center justify-center'
            : 'inline-flex items-center justify-center'
        }`}
      >
        <img
          src="/assets/aistudio/finest_tutor_bd_d021ba85.jpeg"
          alt="Finest Tutors BD"
          className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
          loading="eager"
        />
      </div>
    </div>
  );
};

