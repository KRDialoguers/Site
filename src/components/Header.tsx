'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as I from '@/lib/icons';

export type SearchItem = { k: string; href: string; label: string; text: string; color: string };

export default function Header({ nav, search }: { nav: [string, string][]; search: SearchItem[] }) {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hl, setHl] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => (q.trim() ? search.filter((x) => x.text.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : []), [q, search]);
  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));

  // Close the menu and clear search when the page changes
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setDrawer(false); setQ(''); }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setQ(''); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('click', onClick); };
  }, []);

  return (
    <>
      <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap">
          <Link className="logo" href="/">Dialoguers</Link>
          <nav className="nav" aria-label="Main">
            {nav.map(([h, l]) => <Link key={h} href={h} className={active(h) ? 'on' : ''}>{l}</Link>)}
          </nav>
          <div className="hdr-right">
            <div className="search" ref={box}>
              <I.Search />
              <input type="search" placeholder="Search" aria-label="Search" autoComplete="off" value={q}
                onChange={(e) => { setQ(e.target.value); setHl(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { setHl((h) => Math.min(h + 1, hits.length - 1)); e.preventDefault(); }
                  if (e.key === 'ArrowUp') { setHl((h) => Math.max(h - 1, 0)); e.preventDefault(); }
                  if (e.key === 'Enter' && hits[hl]) { router.push(hits[hl].href); setQ(''); }
                  if (e.key === 'Escape') setQ('');
                }} />
              <div className={`results${q.trim() ? ' open' : ''}`}>
                {hits.length ? hits.map((x, i) => (
                  <Link key={x.href} href={x.href} className={i === hl ? 'hl' : ''}>
                    <span style={{ width: 28, height: 28, borderRadius: x.k === 'Person' || x.k === 'Theme' ? '50%' : 8, background: x.color, flex: 'none' }} />
                    <span>{x.label}</span><span className="k">{x.k}</span>
                  </Link>
                )) : <div className="none">Nothing yet for “{q}”.</div>}
              </div>
            </div>
            <Link className="btn sm" href="/about#subscribe">Subscribe</Link>
            <button className="burger" aria-label="Menu" aria-expanded={drawer} onClick={() => setDrawer((d) => !d)}>
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
            </button>
          </div>
        </div>
      </header>
      <div className={`drawer${drawer ? ' open' : ''}`}>
        {nav.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
      </div>
    </>
  );
}
