import type { Content, Conversation, Person, Theme } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (d: string) => { const [y, m, dd] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`; };
export const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
export const toSeconds = (t: string) => t.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
export const fmtTime = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`;
};
export const byDate = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);
export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function indexes(c: Content) {
  const P = Object.fromEntries(c.people.map((p) => [p.id, p])) as Record<string, Person>;
  const T = Object.fromEntries(c.themes.map((t) => [t.id, t])) as Record<string, Theme>;
  const C = Object.fromEntries(c.conversations.map((x) => [x.id, x])) as Record<string, Conversation>;
  return { P, T, C };
}
export const names = (ids: string[], P: Record<string, Person>) => {
  const n = ids.map((id) => P[id]?.name).filter(Boolean) as string[];
  return n.length > 1 ? n.slice(0, -1).join(', ') + ' & ' + n.at(-1) : n[0] ?? '';
};
export const convsOf = (pid: string, all: Conversation[]) => all.filter((c) => c.guests.includes(pid)).sort(byDate);
export const tvars = (t: Theme) => ({ '--color': t.color, '--soft': t.soft, '--deep': t.deep }) as React.CSSProperties;
export const thumbVars = (c: Conversation, T: Record<string, Theme>) => {
  const a = T[c.themes[0]], b = T[c.themes[1]] || a;
  if (!a) return { '--c1': '#8a8f9c', '--c2': '#4b5263' } as React.CSSProperties;
  return { '--c1': a.color, '--c2': b === a ? a.deep : b.deep } as React.CSSProperties;
};
/** Latest conversation, and the featured one (never the same card twice). */
export function latestAndFeatured(c: Content) {
  const sorted = [...c.conversations].sort(byDate);
  const latest = sorted[0];
  const pick = c.settings?.featured ? sorted.find((x) => x.id === c.settings.featured) : sorted.find((x) => x.featured);
  const featured = pick && pick !== latest ? pick : sorted[1];
  return { latest, featured };
}
