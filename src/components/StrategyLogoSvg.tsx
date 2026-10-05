import React from 'react';

interface StrategyLogoSvgProps {
  className?: string;
  size?: number;
  color?: string;
}

export const StrategyLogoSvg: React.FC<StrategyLogoSvgProps> = ({
  className = '',
  size = 32,
  color,
}) => {
  return (
    <svg
      viewBox="280 220 440 550"
      width={size}
      height={size}
      className={className}
      fill={color || 'currentColor'}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      aria-label="Strategy S Logo"
    >
      <defs>
        <linearGradient id="strategyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5722" />
          <stop offset="50%" stopColor="#ff6438" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Main S Body with upper terminal, central spine, and bottom-left flourish */}
      <path
        d="M 444,336 
           C 472,280 522,250 588,250 
           C 656,250 690,290 690,340 
           C 690,366 676,380 655,380 
           C 644,380 632,366 632,348 
           C 632,320 655,296 655,296 
           C 622,268 578,272 538,300 
           C 492,330 470,372 466,408 
           C 476,442 516,482 566,525 
           C 624,574 660,618 660,670 
           C 660,726 604,748 535,748 
           C 458,748 385,726 338,692 
           C 316,676 306,654 310,634 
           C 314,612 332,596 352,592 
           C 368,589 382,600 388,570 
           C 352,608 328,648 355,682 
           C 392,716 452,732 525,732 
           C 585,732 625,706 625,666 
           C 625,622 590,588 535,545 
           C 495,514 472,485 464,452 
           C 460,432 462,415 468,398 
           C 454,375 446,354 444,336 Z"
      />

      {/* Left Crescent Flame / Wing Shape */}
      <path
        d="M 444,336 
           C 422,358 390,412 390,465 
           C 390,518 424,572 470,626 
           C 502,662 534,692 550,706 
           C 538,674 504,625 476,572 
           C 445,512 426,455 426,412 
           C 426,382 434,354 444,336 Z"
      />
    </svg>
  );
};
