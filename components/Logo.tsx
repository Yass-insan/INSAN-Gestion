
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
  logoUrl?: string;
  logoUrlDark?: string;
  isDarkMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true, light = false, logoUrl, logoUrlDark, isDarkMode }) => {
  const blue = "#262262";
  const orange = "#f7941d";
  const textColor = light ? "#FFFFFF" : blue;

  const currentLogo = isDarkMode ? (logoUrlDark || logoUrl) : logoUrl;

  if (currentLogo) {
    return (
      <div className={`flex items-center ${className}`}>
        <img src={currentLogo} alt="Logo" className="h-full w-auto object-contain" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg viewBox="0 0 120 140" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Forme Bleue Stylisée (Swoosh / Base) */}
        <path 
          d="M15.5 125.5C10.5 120.5 5.5 110.5 10.5 95.5C15.5 80.5 30.5 65.5 50.5 60.5C70.5 55.5 85.5 65.5 85.5 85.5C85.5 105.5 70.5 120.5 50.5 125.5L15.5 125.5ZM10.5 135.5L45.5 135.5C85.5 135.5 115.5 110.5 115.5 75.5C115.5 40.5 85.5 15.5 45.5 15.5C25.5 15.5 10.5 25.5 5.5 40.5L25.5 45.5C28.5 38.5 35.5 35.5 45.5 35.5C65.5 35.5 85.5 50.5 85.5 75.5C85.5 100.5 65.5 115.5 45.5 115.5L25.5 115.5C20.5 115.5 15.5 125.5 10.5 135.5Z" 
          fill={blue} 
        />
        {/* Barre Orange Stylisée (i) */}
        <path 
          d="M40 45L65 35V135L40 145V45Z" 
          fill={orange} 
        />
        {/* Gap dans la barre orange */}
        <path 
          d="M38 65L67 55V65L38 75V65Z" 
          fill="white" 
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-[0.9]">
          <span className="font-bold text-xl tracking-tight" style={{ color: textColor }}>INSTITUT</span>
          <span className="font-black text-4xl tracking-tighter" style={{ color: textColor }}>INSAN</span>
        </div>
      )}
    </div>
  );
};
