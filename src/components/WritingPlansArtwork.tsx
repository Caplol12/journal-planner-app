import React from 'react';

/**
 * Detailed SVG Artwork components faithfully matching the illustrated
 * cottagecore author planner sheet (Template 3).
 */

// 1. Central Hero Illustration: Girl writing at desk with hoodie, glasses, mug, candle, books
export const WriterGirlDeskIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[340px] h-auto',
}) => {
  return (
    <svg
      viewBox="0 0 380 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background soft warm glow */}
      <ellipse cx="190" cy="160" rx="150" ry="110" fill="#f5ede0" />

      {/* Desk Surface */}
      <path
        d="M20 280 Q190 270 360 280 L360 315 Q190 310 20 315 Z"
        fill="#8a6142"
        stroke="#4a2e18"
        strokeWidth="3.5"
      />
      {/* Wood grain line */}
      <path d="M40 295 Q190 288 340 295" stroke="#714c31" strokeWidth="2" strokeDasharray="6 8" />

      {/* Stack of books on left desk */}
      <g id="books-stack">
        {/* Book 1 (bottom green) */}
        <rect x="55" y="260" width="75" height="18" rx="3" fill="#2d5236" stroke="#183320" strokeWidth="2.5" />
        <rect x="58" y="263" width="69" height="12" fill="#3d6b49" />
        <line x1="68" y1="260" x2="68" y2="278" stroke="#f1e3cb" strokeWidth="2" />

        {/* Book 2 (top brown/burgundy) */}
        <rect x="62" y="244" width="70" height="16" rx="3" fill="#663333" stroke="#3b1b1b" strokeWidth="2.5" />
        <rect x="65" y="247" width="64" height="10" fill="#7a3e3e" />
        <line x1="74" y1="244" x2="74" y2="260" stroke="#f1e3cb" strokeWidth="1.5" />

        {/* Little Pinecone beside books */}
        <ellipse cx="50" cy="275" rx="9" ry="13" fill="#5c381c" stroke="#30190a" strokeWidth="2" transform="rotate(-20 50 275)" />
        <path d="M44 269 Q50 275 56 270 M43 275 Q50 280 57 276" stroke="#30190a" strokeWidth="1.5" />
      </g>

      {/* Ceramic Mug ("one more chapter ♡") on right desk */}
      <g id="cozy-mug">
        {/* Mug handle */}
        <path d="M280 252 C295 252 295 272 280 272" stroke="#e0d6c8" strokeWidth="4.5" fill="none" />
        <path d="M280 252 C295 252 295 272 280 272" stroke="#221810" strokeWidth="2" fill="none" />
        {/* Mug body */}
        <rect x="250" y="242" width="32" height="36" rx="4" fill="#faf6ed" stroke="#221810" strokeWidth="2.5" />
        {/* Mug text */}
        <text x="266" y="254" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#221810" fontFamily="sans-serif">
          one
        </text>
        <text x="266" y="261" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#221810" fontFamily="sans-serif">
          more
        </text>
        <text x="266" y="268" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#221810" fontFamily="sans-serif">
          chapter
        </text>
        <text x="266" y="274" textAnchor="middle" fontSize="6" fill="#a44a3f" fontFamily="sans-serif">
          ♡
        </text>
        {/* Steam */}
        <path d="M260 236 Q263 230 260 225" stroke="#a38c7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M268 234 Q271 228 268 223" stroke="#a38c7b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Amber Glass Candle Jar on right desk */}
      <g id="candle">
        <rect x="296" y="255" width="22" height="25" rx="3" fill="#b06526" stroke="#4a2507" strokeWidth="2" />
        <rect x="294" y="252" width="26" height="4" rx="2" fill="#301705" />
        {/* Flame */}
        <ellipse cx="307" cy="246" rx="3.5" ry="5.5" fill="#fcd34d" />
        <ellipse cx="307" cy="247" rx="1.5" ry="3" fill="#f97316" />
        {/* Wick */}
        <line x1="307" y1="250" x2="307" y2="253" stroke="#221810" strokeWidth="1.5" />
      </g>

      {/* Girl: Body & Lime-Green Hoodie */}
      <g id="girl-torso">
        {/* Torso/Hoodie base */}
        <path
          d="M130 240 Q110 260 90 280 L290 280 Q270 260 250 240 Z"
          fill="#a4cc56"
          stroke="#3d5a1e"
          strokeWidth="3.5"
        />

        {/* Arms and Sleeves in Lime Green */}
        {/* Left Arm (propping chin) */}
        <path
          d="M138 215 C115 220 95 250 115 280 C130 270 145 250 152 235 Z"
          fill="#a4cc56"
          stroke="#3d5a1e"
          strokeWidth="3.5"
        />
        {/* Right Arm (writing with pen) */}
        <path
          d="M242 215 C265 220 285 250 265 280 C250 270 235 250 228 235 Z"
          fill="#a4cc56"
          stroke="#3d5a1e"
          strokeWidth="3.5"
        />

        {/* White Overalls / Dungarees bib */}
        <path d="M156 220 L224 220 L230 280 L150 280 Z" fill="#fbfaf5" stroke="#241b14" strokeWidth="3" />
        {/* Dungaree straps */}
        <path d="M158 200 L168 220 L160 220 Z" fill="#fbfaf5" stroke="#241b14" strokeWidth="2.5" />
        <path d="M222 200 L212 220 L220 220 Z" fill="#fbfaf5" stroke="#241b14" strokeWidth="2.5" />
        {/* Metal buckles */}
        <rect x="160" y="217" width="8" height="6" rx="1.5" fill="#d1b894" stroke="#241b14" strokeWidth="1.5" />
        <rect x="212" y="217" width="8" height="6" rx="1.5" fill="#d1b894" stroke="#241b14" strokeWidth="1.5" />

        {/* Large Cozy Hood on Shoulders */}
        <path
          d="M140 185 C115 210 135 235 155 228 C170 235 210 235 225 228 C245 235 265 210 240 185 Z"
          fill="#8ebc42"
          stroke="#3d5a1e"
          strokeWidth="3"
        />
      </g>

      {/* Girl: Neck and Chin */}
      <path d="M175 170 L205 170 L202 195 L178 195 Z" fill="#fad7bd" stroke="#241b14" strokeWidth="2.5" />

      {/* Girl: Head & Face */}
      <g id="girl-face">
        {/* Face shape */}
        <path
          d="M150 145 C146 185 175 205 190 205 C205 205 234 185 230 145 C230 115 210 95 190 95 C170 95 150 115 150 145 Z"
          fill="#fedec7"
          stroke="#241b14"
          strokeWidth="3"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="163" cy="166" rx="7" ry="4.5" fill="#fca5a5" opacity="0.65" />
        <ellipse cx="217" cy="166" rx="7" ry="4.5" fill="#fca5a5" opacity="0.65" />

        {/* Sweet Smile */}
        <path d="M182 176 Q190 184 198 176" stroke="#5a2e1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cute small nose */}
        <path d="M190 160 Q192 165 188 166" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Big expressive anime eyes */}
        {/* Left eye */}
        <ellipse cx="170" cy="153" rx="6.5" ry="7.5" fill="#362215" />
        <circle cx="168" cy="151" r="2.5" fill="#ffffff" />
        <circle cx="172" cy="156" r="1.2" fill="#ffffff" />
        <path d="M162 144 Q170 140 178 145" stroke="#241b14" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Right eye */}
        <ellipse cx="210" cy="153" rx="6.5" ry="7.5" fill="#362215" />
        <circle cx="208" cy="151" r="2.5" fill="#ffffff" />
        <circle cx="212" cy="156" r="1.2" fill="#ffffff" />
        <path d="M202 145 Q210 140 218 144" stroke="#241b14" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Eyebrows */}
        <path d="M162 136 Q171 133 178 138" stroke="#3d2114" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M202 138 Q209 133 218 136" stroke="#3d2114" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Black Round Spectacles / Glasses */}
        {/* Left lens */}
        <circle cx="170" cy="154" r="15" stroke="#1a1410" strokeWidth="3.2" fill="none" />
        {/* Right lens */}
        <circle cx="210" cy="154" r="15" stroke="#1a1410" strokeWidth="3.2" fill="none" />
        {/* Bridge */}
        <path d="M185 153 Q190 150 195 153" stroke="#1a1410" strokeWidth="3" fill="none" />
        {/* Temples */}
        <line x1="155" y1="152" x2="148" y2="150" stroke="#1a1410" strokeWidth="2.8" />
        <line x1="225" y1="152" x2="232" y2="150" stroke="#1a1410" strokeWidth="2.8" />
      </g>

      {/* Girl: Dark Brown Hair with bangs & cute side strands */}
      <g id="girl-hair">
        {/* Back hair */}
        <path
          d="M142 130 C130 170 135 220 148 240 C145 220 148 180 152 160 Z"
          fill="#4a2a18"
          stroke="#261309"
          strokeWidth="2.5"
        />
        <path
          d="M238 130 C250 170 245 220 232 240 C235 220 232 180 228 160 Z"
          fill="#4a2a18"
          stroke="#261309"
          strokeWidth="2.5"
        />

        {/* Top hair & Bangs framing face */}
        <path
          d="M148 125 C146 80 234 80 232 125 C225 110 205 105 190 106 C175 105 155 110 148 125 Z"
          fill="#5a331c"
          stroke="#261309"
          strokeWidth="3"
        />
        {/* Forehead fringe / bangs */}
        <path
          d="M152 118 Q165 135 178 122 Q190 138 202 122 Q215 136 228 118"
          fill="#5a331c"
          stroke="#261309"
          strokeWidth="2.5"
        />
      </g>

      {/* Open Journal on Desk with Ruled lines */}
      <g id="open-journal">
        {/* Left page */}
        <polygon points="145,268 185,262 185,295 142,300" fill="#fcfbf7" stroke="#3a2718" strokeWidth="2" />
        {/* Right page */}
        <polygon points="185,262 225,268 228,300 185,295" fill="#fcfbf7" stroke="#3a2718" strokeWidth="2" />
        {/* Spine shadow */}
        <line x1="185" y1="262" x2="185" y2="295" stroke="#715339" strokeWidth="2.5" />
        {/* Text lines */}
        <line x1="150" y1="274" x2="180" y2="270" stroke="#a38c7b" strokeWidth="1.2" />
        <line x1="150" y1="281" x2="180" y2="277" stroke="#a38c7b" strokeWidth="1.2" />
        <line x1="150" y1="288" x2="175" y2="284" stroke="#a38c7b" strokeWidth="1.2" />
        <line x1="190" y1="270" x2="220" y2="274" stroke="#a38c7b" strokeWidth="1.2" />
        <line x1="190" y1="277" x2="220" y2="281" stroke="#a38c7b" strokeWidth="1.2" />
      </g>

      {/* Hands */}
      {/* Left hand propping chin */}
      <g id="left-hand">
        <ellipse cx="172" cy="198" rx="8" ry="6" fill="#fedec7" stroke="#241b14" strokeWidth="2" />
        <path d="M168 193 C166 186 174 186 175 192" stroke="#241b14" strokeWidth="2" fill="#fedec7" />
      </g>

      {/* Right hand holding black pen */}
      <g id="right-hand">
        {/* Hand */}
        <ellipse cx="204" cy="265" rx="8" ry="6" fill="#fedec7" stroke="#241b14" strokeWidth="2" transform="rotate(20 204 265)" />
        {/* Pen */}
        <line x1="196" y1="276" x2="216" y2="248" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        <polygon points="194,279 198,276 195,274" fill="#d1b894" />
      </g>

      {/* Stars & Doodles surrounding the girl */}
      <path d="M125 120 L128 112 L131 120 L139 122 L131 124 L128 132 L125 124 L117 122 Z" fill="#eab308" opacity="0.8" />
      <path d="M255 125 L257 119 L259 125 L265 127 L259 129 L257 135 L255 129 L249 127 Z" fill="#eab308" opacity="0.8" />
      <text x="250" y="165" fontSize="16" fill="#a44a3f">♡</text>
    </svg>
  );
};

