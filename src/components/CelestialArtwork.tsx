import React from 'react';

/**
 * High-fidelity celestial & mountain artwork components matching
 * the cosmic "Daily To-Do List" template (Template 4).
 */

// 1. Crescent Moon with ornate botanical gold laurel vine matching the original artwork
export const CelestialCrescentMoon: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Golden metallic gradient */}
        <linearGradient id="goldMoonGrad" x1="20%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#fff6d6" />
          <stop offset="25%" stopColor="#eed07a" />
          <stop offset="60%" stopColor="#c89d3c" />
          <stop offset="100%" stopColor="#8d651a" />
        </linearGradient>
        {/* Soft Gold glow */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Crescent Moon Body */}
      <path
        d="M74 16 C38 24 26 62 48 98 C18 86 12 40 50 11 C58 12 66 14 74 16 Z"
        fill="url(#goldMoonGrad)"
        stroke="#ffd978"
        strokeWidth="1.2"
        filter="url(#goldGlow)"
      />
      {/* Moon texture / craters highlights */}
      <circle cx="42" cy="38" r="3" fill="#9c7423" opacity="0.3" />
      <circle cx="48" cy="52" r="4" fill="#9c7423" opacity="0.25" />
      <circle cx="44" cy="68" r="2.5" fill="#9c7423" opacity="0.3" />

      {/* Ornate Golden Botanical Laurel Branch wrapping around the moon */}
      <g stroke="#e6c46a" strokeWidth="1.5" strokeLinecap="round" fill="#dfbc60">
        {/* Main stem curving with moon's back */}
        <path
          d="M16 102 C20 74 24 45 42 22 C48 14 56 10 66 7"
          fill="none"
          stroke="#eed07a"
          strokeWidth="1.8"
        />

        {/* Golden Laurel Leaves */}
        {/* Bottom cluster */}
        <path d="M18 96 C12 92 14 84 22 88 C24 94 20 96 18 96 Z" />
        <path d="M22 88 C28 82 34 85 30 92 C25 93 23 90 22 88 Z" />
        {/* Lower mid leaves */}
        <path d="M22 76 C14 73 17 64 25 68 C27 73 24 76 22 76 Z" />
        <path d="M26 68 C33 62 40 66 36 73 C30 74 27 70 26 68 Z" />
        {/* Mid leaves */}
        <path d="M27 54 C20 49 23 41 31 45 C33 50 29 54 27 54 Z" />
        <path d="M31 46 C39 40 46 44 41 51 C35 52 32 48 31 46 Z" />
        {/* Upper leaves */}
        <path d="M35 34 C30 28 35 21 42 26 C43 31 38 34 35 34 Z" />
        <path d="M42 26 C49 20 57 23 52 30 C46 31 43 28 42 26 Z" />
        {/* Tip leaf */}
        <path d="M54 14 C58 8 68 8 66 16 C60 17 56 15 54 14 Z" />
      </g>

      {/* Sparkling 4-point golden star bursts around the moon */}
      {/* Top left sparkle */}
      <path
        d="M26 24 L27.5 16 L29 24 L37 25.5 L29 27 L27.5 35 L26 27 L18 25.5 Z"
        fill="#fff8dc"
      />
      {/* Inside moon sparkle */}
      <path
        d="M84 40 L85 34 L86 40 L92 41 L86 42 L85 48 L84 42 L78 41 Z"
        fill="#fdf0cd"
      />
      {/* Tiny stars */}
      <circle cx="94" cy="24" r="1.5" fill="#fdf0cd" />
      <circle cx="82" cy="62" r="1.2" fill="#fff" />
      <circle cx="34" cy="104" r="1.5" fill="#eed07a" />
      <circle cx="12" cy="46" r="1.2" fill="#fff" />
    </svg>
  );
};

// 2. Constellation Lines with Radiant 8-Point Starburst for Header
export const CelestialConstellations: React.FC<{ className?: string }> = ({
  className = 'w-24 h-16',
}) => {
  return (
    <svg viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="starburstGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Constellation Dotted Connectors */}
      <line x1="25" y1="35" x2="52" y2="20" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="52" y1="20" x2="82" y2="38" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="82" y1="38" x2="114" y2="25" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="82" y1="38" x2="88" y2="72" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="88" y1="72" x2="128" y2="60" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="114" y1="25" x2="128" y2="60" stroke="#b4d4f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />

      {/* Constellation Star Nodes */}
      <circle cx="25" cy="35" r="2.5" fill="#ffffff" />
      <circle cx="52" cy="20" r="3" fill="#fef08a" />
      <circle cx="82" cy="38" r="3.2" fill="#ffffff" />
      <circle cx="88" cy="72" r="2.5" fill="#fef08a" />
      <circle cx="128" cy="60" r="3" fill="#ffffff" />

      {/* Radiant 8-Point Starburst (The prominent star at x=114, y=25) */}
      <g transform="translate(114, 25)" filter="url(#starburstGlow)">
        {/* Soft radial aura */}
        <circle cx="0" cy="0" r="14" fill="#67e8f9" opacity="0.35" />
        <circle cx="0" cy="0" r="7" fill="#ffffff" opacity="0.6" />

        {/* Horizontal & vertical long flares */}
        <line x1="-22" y1="0" x2="22" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="-22" x2="0" y2="22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Diagonal flares */}
        <line x1="-12" y1="-12" x2="12" y2="12" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="-12" x2="-12" y2="12" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />

        {/* 4-point diamond star center */}
        <polygon points="0,-10 2.5,-2.5 10,0 2.5,2.5 0,10 -2.5,2.5 -10,0 -2.5,-2.5" fill="#fffbe6" />
        <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
      </g>

      {/* Tiny background stardust */}
      <circle cx="15" cy="65" r="1.2" fill="#e0f2fe" opacity="0.8" />
      <circle cx="65" cy="10" r="1" fill="#fff" opacity="0.7" />
      <circle cx="140" cy="40" r="1.5" fill="#fef08a" opacity="0.85" />
    </svg>
  );
};

