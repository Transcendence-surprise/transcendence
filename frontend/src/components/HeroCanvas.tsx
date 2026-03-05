// src/components/HeroCanvas.tsx
import { useEffect, useRef } from "react";

type Props = { className?: string };

// This is your example ported 1:1 to React/TS:
// - same HSL color formula
// - same brightness pulsing
// - same blending ("lighter")
// - square turns (baseRad = 2π/4)
// - no sparkles (sparkChance: 0)
// - canvas fills its parent (hero container), not whole window
export default function HeroCanvas({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c?.getContext("2d")!;
    if (!c || !ctx) return;

    // ---- Original variables (adapted for parent-sized canvas) ----
    let w = 0;
    let h = 0;

    const opts = {
      len: 20,
      count: 50,
      baseTime: 30,
      addedTime: 10,
      dieChance: 0.05,
      spawnChance: 1,
      sparkChance: 0.0,
      sparkDist: 10,
      sparkSize: 2,

      color: "hsl(hue,100%,light%)",
      baseLight: 50,
      addedLight: 10,
      shadowToTimePropMult: 6,
      baseLightInputMultiplier: 0.01,
      addedLightInputMultiplier: 0.02,

      cx: 0,
      cy: 0,
      repaintAlpha: 0.04,
      hueChange: 0.1,
    };

    let tick = 0;
    const lines: Line[] = [];
    let dieX = 0;
    let dieY = 0;

    // square grid
    const baseRad = (Math.PI * 2) / 4;

    // --- resize that matches your hero container size (not window) ---
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // IMPORTANT: use parent size (your hero section), not window
      w = c.clientWidth || 1;
      h = c.clientHeight || 1;

      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);

      // draw in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);

      opts.cx = w / 2;
      opts.cy = h / 2;

      dieX = w / 2 / opts.len;
      dieY = h / 2 / opts.len;
    };

    function loop() {
      rafRef.current = window.requestAnimationFrame(loop);

      ++tick;

      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(0,0,0,${opts.repaintAlpha})`;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      if (lines.length < opts.count && Math.random() < opts.spawnChance) {
        lines.push(new Line());
      }

      for (const line of lines) line.step();
    }

    function Line() {
      this.reset();
    }

    type Line = {
      x: number;
      y: number;
      addedX: number;
      addedY: number;
      rad: number;
      lightInputMultiplier: number;
      color: string;
      cumulativeTime: number;
      time: number;
      targetTime: number;
      beginPhase: () => void;
      reset: () => void;
      step: () => void;
    };

    Line.prototype.reset = function () {
      this.x = 0;
      this.y = 0;
      this.addedX = 0;
      this.addedY = 0;

      this.rad = 0;

      this.lightInputMultiplier =
        opts.baseLightInputMultiplier +
        opts.addedLightInputMultiplier * Math.random();

      this.color = opts.color.replace("hue", String(tick * opts.hueChange));
      this.cumulativeTime = 0;

      this.beginPhase();
    };

    Line.prototype.beginPhase = function () {
      this.x += this.addedX;
      this.y += this.addedY;

      this.time = 0;
      this.targetTime =
        (opts.baseTime + opts.addedTime * Math.random()) | 0;

      this.rad += baseRad * (Math.random() < 0.5 ? 1 : -1);
      this.addedX = Math.cos(this.rad);
      this.addedY = Math.sin(this.rad);

      // optional but helps square feel: snap to grid directions exactly
      this.addedX = Math.round(this.addedX);
      this.addedY = Math.round(this.addedY);

      if (
        Math.random() < opts.dieChance ||
        this.x > dieX ||
        this.x < -dieX ||
        this.y > dieY ||
        this.y < -dieY
      ) {
        this.reset();
      }
    };

    Line.prototype.step = function () {
      ++this.time;
      ++this.cumulativeTime;

      if (this.time >= this.targetTime) this.beginPhase();

      const prop = this.time / this.targetTime;
      const wave = Math.sin((prop * Math.PI) / 2);
      const x = this.addedX * wave;
      const y = this.addedY * wave;

      ctx.shadowBlur = prop * opts.shadowToTimePropMult;

      const light =
        opts.baseLight +
        opts.addedLight *
          Math.sin(this.cumulativeTime * this.lightInputMultiplier);

      const col = this.color.replace("light", String(light));
      ctx.fillStyle = col;
      ctx.shadowColor = col;

      // thickness: change last 2 numbers (2,2)
      ctx.fillRect(
        opts.cx + (this.x + x) * opts.len,
        opts.cy + (this.y + y) * opts.len,
        2,
        2
      );

      // sparkles OFF in your config (sparkChance: 0), but kept for parity
      if (Math.random() < opts.sparkChance) {
        ctx.fillRect(
          opts.cx +
            (this.x + x) * opts.len +
            Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
            opts.sparkSize / 2,
          opts.cy +
            (this.y + y) * opts.len +
            Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
            opts.sparkSize / 2,
          opts.sparkSize,
          opts.sparkSize
        );
      }
    };

    // init
    resize();
    loop();

    // resize observer is better than window resize because hero height can change
    const ro = new ResizeObserver(() => resize());
    ro.observe(c);

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}