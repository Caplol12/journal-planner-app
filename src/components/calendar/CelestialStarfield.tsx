import React, { useEffect, useRef } from 'react';

interface CelestialStarfieldProps {
  warpTrigger?: number; // increments when a warp burst is requested
  className?: string;
}

export const CelestialStarfield: React.FC<CelestialStarfieldProps> = ({
  warpTrigger = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const warpStateRef = useRef<{ warpEnergy: number; pushV: number }>({ warpEnergy: 0, pushV: 0 });

  // Trigger warp burst whenever warpTrigger changes
  useEffect(() => {
    if (warpTrigger > 0) {
      warpStateRef.current.warpEnergy = 1.0;
    }
  }, [warpTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const TINTS = ['230,236,255', '196,226,255', '222,206,255', '255,238,210', '165,243,252'];
    const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

    interface Star {
      x: number;
      y: number;
      z: number;
      r: number;
      tw: number;
      ts: number;
      c: string;
    }

    interface Meteor {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
    }

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let lastTime = 0;
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let meteor: Meteor | null = null;
    let nextMeteor = performance.now() + 3000;

    const makeStar = (x = rand(0, w), y = rand(0, h)): Star => {
      const z = Math.pow(Math.random(), 2.2);
      return {
        x,
        y,
        z,
        r: 0.4 + z * 1.6,
        tw: rand(0, 6.283),
        ts: rand(0.5, 1.8),
        c: Math.random() < 0.6 ? TINTS[0] : TINTS[Math.floor(Math.random() * TINTS.length)],
      };
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(140, Math.min(380, Math.round((w * h) / 4800)));
      stars = Array.from({ length: count }, () => makeStar());
    };

    handleResize();

    const handlePointerMove = (e: MouseEvent) => {
      tmx = e.clientX / (w || 1) - 0.5;
      tmy = e.clientY / (h || 1) - 0.5;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const frame = (t: number) => {
      const dt = Math.min(48, t - lastTime || 16);
      lastTime = t;

      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;

      warpStateRef.current.warpEnergy = Math.max(0, warpStateRef.current.warpEnergy - dt / 1100);
      const we = warpStateRef.current.warpEnergy;
      const smoothWarp = we * we * (3 - 2 * we);

      warpStateRef.current.pushV *= Math.pow(0.992, dt);
      const push = warpStateRef.current.pushV;

      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const sp = 0.3 + s.z;
        const px = s.x;
        const py = s.y;

        s.x += (-0.005 * sp + push * sp) * dt;
        s.y += 0.0015 * sp * dt;

        if (smoothWarp > 0) {
          const k = smoothWarp * 0.05 * sp * (dt / 16);
          s.x += (s.x - cx) * k;
          s.y += (s.y - cy) * k;
        }

        if (s.x < -20 || s.x > w + 20 || s.y < -20 || s.y > h + 20) {
          if (smoothWarp > 0.04) {
            Object.assign(s, makeStar(cx + rand(-0.15, 0.15) * w, cy + rand(-0.15, 0.15) * h));
            continue;
          }
          s.x = ((s.x + 20) % (w + 40) + (w + 40)) % (w + 40) - 20;
          s.y = ((s.y + 20) % (h + 40) + (h + 40)) % (h + 40) - 20;
          continue;
        }

        const ox = mx * s.z * -20;
        const oy = my * s.z * -14;
        const alpha = (0.22 + 0.78 * s.z) * (0.7 + 0.3 * Math.sin(s.tw + t * 0.001 * s.ts));

        if (smoothWarp > 0.04) {
          // Render streak trails during warp speed
          ctx.strokeStyle = `rgba(${s.c},${alpha})`;
          ctx.lineWidth = s.r * 1.1;
          ctx.beginPath();
          ctx.moveTo(px + ox - (s.x - px) * 2.2, py + oy - (s.y - py) * 2.2);
          ctx.lineTo(s.x + ox, s.y + oy);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${s.c},${alpha})`;
          ctx.beginPath();
          ctx.arc(s.x + ox, s.y + oy, s.r, 0, 6.283);
          ctx.fill();

          if (s.z > 0.85) {
            // Subtle celestial glow for closer bright stars
            ctx.fillStyle = `rgba(${s.c},${alpha * 0.15})`;
            ctx.beginPath();
            ctx.arc(s.x + ox, s.y + oy, s.r * 3.5, 0, 6.283);
            ctx.fill();
          }
        }
      }

      // Shooting Star / Meteor logic
      if (!meteor && t > nextMeteor && smoothWarp === 0) {
        meteor = {
          x: rand(w * 0.25, w * 1.05),
          y: rand(-20, h * 0.35),
          vx: -rand(0.55, 0.9),
          vy: rand(0.2, 0.35),
          life: 0,
          max: rand(700, 1100),
        };
      }

      if (meteor) {
        meteor.life += dt;
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        const k = meteor.life / meteor.max;
        const alpha = Math.sin(Math.PI * Math.min(1, k)) * 0.95;
        const len = 160;
        const hyp = Math.hypot(meteor.vx, meteor.vy);
        const tx = meteor.x - (meteor.vx / hyp) * len;
        const ty = meteor.y - (meteor.vy / hyp) * len;

        const g = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
        g.addColorStop(0, `rgba(215,240,255,${alpha})`);
        g.addColorStop(0.3, `rgba(165,243,252,${alpha * 0.7})`);
        g.addColorStop(1, 'rgba(165,243,252,0)');

        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        if (k >= 1) {
          meteor = null;
          nextMeteor = t + rand(6000, 14000);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    lastTime = performance.now();
    raf = requestAnimationFrame(frame);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        lastTime = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
        aria-hidden="true"
      />
      {/* Nebular glowing clouds */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(55vmax 40vmax at 10% 8%, rgba(139, 92, 246, 0.14), transparent 70%),
            radial-gradient(45vmax 35vmax at 90% 92%, rgba(6, 182, 212, 0.12), transparent 70%),
            radial-gradient(35vmax 25vmax at 50% 50%, rgba(59, 130, 246, 0.08), transparent 75%)
          `,
        }}
      />
    </>
  );
};
