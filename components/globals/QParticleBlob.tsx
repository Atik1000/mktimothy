"use client";

import { useEffect, useRef } from "react";

interface QParticleBlobProps {
  /** Use darker particles when the menu background is light. */
  isLightBg?: boolean;
}

/**
 * Animated particle "Q" sphere that mirrors the look of the homepage hero blob.
 *
 * A point cloud is distributed over a sphere with the golden-spiral method,
 * rotated every frame and projected to 2D with simple perspective so it reads
 * as a slowly spinning 3D particle sphere. On dark backgrounds the particles
 * are blended additively for the luminous cyan glow seen on the homepage; on
 * light backgrounds they switch to deeper blues so they stay visible.
 * A diagonal "tail" bar completes the Q.
 */
const QParticleBlob = ({ isLightBg = false }: QParticleBlobProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Keep the latest theme without restarting the animation loop.
  const lightRef = useRef(isLightBg);
  lightRef.current = isLightBg;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      // Use layout size (not getBoundingClientRect) so the scale-in entrance
      // transform doesn't shrink the backing store / blur the particles.
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Build a golden-spiral sphere (even point distribution) ──
    const COUNT = 1300;
    const baseX = new Float32Array(COUNT);
    const baseY = new Float32Array(COUNT);
    const baseZ = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      baseX[i] = Math.cos(theta) * r;
      baseY[i] = y;
      baseZ[i] = Math.sin(theta) * r;
    }

    const rotZ = new Float32Array(COUNT);
    const sx = new Float32Array(COUNT);
    const sy = new Float32Array(COUNT);
    const order = new Uint16Array(COUNT);
    for (let i = 0; i < COUNT; i++) order[i] = i;

    const D = 2.6; // camera distance (in sphere radii)
    let t = 0;

    const frame = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.27;
      const light = lightRef.current;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      // Gentle spin + a touch of tilt wobble for a 3D feel.
      t += 0.004;
      const cosY = Math.cos(t);
      const sinY = Math.sin(t);
      const tilt = 0.5 + Math.sin(t * 0.5) * 0.06;
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      for (let i = 0; i < COUNT; i++) {
        const bx = baseX[i];
        const by = baseY[i];
        const bz = baseZ[i];
        // rotate around Y
        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        // rotate around X (tilt)
        const y2 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;
        const proj = D / (D - z2);
        sx[i] = cx + x1 * baseR * proj;
        sy[i] = cy + y2 * baseR * proj;
        rotZ[i] = z2;
      }

      // Depth sort so near particles draw on top (far -> near).
      order.sort((a, b) => rotZ[a] - rotZ[b]);

      // Additive glow on dark backgrounds, normal painting on light ones.
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";

      for (let k = 0; k < COUNT; k++) {
        const i = order[k];
        const depth = (rotZ[i] + 1) / 2; // 0 far .. 1 near

        let cr: number;
        let cg: number;
        let cb: number;
        let alpha: number;
        let size: number;

        if (light) {
          cr = 22 + depth * 28;
          cg = 70 + depth * 70;
          cb = 120 + depth * 70;
          alpha = 0.25 + depth * 0.65;
          size = (0.55 + depth * 1.7) * dpr;
        } else {
          cr = 60 + depth * 120;
          cg = 160 + depth * 80;
          cb = 200 + depth * 55;
          alpha = 0.1 + depth * 0.5;
          size = (0.5 + depth * 1.6) * dpr;
        }

        ctx.beginPath();
        ctx.arc(sx[i], sy[i], size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Q tail */}
      <div
        className="absolute"
        style={{
          width: "30%",
          height: "44%",
          bottom: "2%",
          right: "6%",
          transform: "rotate(-45deg)",
          borderRadius: "6px",
          background: isLightBg ? "rgba(39,12,65,0.16)" : "rgba(255,255,255,0.14)",
          transition: "background 0.35s ease",
        }}
      />
    </div>
  );
};

export default QParticleBlob;


