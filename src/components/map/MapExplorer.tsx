'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { Conversation, Person, Theme } from '@/lib/types';
import { createMap } from './engine';

type Props = { themes: Theme[]; people: Person[]; conversations: Conversation[]; regions: string[] };
type Mode = 'constellation' | 'geography';

// Remembers the view between visits in this tab, so Back returns to the same map view.
const KEY = 'dialoguers.map.mode';

// Small external stores so the map reads the phone breakpoint and the saved view without effects.
const subscribeMobile = (cb: () => void) => { const mq = matchMedia('(max-width: 640px)'); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); };
const getMobile = () => matchMedia('(max-width: 640px)').matches;
const modeListeners = new Set<() => void>();
const subscribeMode = (cb: () => void) => { modeListeners.add(cb); return () => { modeListeners.delete(cb); }; };
const getMode = (): Mode => { try { return sessionStorage.getItem(KEY) === 'geography' ? 'geography' : 'constellation'; } catch { return 'constellation'; } };
const saveMode = (m: Mode) => { try { sessionStorage.setItem(KEY, m); } catch {} modeListeners.forEach((f) => f()); };

export default function MapExplorer(props: Props) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mode = useSyncExternalStore(subscribeMode, getMode, () => 'constellation' as Mode);
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, () => false);

  const effective: Mode = mobile ? 'constellation' : mode; // Geography is hidden on phones

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const engine = createMap(props, (href: string) => router.push(href));
    el.className = ''; el.innerHTML = '';
    const state = { theme: true, conv: false, host: false, filter: null };
    const ctl = effective === 'constellation' ? engine.mountConstellation(el, { state }) : engine.mountGeo(el, { state });
    return () => { ctl.destroy(); el.innerHTML = ''; };
  }, [effective, mobile, props, router]);

  const pick = (m: Mode) => saveMode(m);
  const hint = effective === 'geography'
    ? 'Hover a guest to see who shares their themes'
    : mobile ? 'Swipe to rotate · tap a topic cloud to bring it forward · tap a guest for their profile'
      : 'Drag to rotate · click a topic cloud to bring it forward · arrow keys work too';

  return (
    <div className="mapwrap">
      <div className="mapstage">
        <div id="mapRoot" ref={root} />
        <div className="mapfoot">
          <div className="seg" role="group" aria-label="Map view">
            {(['constellation', 'geography'] as Mode[]).map((m) => (
              <button key={m} className={effective === m ? 'on' : ''} aria-pressed={effective === m} onClick={() => pick(m)}>
                {m === 'constellation' ? 'Constellation' : 'Geography'}
              </button>
            ))}
          </div>
          <p className="muted">{hint}</p>
        </div>
      </div>
    </div>
  );
}