// 2. Vintage Olive-Green Typewriter Illustration
export const VintageTypewriterIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[200px] h-auto',
}) => {
  return (
    <svg
      viewBox="0 0 240 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shadow */}
      <ellipse cx="120" cy="195" rx="90" ry="16" fill="#000000" opacity="0.12" />

      {/* Paper Sheet fed into roller */}
      <polygon points="65,30 175,30 175,100 65,100" fill="#fdfcf8" stroke="#3b2b1e" strokeWidth="2.5" />
      {/* Paper fold line */}
      <line x1="72" y1="36" x2="168" y2="36" stroke="#e0d4c5" strokeWidth="1.5" />
      {/* Typed words: "one word at a time. ♡" */}
      <text x="120" y="55" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d2116" fontFamily="serif">
        one word
      </text>
      <text x="120" y="70" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#2d2116" fontFamily="serif">
        at a time. <tspan fill="#a44a3f">♡</tspan>
      </text>

      {/* Roller Cylinder */}
      <rect x="45" y="90" width="150" height="22" rx="4" fill="#28221b" stroke="#120c07" strokeWidth="2.5" />
      {/* Roller knobs */}
      <rect x="36" y="94" width="9" height="14" rx="2" fill="#d4af37" stroke="#120c07" strokeWidth="1.8" />
      <rect x="195" y="94" width="9" height="14" rx="2" fill="#d4af37" stroke="#120c07" strokeWidth="1.8" />
      <line x1="50" y1="101" x2="190" y2="101" stroke="#52463b" strokeWidth="2" />

      {/* Carriage Return Metal Lever */}
      <path d="M48 94 L30 75 L25 78" stroke="#71717a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Main Olive-Green Typewriter Body */}
      <path
        d="M45 110 L195 110 L210 185 L30 185 Z"
        fill="#4f6d4d"
        stroke="#273826"
        strokeWidth="3.5"
      />
      {/* Slanted keyboard area frame */}
      <path
        d="M48 128 L192 128 L202 180 L38 180 Z"
        fill="#3c523a"
        stroke="#1e2c1d"
        strokeWidth="2.5"
      />

      {/* Typebar curved basket */}
      <path d="M75 112 C75 125 165 125 165 112 Z" fill="#271f18" stroke="#18130e" strokeWidth="2" />

      {/* Keyboard: 4 rows of round keys */}
      {/* Row 1 */}
      {[58, 72, 86, 100, 114, 128, 142, 156, 170, 184].map((x, i) => (
        <circle key={`r1-${i}`} cx={x} cy="138" r="4.8" fill="#fdfbf7" stroke="#1e1812" strokeWidth="1.8" />
      ))}
      {/* Row 2 */}
      {[62, 76, 90, 104, 118, 132, 146, 160, 174, 188].map((x, i) => (
        <circle key={`r2-${i}`} cx={x} cy="150" r="4.8" fill="#fdfbf7" stroke="#1e1812" strokeWidth="1.8" />
      ))}
      {/* Row 3 */}
      {[67, 81, 95, 109, 123, 137, 151, 165, 179].map((x, i) => (
        <circle key={`r3-${i}`} cx={x} cy="162" r="4.8" fill="#fdfbf7" stroke="#1e1812" strokeWidth="1.8" />
      ))}
      {/* Spacebar */}
      <rect x="85" y="171" width="70" height="6.5" rx="2" fill="#fdfbf7" stroke="#1e1812" strokeWidth="1.8" />

      {/* Fountain Pen resting beside */}
      <g id="fountain-pen" transform="rotate(-15 25 150)">
        <polygon points="18,110 24,110 23,175 19,175" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
        <polygon points="19,175 23,175 21,185" fill="#eab308" stroke="#713f12" strokeWidth="1.2" />
        <rect x="18" y="130" width="6" height="3" fill="#eab308" />
      </g>

      {/* Spiral Pinecone Notebook on the right */}
      <g id="pinecone-notebook">
        <rect x="195" y="130" width="36" height="52" rx="3" fill="#fbf8f2" stroke="#3b2b1e" strokeWidth="2" />
        {/* Wire rings */}
        {[135, 142, 149, 156, 163, 170, 177].map((y, i) => (
          <ellipse key={i} cx="195" cy={y} rx="2.5" ry="1.8" fill="#71717a" stroke="#18181b" strokeWidth="1" />
        ))}
        {/* Botanical pinecone branch on cover */}
        <ellipse cx="213" cy="156" rx="5" ry="8" fill="#6f4e37" stroke="#3b2b1e" strokeWidth="1.2" />
        <path d="M213 148 L213 166 M208 160 L218 152" stroke="#2e4f35" strokeWidth="1.2" />
      </g>
    </svg>
  );
};

