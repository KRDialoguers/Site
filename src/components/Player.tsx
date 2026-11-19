'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation } from '@/lib/types';
import { fmtTime, toSeconds } from '@/lib/util';
import * as I from '@/lib/icons';

type YTPlayer = { seekTo(s: number, allow: boolean): void; playVideo(): void; getCurrentTime(): number };
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
 * Plays the conversation from whichever host it has: a YouTube ID (embedded with the IFrame API)
 * or an audio URL (native <audio>). Chapters and transcript lines seek the player, and the
 * transcript highlights the line being spoken. With no media yet, it shows a "coming soon" stage.
 */
export default function Player({ c, stage, style, speakerNames }: { c: Conversation; stage: React.ReactNode; style: React.CSSProperties; speakerNames: Record<string, string> }) {
  const yt = c.media.youtubeId, audio = c.media.audioUrl;
  const chapters = useMemo(() => c.chapters.map((ch) => ({ ...ch, s: toSeconds(ch.time) })), [c.chapters]);
  const lines = useMemo(() => c.transcript.map((l) => ({ ...l, s: toSeconds(l.time) })), [c.transcript]);
  const [t, setT] = useState(0);
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState('');
  const ytEl = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<YTPlayer | null>(null);
  const audioEl = useRef<HTMLAudioElement>(null);
  const pending = useRef<number | null>(null);

  // Start YouTube only when asked (keeps page light and avoids loading YouTube for every visitor)
  useEffect(() => {
    if (!yt || !started || !ytEl.current) return;
    let timer: ReturnType<typeof setInterval>;
    loadYT().then(() => {
      ytPlayer.current = new window.YT!.Player(ytEl.current!, {
        videoId: yt, playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: () => { if (pending.current != null) { ytPlayer.current!.seekTo(pending.current, true); pending.current = null; } ytPlayer.current!.playVideo(); } },
      });
      timer = setInterval(() => { try { setT(ytPlayer.current?.getCurrentTime() ?? 0); } catch {} }, 500);
    });
    return () => clearInterval(timer);
  }, [yt, started]);

  const seek = (s: number) => {
    if (yt) { if (ytPlayer.current) { ytPlayer.current.seekTo(s, true); ytPlayer.current.playVideo(); } else { pending.current = s; setStarted(true); } }
    else if (audio && audioEl.current) { audioEl.current.currentTime = s; audioEl.current.play().catch(() => {}); }
    setT(s);
  };
  const hasMedia = Boolean(yt || audio);
  const curCh = chapters.reduce((a, ch, i) => (t >= ch.s ? i : a), 0);
  const curLine = hasMedia && (started || t > 0) ? lines.reduce((a, l, i) => (t >= l.s ? i : a), -1) : -1;
  const ql = q.trim().toLowerCase();
  const mark = (text: string) => {
    if (!ql) return text;
    const parts = text.split(new RegExp(`(${ql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((p, i) => (p.toLowerCase() === ql ? <mark key={i}>{p}</mark> : p));
  };

  return (
    <div>
      <div className="player" style={style}>
        <div className={`stage ${c.format}${yt && started ? ' has-embed' : ''}`} style={yt ? { aspectRatio: '16/9', height: 'auto' } : undefined}>
          {yt && started ? <div className="yt" ref={ytEl} /> : (
            <>
              {!hasMedia && <span className="hostnote">Coming soon</span>}
              {stage}
              {yt && <button className="bigplay" aria-label="Play video" onClick={() => setStarted(true)}><I.Play size={28} color="#16233A" /></button>}
            </>
          )}
        </div>
        {audio && <audio ref={audioEl} src={audio} controls preload="none" onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} style={{ width: '100%', display: 'block' }} />}
        {chapters.length > 0 && (
          <div className="chapters">
            {chapters.map((ch, i) => (
              <button key={i} className={i === curCh && hasMedia ? 'on' : ''} disabled={!hasMedia} onClick={() => seek(ch.s)}>
                <b>{ch.time}</b>{ch.title}
              </button>
            ))}
          </div>
        )}
      </div>
      {lines.length > 0 && (
        <div className="transcript">
          <div className="tools">
            <h3>Transcript</h3>
            <input type="search" placeholder="Search transcript" aria-label="Search transcript" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="tlines">
            {lines.filter((l) => !ql || l.text.toLowerCase().includes(ql)).map((l) => {
              const i = lines.indexOf(l);
              return (
                <div key={i} className={`tline${i === curLine ? ' on' : ''}`} onClick={() => hasMedia && seek(l.s)} style={hasMedia ? undefined : { cursor: 'default' }}>
                  <span className="ts">{fmtTime(l.s)}</span>
                  <span className="sp">{l.speaker ? speakerNames[l.speaker] ?? '' : speakerNames.__host}</span>
                  <span className="tx">{mark(l.text)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
