'use client';
import { useMemo, useState } from 'react';
import type { Content } from '@/lib/types';
import { convsOf, indexes } from '@/lib/util';
import { PersonCard } from '@/lib/ui';
import * as I from '@/lib/icons';

export default function PeopleBrowser({ content }: { content: Content }) {
  const { T } = useMemo(() => indexes(content), [content]);
  const all = content.conversations;
  const fields = [...new Set(content.people.map((p) => p.field).filter(Boolean))];
  const [s, setS] = useState({ q: '', region: 'all', theme: 'all', field: 'all', sort: 'recent' });
  const last = (id: string) => convsOf(id, all)[0]?.date ?? '';
  const q = s.q.toLowerCase();
  const list = content.people
    .filter((p) => (!q || [p.name, p.role, p.city, p.region, ...p.themes.map((t) => T[t]?.name)].join(' ').toLowerCase().includes(q))
      && (s.region === 'all' || p.region === s.region) && (s.theme === 'all' || p.themes.includes(s.theme)) && (s.field === 'all' || p.field === s.field))
    .sort(s.sort === 'az' ? (a, b) => a.name.localeCompare(b.name) : s.sort === 'most' ? (a, b) => convsOf(b.id, all).length - convsOf(a.id, all).length : (a, b) => last(b.id).localeCompare(last(a.id)));
  return (
    <>
      <div className="filters">
        <div className="search" style={{ display: 'block' }}><I.Search /><input className="psearch" type="search" placeholder="Search by name, topic, role or location" aria-label="Search people" value={s.q} onChange={(e) => setS({ ...s, q: e.target.value })} /></div>
        <div className="grp">
          <select className="sel" aria-label="Region" value={s.region} onChange={(e) => setS({ ...s, region: e.target.value })}><option value="all">All regions</option>{content.regions.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          <select className="sel" aria-label="Theme" value={s.theme} onChange={(e) => setS({ ...s, theme: e.target.value })}><option value="all">All themes</option>{content.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <select className="sel" aria-label="Sort" value={s.sort} onChange={(e) => setS({ ...s, sort: e.target.value })}><option value="recent">Sort: Recent</option><option value="az">Sort: A–Z</option><option value="most">Sort: Most conversations</option></select>
        </div>
        <div className="grp" style={{ width: '100%' }}>
          <button className={`chip${s.field === 'all' ? ' on' : ''}`} onClick={() => setS({ ...s, field: 'all' })}>All people ({content.people.length})</button>
          {fields.map((f) => <button key={f} className={`chip${s.field === f ? ' on' : ''}`} onClick={() => setS({ ...s, field: f })}>{f}</button>)}
        </div>
      </div>
      {list.length ? <div className="grid g5">{list.map((p) => <PersonCard key={p.id} p={p} T={T} all={all} />)}</div> : <div className="empty">No one matches that search yet.</div>}
    </>
  );
}