// 3. Polaroid Pine Forest Photo with Washi Tape
export const PolaroidForestIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[120px] h-auto',
}) => {
  return (
    <svg
      viewBox="0 0 120 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Polaroid shadow */}
      <rect x="8" y="12" width="102" height="126" rx="3" fill="#000000" opacity="0.12" transform="rotate(3 60 70)" />

      {/* White/Cream Polaroid Frame */}
      <g transform="rotate(2 60 70)">
        <rect x="8" y="10" width="102" height="126" rx="2" fill="#faf8f2" stroke="#d5c7b8" strokeWidth="2.5" />

        {/* Photo Area (Dark Misty Pine Forest) */}
        <rect x="15" y="17" width="88" height="88" fill="#1c2920" />

        {/* Misty sky gradient */}
        <rect x="15" y="17" width="88" height="40" fill="#3a4f41" opacity="0.6" />

        {/* Forest Pines silhouettes */}
        {/* Layer 1 back trees (lighter fog) */}
        <polygon points="35,35 45,65 25,65" fill="#2d3f33" />
        <polygon points="65,30 78,70 52,70" fill="#2d3f33" />
        <polygon points="85,38 96,68 74,68" fill="#2d3f33" />

        {/* Layer 2 front trees (dark pine) */}
        <polygon points="25,48 38,95 12,95" fill="#141f17" />
        <polygon points="50,42 66,100 34,100" fill="#141f17" />
        <polygon points="76,46 92,98 60,98" fill="#141f17" />
        <polygon points="95,52 105,95 85,95" fill="#141f17" />

        {/* Tiny heart in bottom white margin */}
        <text x="92" y="124" fontSize="10" fill="#a44a3f" fontFamily="sans-serif">
          ♥
        </text>
      </g>

      {/* Washi Masking Tape across top-right corner */}
      <polygon
        points="65,4 105,8 102,20 62,16"
        fill="#f3e8d2"
        opacity="0.88"
        stroke="#d5c4a5"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </svg>
  );
};

