import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { byDate, indexes, tvars } from '@/lib/util';
import { ConvCard, NoteRow, PersonCard } from '@/lib/ui';
import Newsletter from '@/components/Newsletter';

type Params = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getContent()).themes.map((t) => ({ slug: t.id })); }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params; const t = (await getContent()).themes.find((x) => x.id === slug);
  return t ? { title: t.name, description: t.blurb } : {};
}

export default async function ThemePage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const { P, T } = indexes(content);
  const t = T[slug];
  if (!t) notFound();
  const convs = content.conversations.filter((c) => c.themes.includes(t.id)).sort(byDate);
  const ppl = content.people.filter((p) => p.themes.includes(t.id));
  const notes = content.notes.filter((n) => n.theme === t.id);
  return (
    <>
      <div className="wrap">
        <div className="crumbs"><Link href="/themes">Themes</Link> / {t.name}</div>
        <div className="thead art" style={tvars(t)}>
          <span className="eyebrow" style={{ color: '#fff', opacity: 0.85, position: 'relative' }}>{t.tagline}</span>
          <h1 style={{ marginTop: 12 }}>{t.name}</h1>
          <p>{t.blurb}</p>
          <div className="chips">{t.subtopics.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </div>
      </div>
      <section><div className="wrap"><div className="sec-head"><h2>Conversations</h2><span className="muted">{convs.length} in this theme</span></div><div className="grid g3">{convs.map((c) => <ConvCard key={c.id} c={c} P={P} T={T} />)}</div></div></section>
      <section style={{ paddingTop: 0 }}><div className="wrap"><div className="sec-head"><h2>People</h2></div><div className="grid g5">{ppl.map((p) => <PersonCard key={p.id} p={p} T={T} all={content.conversations} />)}</div></div></section>
      {notes.length > 0 && <section style={{ paddingTop: 0 }}><div className="wrap"><div className="sec-head"><h2>Field Notes</h2></div><div className="rows nlist">{notes.map((n) => <NoteRow key={n.id} n={n} T={T} />)}</div></div></section>}
      <section style={{ paddingTop: 0 }}><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
