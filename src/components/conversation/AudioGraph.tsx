'use client';
import { useEffect, useRef } from 'react';

/**
 * Animated audio graph along the bottom of the stage.
 *
 * Bars move while the conversation plays and settle to a flat line when paused.
 * Levels come from `peaks` (one value per second of audio, 0–1) when available, shaped
 * with gentle per-bar motion so it reads as speech; without peaks it uses a stable
 * pseudo-random envelope. (Reading live levels from the audio element would need the
 * podcast host to allow cross-origin access, so the site doesn't depend on it.)
 */
export default function AudioGraph({ playing, time, peaks, seed, ink = '#1E1A17' }: {
  playing: boolean;
  time: number;
  peaks?: number[];
  seed: string;
  ink?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ playing, time, levels: [] as number[] });
  useEffect(() => { state.current.playing = playing; state.current.time = time; }, [playing, time]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MAX = 260; // bars are thin and spaced ~7px apart, so the count follows the width
    let s = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 11);
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const freq = Array.from({ length: MAX }, () => 1.5 + rnd() * 3.5);
    const phase = Array.from({ length: MAX }, () => rnd() * Math.PI * 2);
    const env = (sec: number) => {
      if (peaks?.length) return peaks[Math.min(peaks.length - 1, Math.max(0, Math.floor(sec)))];
      const k = Math.floor(sec * 2);
      const v = Math.sin(k * 12.9898 + s) * 43758.5453;
      return 0.45 + 0.55 * (v - Math.floor(v));
    };
    const levels = state.current.levels.length === MAX ? state.current.levels : (state.current.levels = new Array(MAX).fill(0.04));
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { playing: on, time: t } = state.current;
      const w = el.clientWidth, h = el.clientHeight, dpr = window.devicePixelRatio || 1;
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const N = Math.max(24, Math.min(MAX, Math.floor(w / 7)));
      const amp = on ? env(t) : 0;
      let moving = false;
      const clock = now / 1000;
      for (let i = 0; i < N; i++) {
        const target = on && !reduced
          ? Math.max(0.06, amp * (0.55 + 0.45 * Math.sin((i / (N - 1)) * Math.PI)) * (0.35 + 0.65 * Math.abs(Math.sin(clock * freq[i] + phase[i]))))
          : 0.04;
        const next = levels[i] + (target - levels[i]) * Math.min(1, dt * (on ? 10 : 4));
        if (Math.abs(next - levels[i]) > 0.001) moving = true;
        levels[i] = next;
      }
      const bw = 3, gap = (w - bw * N) / Math.max(1, N - 1), mid = h / 2;
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < N; i++) {
        const bh = Math.max(2, levels[i] * h * 0.9);
        const x = i * (bw + gap);
        ctx.beginPath();
        ctx.roundRect(x, mid - bh / 2, bw, bh, bw / 2);
        ctx.fill();
      }
      if (on || moving) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(draw); } };
    kick();
    const ro = new ResizeObserver(kick);
    ro.observe(el);
    const id = setInterval(() => { if (state.current.playing) kick(); }, 200);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearInterval(id); };
  }, [peaks, seed, ink]);

  return <canvas ref={canvas} className="cx-graph" aria-hidden="true" />;
}
