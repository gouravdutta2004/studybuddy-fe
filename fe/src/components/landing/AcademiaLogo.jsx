import React, { useState } from 'react';

export default function AcademiaLogo({ style }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ cursor: 'pointer', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        .aca-svg * { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .aca-group { transform-origin: center; }
        
        /* State 1: Floating Books */
        .aca-books { opacity: 1; transform: translateY(0); }
        .aca-hovered .aca-books { opacity: 0; transform: translateY(-20px) scale(0.8); }
        
        /* State 2: Sunburst */
        .aca-sunburst { opacity: 0; transform: scale(0.5) rotate(-20deg); transform-origin: 200px 250px; }
        .aca-hovered .aca-sunburst { opacity: 1; transform: scale(1) rotate(0deg); }
        
        /* Hats */
        .aca-beret { opacity: 1; transform: translateY(0); }
        .aca-hovered .aca-beret { opacity: 0; transform: translateY(-30px); }
        
        .aca-cap { opacity: 0; transform: translateY(30px); }
        .aca-hovered .aca-cap { opacity: 1; transform: translateY(0); }

        /* Banner */
        .aca-banner { opacity: 0; transform: translateY(40px); }
        .aca-hovered .aca-banner { opacity: 1; transform: translateY(0); }
      `}</style>
      
      <svg className={`aca-svg ${hovered ? 'aca-hovered' : ''}`} viewBox="0 0 400 500" width="100%" height="100%">
        {/* Background (Sunburst) */}
        <g className="aca-sunburst" id="sunburst">
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d="M200,250 L200,40 L230,40 Z"
              fill={i % 2 === 0 ? '#FF99C2' : '#9966CC'}
              transform={`rotate(${i * 30} 200 250)`}
              opacity="0.3"
            />
          ))}
          <circle cx="200" cy="250" r="160" fill="url(#sun-gradient)" opacity="0.6"/>
        </g>
        
        {/* Floating Books (State 1) */}
        <g className="aca-books" id="floating-books">
          <g transform="translate(60, 180) rotate(-15)">
            <path d="M0,0 L30,-10 L60,0 L60,20 L30,10 L0,20 Z" fill="#FF4D94"/>
            <path d="M30,-10 L30,10" stroke="#F9F6F0" strokeWidth="2"/>
          </g>
          <g transform="translate(300, 150) rotate(25)">
            <path d="M0,0 L25,-8 L50,0 L50,15 L25,7 L0,15 Z" fill="#9966CC"/>
            <path d="M25,-8 L25,7" stroke="#F9F6F0" strokeWidth="2"/>
          </g>
          <g transform="translate(80, 320) rotate(-40)">
            <path d="M0,0 L20,-6 L40,0 L40,12 L20,6 L0,12 Z" fill="#FF99C2"/>
            <path d="M20,-6 L20,6" stroke="#F9F6F0" strokeWidth="2"/>
          </g>
        </g>

        {/* Neck / Shirt */}
        <g id="body">
          {/* Shoulders / Shirt */}
          <path d="M120,450 C120,380 280,380 280,450 L120,450 Z" fill="url(#shirt-stripes)" />
          {/* Neck */}
          <rect x="180" y="320" width="40" height="70" fill="#4B0082" />
        </g>

        {/* Face */}
        <g id="face">
          <rect x="140" y="180" width="120" height="150" rx="60" fill="url(#face-gradient)" />
          
          {/* Eyeglasses */}
          <g stroke="#F9F6F0" strokeWidth="4" fill="none">
            <circle cx="170" cy="240" r="20" />
            <circle cx="230" cy="240" r="20" />
            <path d="M190,240 L210,240" />
            <path d="M140,240 L150,240" />
            <path d="M250,240 L260,240" />
          </g>
          
          {/* Nose */}
          <path d="M200,260 L195,280 L205,280" fill="none" stroke="#F9F6F0" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Mouth */}
          <path d="M185,300 Q200,310 215,300" fill="none" stroke="#F9F6F0" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Hats */}
        <g id="hats">
          {/* State 1: Beret */}
          <g className="aca-beret">
            <ellipse cx="200" cy="180" rx="75" ry="25" fill="#4B0082" />
            <path d="M195,155 L205,155 L202,145 Z" fill="#4B0082" />
          </g>
          
          {/* State 2: Academic Cap */}
          <g className="aca-cap">
            {/* Base cylinder */}
            <path d="M160,180 L160,140 L240,140 L240,180 Z" fill="#4B0082" />
            <ellipse cx="200" cy="180" rx="40" ry="10" fill="#2d004d" />
            {/* Top flat board */}
            <path d="M200,110 L130,135 L200,160 L270,135 Z" fill="#4B0082" />
            {/* Tassel */}
            <path d="M200,135 Q230,140 240,170" fill="none" stroke="#FF99C2" strokeWidth="3" strokeLinecap="round" />
            {/* Quill feather tucked in */}
            <path d="M230,140 C260,100 270,70 280,60 C270,80 250,110 230,140" fill="#F9F6F0" />
            <path d="M230,140 L280,60" fill="none" stroke="#9966CC" strokeWidth="2" />
          </g>
        </g>

        {/* Banner (State 2) */}
        <g className="aca-banner" id="banner">
          <path d="M60,400 L340,400 L320,440 L340,480 L60,480 L80,440 Z" fill="#FF4D94" filter="drop-shadow(0 10px 10px rgba(0,0,0,0.3))" />
          <text x="200" y="452" fill="#F9F6F0" fontFamily="serif" fontSize="38" fontWeight="bold" textAnchor="middle" letterSpacing="6">ACADEMIA</text>
        </g>

        {/* Defs / Gradients */}
        <defs>
          <linearGradient id="face-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9966CC" />
            <stop offset="100%" stopColor="#FF99C2" />
          </linearGradient>
          
          <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F9F6F0" />
            <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0" />
          </radialGradient>
          
          <pattern id="shirt-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="20" fill="#9966CC" />
            <rect x="10" width="10" height="20" fill="#4B0082" />
          </pattern>
        </defs>
      </svg>
    </div>
  );
}
