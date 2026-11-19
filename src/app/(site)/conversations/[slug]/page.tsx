import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { byDate, fmtDate, indexes, thumbVars } from '@/lib/util';
import { Av, ConvCard, ThemeChip } from '@/lib/ui';
import Player from '@/components/Player';
import Newsletter from '@/components/Newsletter';

type Params = { params: Promise<{ slug: string }> };

// Decorative waveform for audio conversations, stable per conversation.
function waveHeights(id: string) {
  let seed = id.length * 7;
  return Array.from({ length: 90 }, () => { seed = (seed * 9301 + 49297) % 233280; return Math.round(12 + (seed / 233280) * 88); });
}

export async function generateStaticParams() {
  return (await getContent()).conversations.map((c) => ({ slug: c.id }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getContent()).conversations.find((x) => x.id === slug);
  return c ? { title: c.title, description: c.dek } : {};
}

export default async function ConversationPage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const { P, T } = indexes(content);
  const c = content.conversations.find((x) => x.id === slug);
  if (!c) notFound();
  const host = content.settings.host;
  const related = content.conversations.filter((x) => x !== c)
    .map((x) => ({ x, s: x.themes.filter((t) => c.themes.includes(t)).length * 2 + x.guests.filter((g) => c.guests.includes(g)).length * 3 }))
    .filter((r) => r.s).sort((a, b) => b.s - a.s || byDate(a.x, b.x)).slice(0, 3).map((r) => r.x);
  const speakerNames = Object.fromEntries([...c.guests.map((g) => [g, P[g]?.name ?? '']), ['__host', host.name]]);
  const stage = c.format === 'video'
    ? <div className="stack"><Av p={{ name: host.name }} size={96} T={T} host />{c.guests.map((g) => P[g] && <Av key={g} p={P[g]} size={96} T={T} />)}</div>
    : <div className="wave">{waveHeights(c.id).map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>;

  return (
    <>
      <div className="wrap">
        <div className="crumbs"><Link href="/conversations">Conversations</Link> / {c.title}</div>
        <div className="cd-head">
          <span className="eyebrow">{c.format === 'video' ? 'Video' : 'Audio'} conversation</span>
          <h1>{c.title}</h1>
          <p className="dek">{c.dek}</p>
          <div className="cd-meta">
            <span>{fmtDate(c.date)}</span><span>{c.minutes} min</span><span>Hosted by {host.name}</span>
            <div className="chips">{c.themes.map((t) => T[t] && <ThemeChip key={t} t={T[t]} />)}{c.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          </div>
        </div>
        <div className="cd">
          <Player c={c} stage={stage} style={thumbVars(c, T)} speakerNames={speakerNames} />
          <aside className="side">
            <div className="box">
              <h4>In this conversation</h4>
              <Link className="guest" href="/about"><Av p={{ name: host.name }} size={52} T={T} host /><div><b>{host.name}</b><small>Host</small></div></Link>
              {c.guests.map((g) => P[g] && (
                <Link key={g} className="guest" href={`/people/${g}`}><Av p={P[g]} size={52} T={T} /><div><b>{P[g].name}</b><small>{P[g].role} · {P[g].city}</small></div></Link>
              ))}
            </div>
            {c.questions.length > 0 && <div className="box"><h4>Questions explored</h4><ul className="qs">{c.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>}
            {c.media.youtubeId && (
              <div className="box"><h4>Watch elsewhere</h4><div className="listen">
                <a href={`https://www.youtube.com/watch?v=${c.media.youtubeId}`} target="_blank" rel="noreferrer"><span>YouTube<em>Open ↗</em></span></a>
              </div></div>
            )}
          </aside>
        </div>
      </div>
      {related.length > 0 && (
        <section><div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Common threads</span><h2 style={{ marginTop: 8 }}>Related conversations</h2></div></div>
          <div className="grid g3">{related.map((x) => <ConvCard key={x.id} c={x} P={P} T={T} />)}</div>
        </div></section>
      )}
      <section style={{ paddingTop: 0 }}><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