// 4. Over-Ear Headphones with Music Notes Doodle
export const HeadphonesDoodle: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Headband */}
      <path
        d="M14 36 C14 18 46 18 46 36"
        stroke="#271f19"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ear cushions */}
      <rect x="8" y="32" width="10" height="18" rx="4" fill="#271f19" stroke="#120d09" strokeWidth="2" />
      <rect x="42" y="32" width="10" height="18" rx="4" fill="#271f19" stroke="#120d09" strokeWidth="2" />
      {/* Musical notes */}
      <text x="48" y="20" fontSize="13" fill="#6f4e37">♫</text>
      <text x="38" y="14" fontSize="10" fill="#6f4e37">♪</text>
    </svg>
  );
};

// 5. Pinecone Doodle
export const PineconeDoodle: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="20" cy="24" rx="14" ry="19" fill="#6c4424" stroke="#36200e" strokeWidth="2.5" />
      <path d="M12 14 Q20 20 28 14 M10 22 Q20 28 30 22 M11 30 Q20 36 29 30" stroke="#36200e" strokeWidth="2" fill="none" />
      <path d="M20 5 L20 10" stroke="#36200e" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// 6. Header Pine Trees Doodle
export const PineTreesHeaderDoodle: React.FC<{ className?: string }> = ({
  className = 'w-14 h-16',
}) => {
  return (
    <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Tree */}
      <polygon points="18,12 28,32 8,32" fill="#325338" stroke="#1b3320" strokeWidth="1.8" />
      <polygon points="18,24 32,46 4,46" fill="#325338" stroke="#1b3320" strokeWidth="1.8" />
      <polygon points="18,38 35,60 1,60" fill="#325338" stroke="#1b3320" strokeWidth="1.8" />
      <rect x="16" y="60" width="4" height="7" fill="#523824" stroke="#2a1a0f" strokeWidth="1.5" />

      {/* Right Tree */}
      <polygon points="42,20 50,38 34,38" fill="#446a4a" stroke="#1b3320" strokeWidth="1.8" />
      <polygon points="42,32 54,52 30,52" fill="#446a4a" stroke="#1b3320" strokeWidth="1.8" />
      <polygon points="42,44 57,64 27,64" fill="#446a4a" stroke="#1b3320" strokeWidth="1.8" />
      <rect x="40" y="64" width="4" height="6" fill="#523824" stroke="#2a1a0f" strokeWidth="1.5" />

      {/* Little pinecone on ground */}
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#6c4424" />
    </svg>
  );
};
