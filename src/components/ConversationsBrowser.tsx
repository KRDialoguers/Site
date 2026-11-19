'use client';
import { useMemo, useState } from 'react';
import type { Content } from '@/lib/types';
import { byDate, indexes, plural } from '@/lib/util';
import { ConvCard } from '@/lib/ui';

export default function ConversationsBrowser({ content }: { content: Content }) {
  const { P, T } = useMemo(() => indexes(content), [content]);
  const [f, setF] = useState({ theme: 'all', format: 'all', region: 'all', sort: 'new' });
  const list = content.conversations
    .filter((c) => (f.theme === 'all' || c.themes.includes(f.theme)) && (f.format === 'all' || c.format === f.format) && (f.region === 'all' || c.guests.some((g) => P[g]?.region === f.region)))
    .sort(f.sort === 'old' ? (a, b) => -byDate(a, b) : f.sort === 'long' ? (a, b) => b.minutes - a.minutes : byDate);
  const chip = (k: 'theme' | 'format', v: string, label: string) => (
    <button key={v} className={`chip${f[k] === v ? ' on' : ''}`} onClick={() => setF({ ...f, [k]: v })}>{label}</button>
  );
  return (
    <>
      <div className="filters">
        <div className="grp"><span>Theme</span>{chip('theme', 'all', 'All')}{content.themes.map((t) => chip('theme', t.id, t.short || t.name))}</div>
        <div className="grp"><span>Format</span>{chip('format', 'all', 'All')}{chip('format', 'video', 'Video')}{chip('format', 'audio', 'Audio')}</div>
        <div className="grp">
          <select className="sel" aria-label="Region" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
            <option value="all">All regions</option>{content.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="sel" aria-label="Sort" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })}>
            <option value="new">Newest</option><option value="old">Oldest</option><option value="long">Longest</option>
          </select>
        </div>
      </div>
      {list.length ? (
        <>
          <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>{plural(list.length, 'conversation')}</p>
          <div className="grid g3">{list.map((c) => <ConvCard key={c.id} c={c} P={P} T={T} />)}</div>
        </>
      ) : <div className="empty">No conversations match these filters yet.</div>}
    </>
  );
}
