
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, light = false }) => {
  const blue = "#262262";
  const orange = "#f7941d";
  const textColor = light ? "#FFFFFF" : blue;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 200 200" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Forme "C" / Croissant Bleue */}
        <path 
          d="M100 160C66.8629 160 40 133.137 40 100C40 66.8629 66.8629 40 100 40C115.5 40 129.5 45.5 140.5 54.5L120.5 74.5C114.5 70.5 107.5 68 100 68C82.3269 68 68 82.3269 68 100C68 117.673 82.3269 132 100 132C118.5 132 133.5 116 132 98H155C158 135 133 160 100 160Z" 
          fill={blue} 
        />
        {/* Barre du "i" Orange */}
        <path 
          d="M85 45L110 35V135L85 145V45Z" 
          fill={orange} 
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-none border-l pl-3" style={{ borderColor: light ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
          <span className="font-black text-lg tracking-tighter uppercase" style={{ color: textColor }}>Institut</span>
          <span className="font-bold text-sm tracking-[0.25em] uppercase" style={{ color: orange }}>Insan</span>
        </div>
      )}
    </div>
  );
};
