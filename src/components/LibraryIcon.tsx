import React from 'react';

interface LibraryIconProps {
  className?: string;
}

const LibraryIcon: React.FC<LibraryIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book Cover - Aged Leather */}
      <path
        d="M20 15 Q18 15 18 17 L18 83 Q18 85 20 85 L80 85 Q82 85 82 83 L82 17 Q82 15 80 15 L20 15 Z"
        fill="#8B4513"
        stroke="#654321"
        strokeWidth="1.5"
      />
      
      {/* Book Spine Shadow */}
      <path
        d="M18 17 L18 83 Q18 85 20 85 L25 85 L25 15 L20 15 Q18 15 18 17 Z"
        fill="#654321"
        opacity="0.7"
      />
      
      {/* Ornate Border */}
      <rect
        x="24"
        y="20"
        width="52"
        height="60"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        rx="2"
      />
      
      {/* Inner Decorative Border */}
      <rect
        x="27"
        y="23"
        width="46"
        height="54"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.8"
        rx="1"
        strokeDasharray="2,1"
      />
      
      {/* Ancient Runes/Symbols on Cover */}
      <g stroke="#D4AF37" strokeWidth="1.2" fill="none" strokeLinecap="round">
        {/* Mystical Symbol 1 */}
        <circle cx="40" cy="35" r="3" />
        <path d="M37 35 L43 35 M40 32 L40 38" />
        
        {/* Mystical Symbol 2 */}
        <path d="M55 30 L60 35 L55 40 L50 35 Z" />
        <circle cx="55" cy="35" r="1" fill="#D4AF37" />
        
        {/* Ancient Text Lines */}
        <path d="M30 50 L70 50" strokeWidth="0.8" opacity="0.6" />
        <path d="M32 55 L68 55" strokeWidth="0.8" opacity="0.6" />
        <path d="M35 60 L65 60" strokeWidth="0.8" opacity="0.6" />
        <path d="M30 65 L70 65" strokeWidth="0.8" opacity="0.6" />
      </g>
      
      {/* Ornate Corner Decorations */}
      <g stroke="#D4AF37" strokeWidth="1" fill="#D4AF37" opacity="0.8">
        {/* Top Left Corner */}
        <path d="M24 20 L29 20 L29 22 L26 22 L26 25 L24 25 Z" />
        <circle cx="27" cy="23" r="0.5" />
        
        {/* Top Right Corner */}
        <path d="M76 20 L71 20 L71 22 L74 22 L74 25 L76 25 Z" />
        <circle cx="73" cy="23" r="0.5" />
        
        {/* Bottom Left Corner */}
        <path d="M24 80 L29 80 L29 78 L26 78 L26 75 L24 75 Z" />
        <circle cx="27" cy="77" r="0.5" />
        
        {/* Bottom Right Corner */}
        <path d="M76 80 L71 80 L71 78 L74 78 L74 75 L76 75 Z" />
        <circle cx="73" cy="77" r="0.5" />
      </g>
      
      {/* Book Clasp */}
      <g stroke="#B8860B" strokeWidth="1.5" fill="#D4AF37">
        <rect x="78" y="45" width="6" height="10" rx="1" />
        <circle cx="81" cy="50" r="1.5" fill="#B8860B" />
      </g>
      
      {/* Aged Paper Pages */}
      <g opacity="0.9">
        <path
          d="M22 18 L78 18 L78 82 L22 82 Z"
          fill="#F5F5DC"
          stroke="#E6E6C7"
          strokeWidth="0.5"
        />
        <path
          d="M23 19 L77 19 L77 81 L23 81 Z"
          fill="#FFFACD"
          stroke="#F0E68C"
          strokeWidth="0.3"
        />
      </g>
      
      {/* Bookmark Ribbon */}
      <path
        d="M50 15 L50 30 L47 27 L53 27 Z"
        fill="#8B0000"
        stroke="#654321"
        strokeWidth="0.5"
      />
      
      {/* Dust Motes/Magic Sparkles */}
      <g fill="#D4AF37" opacity="0.6">
        <circle cx="15" cy="25" r="0.5" />
        <circle cx="85" cy="35" r="0.8" />
        <circle cx="12" cy="60" r="0.3" />
        <circle cx="88" cy="70" r="0.6" />
        <circle cx="16" cy="80" r="0.4" />
      </g>
      
      {/* Weathering/Age Marks */}
      <g stroke="#8B4513" strokeWidth="0.5" opacity="0.3" fill="none">
        <path d="M25 25 Q30 27 28 30" />
        <path d="M70 70 Q75 68 73 65" />
        <path d="M35 75 Q40 77 38 80" />
      </g>
    </svg>
  );
};

export default LibraryIcon;