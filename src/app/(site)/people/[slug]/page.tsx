import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { convsOf, indexes } from '@/lib/util';
import { Av, ConvRow, PersonCard, ThemeChip } from '@/lib/ui';
import * as I from '@/lib/icons';
import Newsletter from '@/components/Newsletter';

type Params = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getContent()).people.map((p) => ({ slug: p.id })); }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params; const p = (await getContent()).people.find((x) => x.id === slug);
  return p ? { title: p.name, description: `${p.role}. ${p.bio}` } : {};
}

export default async function PersonPage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const { P, T } = indexes(content);
  const p = P[slug];
  if (!p) notFound();
  const convs = convsOf(p.id, content.conversations);
  const co = [...new Set(convs.flatMap((c) => c.guests).filter((g) => g !== p.id))];
  return (
    <>
      <div className="wrap">
        <div className="crumbs"><Link href="/people">People</Link> / {p.name}</div>
        <div className="pp">
          <Av p={p} size={220} T={T} />
          <div>
            <span className="eyebrow">{p.field}</span>
            <h1>{p.name}</h1>
            <p className="ink2" style={{ fontSize: 18 }}>{p.role}</p>
            <div className="cd-meta" style={{ marginTop: 12 }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><I.Pin /> {p.city} · {p.region}</span>
              <div className="chips">{p.themes.map((t) => T[t] && <ThemeChip key={t} t={T[t]} />)}</div>
            </div>
            <p className="bio">{p.bio}</p>
          </div>
        </div>
      </div>
      {convs.length > 0 && <section style={{ paddingTop: 20 }}><div className="wrap"><div className="sec-head"><h2>Conversations</h2></div><div className="rows">{convs.map((c) => <ConvRow key={c.id} c={c} P={P} T={T} />)}</div></div></section>}
      {co.length > 0 && <section style={{ paddingTop: 0 }}><div className="wrap"><div className="sec-head"><h2>In dialogue with</h2></div><div className="grid g5">{co.map((id) => P[id] && <PersonCard key={id} p={P[id]} T={T} all={content.conversations} />)}</div></div></section>}
      <section style={{ paddingTop: 0 }}><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
