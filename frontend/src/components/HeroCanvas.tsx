// src/components/HeroCanvas.tsx
import { useEffect, useRef } from "react";

type Props = { className?: string };

export default function HeroCanvas({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c?.getContext("2d")!;
    if (!c || !ctx) return;

    // ========================================
    //  ANIMATION CONFIGURATION
    // ========================================
    const animationConfig = {
      // Enable/disable animations (set to false to turn off)
      enableTopLeft: true,
      enableBottomRight: true,
      
      // Position settings (0.0 to 1.0 as percentage of canvas width/height)
      // OR use negative numbers for pixel offset from edge (e.g., -100 for 100px from edge)
      topLeft: {
        x: 0.15,    // 15% from left (or use pixels: -150 for 150px from left)
        y: 0.15,    // 15% from top
      },
      bottomRight: {
        x: 0.85,    // 85% from left
        y: 0.85,    // 85% from top
      },
    };
    // ========================================

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
      // Fixed blue with pulsing brightness:
      //color: "hsl(220,100%,light%)",  // 220 = blue
      // Fixed red:
      //color: "hsl(0,100%,light%)",    // 0 = red
      // Fixed green:
      //color: "hsl(120,100%,light%)",  // 120 = green
      // Fixed purple:
      //color: "hsl(280,100%,light%)",  // 280 = purple
      // Less saturated (more pastel):
      //color: "hsl(hue,60%,light%)",   // 60% saturation instead of 100%
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
    const linesTopLeft: Line[] = [];
    const linesBottomRight: Line[] = [];
    let dieX = 0;
    let dieY = 0;

    // Centers for two animations
    let cxTopLeft = 0, cyTopLeft = 0;
    let cxBottomRight = 0, cyBottomRight = 0;

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

      // Calculate positions based on config (supports both % and pixel values)
      const calcPos = (val: number, dimension: number) => 
        val < 0 ? Math.abs(val) : val * dimension;
      
      cxTopLeft = calcPos(animationConfig.topLeft.x, w);
      cyTopLeft = calcPos(animationConfig.topLeft.y, h);
      
      cxBottomRight = calcPos(animationConfig.bottomRight.x, w);
      cyBottomRight = calcPos(animationConfig.bottomRight.y, h);

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

      // Spawn and draw top-left animation (if enabled)
      if (animationConfig.enableTopLeft) {
        if (linesTopLeft.length < opts.count && Math.random() < opts.spawnChance) {
          linesTopLeft.push(new Line(cxTopLeft, cyTopLeft));
        }
        for (const line of linesTopLeft) line.step();
      }

      // Spawn and draw bottom-right animation (if enabled)
      if (animationConfig.enableBottomRight) {
        if (linesBottomRight.length < opts.count && Math.random() < opts.spawnChance) {
          linesBottomRight.push(new Line(cxBottomRight, cyBottomRight));
        }
        for (const line of linesBottomRight) line.step();
      }
    }

    class Line {
      x: number = 0;
      y: number = 0;
      addedX: number = 0;
      addedY: number = 0;
      rad: number = 0;
      lightInputMultiplier: number = 0;
      color: string = "";
      cumulativeTime: number = 0;
      time: number = 0;
      targetTime: number = 0;
      cx: number = 0;  // Center X for this line
      cy: number = 0;  // Center Y for this line

      constructor(cx: number, cy: number) {
        this.cx = cx;
        this.cy = cy;
        this.reset();
      }

      reset() {
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
      }

      beginPhase() {
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
      }

      step() {
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
          this.cx + (this.x + x) * opts.len,
          this.cy + (this.y + y) * opts.len,
          2,
          2
        );

        // sparkles OFF in your config (sparkChance: 0), but kept for parity
        if (Math.random() < opts.sparkChance) {
          ctx.fillRect(
            this.cx +
              (this.x + x) * opts.len +
              Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
              opts.sparkSize / 2,
            this.cy +
              (this.y + y) * opts.len +
              Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
              opts.sparkSize / 2,
            opts.sparkSize,
            opts.sparkSize
          );
        }
      }
    }

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