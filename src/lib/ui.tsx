import Link from 'next/link';
import type { Conversation, Note, Person, Theme } from './types';
import { convsOf, fmtDate, initials, names, plural, thumbVars, tvars } from './util';
import * as I from './icons';

type Maps = { P: Record<string, Person>; T: Record<string, Theme> };

export function Av({ p, size = 48, T, host = false }: { p: { name: string; themes?: string[]; photo?: string | null }; size?: number; T: Record<string, Theme>; host?: boolean }) {
  const style: React.CSSProperties & Record<string, string> = { '--s': `${size}px` } as never;
  if (!host && p.themes?.length) {
    const t1 = T[p.themes[0]], t2 = T[p.themes[1]] || t1;
    if (t1) { style['--a'] = t1.color; style['--b'] = t2 === t1 ? t1.deep : t2.deep; }
  }
  if (p.photo) style.backgroundImage = `url(${p.photo}?w=${size * 2}&h=${size * 2}&fit=crop)`;
  return (
    <span className={`av${host ? ' host' : ''}${p.photo ? ' photo' : ''}`} style={style} title={p.name}>
      {p.photo ? null : initials(p.name)}
    </span>
  );
}

export function ThemeChip({ t, link = true }: { t: Theme; link?: boolean }) {
  const label = t.short || t.name;
  return link
    ? <Link className="chip t" style={tvars(t)} href={`/themes/${t.id}`}>{label}</Link>
    : <span className="chip t" style={tvars(t)}>{label}</span>;
}

export function ConvCard({ c, P, T }: { c: Conversation } & Maps) {
  return (
    <Link className="card" href={`/conversations/${c.id}`}>
      <div className="thumb" style={thumbVars(c, T)}>
        <div className="rings" />
        <span className="dur">{c.format === 'video' ? <I.Video /> : <I.Audio />} {c.minutes} min</span>
        <div className="stack">{c.guests.map((g) => P[g] && <Av key={g} p={P[g]} size={52} T={T} />)}</div>
        <span className="play"><I.Play color="#16233A" /></span>
      </div>
      <div className="cbody">
        <div className="meta">{fmtDate(c.date)} · With {names(c.guests, P)}</div>
        <h3>{c.title}</h3>
        <p className="ink2">{c.dek}</p>
        <div className="chips">{c.themes.map((t) => T[t] && <ThemeChip key={t} t={T[t]} link={false} />)}</div>
      </div>
    </Link>
  );
}

export function ConvRow({ c, P, T }: { c: Conversation } & Maps) {
  return (
    <Link className="crow" href={`/conversations/${c.id}`}>
      <div className="thumb" style={thumbVars(c, T)}><div className="rings" /></div>
      <div><b>{c.title}</b><small>{fmtDate(c.date)} · {c.minutes} min {c.format} · With {names(c.guests, P)}</small></div>
      <div className="chips">{c.themes.map((t) => T[t] && <ThemeChip key={t} t={T[t]} link={false} />)}</div>
    </Link>
  );
}

export function PersonCard({ p, T, all }: { p: Person; T: Record<string, Theme>; all: Conversation[] }) {
  const n = convsOf(p.id, all).length;
  return (
    <Link className="pcard" href={`/people/${p.id}`}>
      <Av p={p} size={112} T={T} />
      <b>{p.name}</b>
      <span className="loc"><I.Pin /> {p.city}</span>
      <span className="role">{p.role}</span>
      <span className="cnt"><I.Chat /> {plural(n, 'conversation')}</span>
      <div className="chips">{p.themes.map((t) => T[t] && <ThemeChip key={t} t={T[t]} link={false} />)}</div>
    </Link>
  );
}

export function NoteArt({ n, T, className = 'ehero art', style }: { n: Note; T: Record<string, Theme>; className?: string; style?: React.CSSProperties }) {
  const t = T[n.theme];
  return <div className={className} style={{ ...(t ? tvars(t) : {}), ...style }} />;
}

export function NoteRow({ n, T }: { n: Note; T: Record<string, Theme> }) {
  return (
    <Link className="crow" href={`/notes/${n.id}`}>
      <NoteArt n={n} T={T} />
      <div><span className="eyebrow">{n.kicker}</span><b>{n.title} {n.subtitle}</b><small>{fmtDate(n.date)} · {n.minutes} min read</small></div>
      <span className="go">Read <I.Arrow /></span>
    </Link>
  );
}
