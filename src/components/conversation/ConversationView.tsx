'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation } from '@/lib/types';
import { fmtTime, toSeconds } from '@/lib/util';
import * as I from '@/lib/icons';
import Illustration from './Illustration';
import AudioGraph from './AudioGraph';

type YTPlayer = { seekTo(s: number, allow: boolean): void; playVideo(): void; pauseVideo(): void; getCurrentTime(): number; getPlayerState(): number };
declare global { interface Window { YT?: { Player: new (el: HTMLElement, o: object) => YTPlayer }; onYouTubeIframeAPIReady?: () => void } }

function loadYT(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((res) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); res(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    }
  });
}


/**
 * Detail-page experience: participants on the left (passed in as `aside`), and on the right
 * the stage (animated illustration for audio, YouTube for video), the player, chapters and
 * a transcript that follows playback.
 *
 * Media source, in order: YouTube ID (video) → audio URL → none. With no media, the controls are
 * disabled — except on the sample-content site (`demo`), where a simulated clock lets the layout
 * and animation be reviewed before real episodes exist.
 */
export default function ConversationView({ c, aside, soft, speakerNames, demo = false }: {
  c: Conversation;
  aside: React.ReactNode;
  soft: string;
  speakerNames: Record<string, string>;
  demo?: boolean;
}) {
  const mode: 'youtube' | 'audio' | 'preview' | 'none' = c.format === 'video' && c.media.youtubeId ? 'youtube' : c.media.audioUrl ? 'audio' : c.media.youtubeId ? 'youtube' : demo ? 'preview' : 'none';
  const duration = c.minutes * 60;
  const chapters = useMemo(() => c.chapters.map((ch) => ({ ...ch, s: toSeconds(ch.time) })), [c.chapters]);
  const lines = useMemo(() => c.transcript.map((l) => ({ ...l, s: toSeconds(l.time) })), [c.transcript]);

  const [t, setT] = useState(0);
  const [dur, setDur] = useState(duration);
  const [playing, setPlaying] = useState(false);
  const [q, setQ] = useState('');
  const [ytStarted, setYtStarted] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const ytEl = useRef<HTMLDivElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const pendingSeek = useRef<number | null>(null);

  // Preview mode: simulated clock
  useEffect(() => {
    if (mode !== 'preview' || !playing) return;
    const id = setInterval(() => setT((x) => { const n = x + 0.25; if (n >= dur) { setPlaying(false); return dur; } return n; }), 250);
    return () => clearInterval(id);
  }, [mode, playing, dur]);

  // YouTube: load only when the visitor presses play
  useEffect(() => {
    if (mode !== 'youtube' || !ytStarted || !ytEl.current) return;
    let timer: ReturnType<typeof setInterval>;
    loadYT().then(() => {
      yt.current = new window.YT!.Player(ytEl.current!, {
        videoId: c.media.youtubeId, playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: () => { if (pendingSeek.current != null) { yt.current!.seekTo(pendingSeek.current, true); pendingSeek.current = null; } yt.current!.playVideo(); } },
      });
      timer = setInterval(() => { try { setT(yt.current?.getCurrentTime() ?? 0); setPlaying(yt.current?.getPlayerState() === 1); } catch {} }, 500);
    });
    return () => clearInterval(timer);
  }, [mode, ytStarted, c.media.youtubeId]);

  const toggle = () => {
    if (mode === 'none') return;
    if (mode === 'audio' && audio.current) { if (audio.current.paused) audio.current.play().catch(() => {}); else audio.current.pause(); return; }
    if (mode === 'youtube') { if (!ytStarted) setYtStarted(true); else if (playing) yt.current?.pauseVideo(); else yt.current?.playVideo(); return; }
    if (t >= dur) setT(0);
    setPlaying((p) => !p);
  };
  const seek = (s: number, andPlay = true) => {
    if (mode === 'none') return;
    s = Math.max(0, Math.min(dur, s));
    if (mode === 'audio' && audio.current) { audio.current.currentTime = s; if (andPlay) audio.current.play().catch(() => {}); }
    else if (mode === 'youtube') { if (yt.current) { yt.current.seekTo(s, true); if (andPlay) yt.current.playVideo(); } else { pendingSeek.current = s; setYtStarted(true); } }
    else if (andPlay) setPlaying(true);
    setT(s);
  };

  const curCh = chapters.reduce((a, ch, i) => (t >= ch.s ? i : a), 0);
  const started = playing || t > 0;
  const curLine = started ? lines.reduce((a, l, i) => (t >= l.s ? i : a), -1) : -1;
  const speaker: 'a' | 'b' | null = playing && curLine >= 0 ? (lines[curLine].speaker ? 'b' : 'a') : null;
  const ql = q.trim().toLowerCase();
  const mark = (text: string) => {
    if (!ql) return text;
    const esc = ql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.split(new RegExp(`(${esc})`, 'gi')).map((p, i) => (p.toLowerCase() === ql ? <mark key={i}>{p}</mark> : p));
  };
  const showYT = mode === 'youtube' && ytStarted;

  return (
    <div className="cx">
      <div className="cx-aside">{aside}</div>

      <div className="cx-media">
        <div className={`cx-stage${showYT ? ' is-video' : ''}`} style={{ ['--soft' as string]: soft }}>
          {showYT ? <div className="yt" ref={ytEl} /> : (
            <>
              <div className="cx-art"><Illustration playing={playing} speaker={speaker} /></div>
              <AudioGraph playing={playing} time={t} seed={c.id} />
            </>
          )}
          {mode === 'youtube' && !ytStarted && <span className="cx-badge">Video</span>}
        </div>

        {mode === 'audio' && (
          <audio ref={audio} src={c.media.audioUrl!} preload="metadata"
            onLoadedMetadata={(e) => isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
            onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        )}

        {!showYT && (
          <div className={`cx-bar${mode === 'none' ? ' is-off' : ''}`}>
            <button className="cx-play" onClick={toggle} disabled={mode === 'none'} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <I.Pause size={20} /> : <I.Play size={20} />}
            </button>
            <span className="cx-time">{fmtTime(t)}</span>
            <input className="cx-range" type="range" min={0} max={Math.max(1, Math.round(dur))} step={1} value={Math.round(t)} disabled={mode === 'none'}
              aria-label="Playback position" aria-valuetext={`${fmtTime(t)} of ${fmtTime(dur)}`}
              style={{ ['--pct' as string]: `${dur ? (t / dur) * 100 : 0}%` }}
              onChange={(e) => seek(Number(e.target.value), playing)} />
            <span className="cx-time">{mode === 'none' ? 'Audio coming soon' : fmtTime(dur)}</span>
          </div>
        )}

        {chapters.length > 0 && (
          <div className="cx-chapters">
            {chapters.map((ch, i) => (
              <button key={i} className={started && i === curCh ? 'on' : ''} onClick={() => seek(ch.s)}>
                <b>{ch.time}</b>{ch.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="cx-transcript transcript">
          <div className="tools">
            <h3>Transcript</h3>
            <input type="search" placeholder="Search transcript" aria-label="Search transcript" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="tlines">
            {lines.map((l, i) => (!ql || l.text.toLowerCase().includes(ql)) && (
              <div key={i} className={`tline${i === curLine ? ' on' : ''}`} onClick={() => seek(l.s)}>
                <span className="ts">{fmtTime(l.s)}</span>
                <span className="sp">{l.speaker ? speakerNames[l.speaker] ?? '' : speakerNames.__host}</span>
                <span className="tx">{mark(l.text)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