// 3. Misty Mountain Pines Landscape for the Bottom Right of Today's Tasks
export const MountainPineLandscape: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => {
  return (
    <svg viewBox="0 0 500 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Aurora Sky Gradient */}
        <linearGradient id="auroraSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#08142c" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#0f2b48" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#1a4b6e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#25637a" stopOpacity="0.6" />
        </linearGradient>

        {/* Mountain distant mist gradient */}
        <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#436b85" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a1a2f" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Aurora glow sweep */}
      <path
        d="M0 60 Q120 10 250 50 T500 40 L500 240 L0 240 Z"
        fill="url(#auroraSky)"
      />

      {/* Distant mountains (Layer 1) */}
      <polygon points="0,150 90,90 190,160 280,105 380,155 500,80 500,240 0,240" fill="url(#mistGrad)" />

      {/* Mid-range jagged peaks (Layer 2) */}
      <polygon points="0,175 70,125 150,185 240,130 330,190 440,120 500,160 500,240 0,240" fill="#0d2238" />

      {/* Fog mist band */}
      <ellipse cx="250" cy="180" rx="260" ry="25" fill="#588ba3" opacity="0.25" />

      {/* Pine Trees Silhouettes (Front Layer) */}
      {/* Left cluster */}
      <g fill="#07121f">
        <polygon points="25,140 32,175 18,175" />
        <polygon points="25,160 35,200 15,200" />
        <polygon points="25,180 38,230 12,230" />
        <rect x="23" y="230" width="4" height="10" />

        <polygon points="45,155 52,190 38,190" />
        <polygon points="45,175 55,220 35,220" />
        <polygon points="45,200 58,240 32,240" />

        {/* Right massive pine cluster */}
        <polygon points="420,110 430,150 410,150" />
        <polygon points="420,135 435,180 405,180" />
        <polygon points="420,165 440,225 400,225" />
        <rect x="418" y="225" width="4" height="15" />

        <polygon points="455,90 467,135 443,135" />
        <polygon points="455,120 472,170 438,170" />
        <polygon points="455,155 478,220 432,220" />
        <polygon points="455,190 482,240 428,240" />

        <polygon points="485,120 495,160 475,160" />
        <polygon points="485,145 500,195 470,195" />
        <polygon points="485,175 505,240 465,240" />

        <polygon points="380,160 388,195 372,195" />
        <polygon points="380,180 392,225 368,225" />
        <polygon points="380,205 395,240 365,240" />
      </g>

      {/* Tiny starlight sparkles in sky */}
      <circle cx="80" cy="50" r="1.5" fill="#fef08a" opacity="0.8" />
      <circle cx="160" cy="35" r="1.2" fill="#fff" opacity="0.9" />
      <circle cx="280" cy="45" r="1.5" fill="#fff" opacity="0.7" />
      <circle cx="340" cy="25" r="2" fill="#fef08a" opacity="0.9" />
      <circle cx="440" cy="40" r="1.5" fill="#fff" opacity="0.8" />
    </svg>
  );
};

// 4. Botanical Leaves Spray for Meals/Night Cards
export const BotanicalBranchDoodle: React.FC<{ className?: string }> = ({
  className = 'w-16 h-28',
}) => {
  return (
    <svg viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M45 95 Q30 55 15 10" stroke="#3b5675" strokeWidth="1.8" strokeLinecap="round" />
      {/* Pairs of leaves */}
      <path d="M40 80 Q52 75 48 65 Q38 70 40 80 Z" fill="#2d4560" />
      <path d="M35 72 Q22 68 25 58 Q34 62 35 72 Z" fill="#2d4560" />
      <path d="M30 55 Q42 50 38 40 Q28 45 30 55 Z" fill="#2d4560" />
      <path d="M25 45 Q12 40 16 30 Q25 35 25 45 Z" fill="#2d4560" />
      <path d="M20 30 Q30 25 26 15 Q18 20 20 30 Z" fill="#2d4560" />
      <path d="M15 15 Q12 5 15 2 Q18 8 15 15 Z" fill="#3b5675" />
      {/* Little golden star */}
      <circle cx="45" cy="40" r="1.5" fill="#eab308" />
      <circle cx="10" cy="60" r="1.2" fill="#eab308" />
    </svg>
  );
};
