import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { fmtDate, indexes, names, thumbVars } from '@/lib/util';
import { Av, NoteArt } from '@/lib/ui';
import * as I from '@/lib/icons';
import NewsletterBox from '@/components/NewsletterBox';

type Params = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getContent()).notes.map((n) => ({ slug: n.id })); }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params; const n = (await getContent()).notes.find((x) => x.id === slug);
  return n ? { title: `${n.title} ${n.subtitle ?? ''}`.trim(), description: n.dek } : {};
}

const GLANCE_ICONS = [I.Idea, I.Why, I.Bolt];
const LEVELS = ['Light', 'Easy', 'Moderate', 'Dense', 'Deep'];

export default async function NotePage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const { P, T, C } = indexes(content);
  const n = content.notes.find((x) => x.id === slug);
  if (!n) notFound();
  const host = content.settings.host;
  const k = Math.min(5, Math.max(1, n.nutrition?.complexity || 1));
  return (
    <div className="wrap">
      <div className="essay">
        <article>
          <div className="ekicker"><b>Dialoguers / Field Notes</b><span>{n.kicker}</span></div>
          <h1>{n.title}{n.subtitle && <span>{n.subtitle}</span>}</h1>
          <p className="dek">{n.dek}</p>
          <div className="byline"><Av p={{ name: host.name }} size={40} T={T} host /><span>By {host.name}</span><i className="sep" /><span>{fmtDate(n.date)}</span><i className="sep" /><span>{n.minutes} min read</span></div>
          <NoteArt n={n} T={T} />
          <div className="esec"><div className="label">The big picture</div><p className="big">{n.bigPicture}</p></div>
          {n.insights.length > 0 && <div className="esec"><div className="label">{n.insights.length} key insight{n.insights.length > 1 ? 's' : ''}</div>
            {n.insights.map((x, i) => <div key={i} className="ins"><span className="n">{i + 1}</span><p><b>{x.lead}</b> {x.text}</p></div>)}</div>}
          {n.takeaway && <div className="take"><div className="label">The takeaway</div><p>{n.takeaway}</p></div>}
          {n.watch.length > 0 && <div className="esec"><div className="label">{n.watchLabel}</div><div className="watch" style={{ marginTop: 0 }}>{n.watch.map((w, i) => <div key={i}><b>{w.label}</b><p>{w.text}</p></div>)}</div></div>}
        </article>
        <aside className="aside">
          {n.glance.length > 0 && <div className="gl"><div className="label" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>At a glance</div>
            {n.glance.map((g, i) => { const Ic = GLANCE_ICONS[i] || I.Idea; return <div key={i} className="row"><Ic /><div><b>{g.label}</b><p>{g.text}</p></div></div>; })}</div>}
          {n.nutrition && <div className="nut"><div className="hd">THE NUTRITION GUIDE</div>
            <div className="row"><I.Book /><div><b>Topic</b><p>{n.nutrition.topic}</p></div></div>
            <div className="row"><I.Layers /><div><b>Key ingredients</b><p>{n.nutrition.ingredients}</p></div></div>
            <div className="row"><I.Gauge /><div><b>Complexity</b><p className="dots">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= k ? 'f' : ''} />)}<span style={{ marginLeft: 8 }}>{LEVELS[k - 1]}</span></p></div></div>
            <div className="row"><I.Clock /><div><b>Time to absorb</b><p>{n.nutrition.time}</p></div></div>
            <div className="row"><I.Bulb /><div><b>Good for</b><p>{n.nutrition.goodFor}</p></div></div></div>}
          {n.related.length > 0 && <div className="box"><h4>Related conversations</h4>
            {n.related.map((id) => C[id] && <Link key={id} className="guest" href={`/conversations/${id}`}><div className="thumb" style={{ ...thumbVars(C[id], T), width: 64, aspectRatio: '1', borderRadius: 10, flex: 'none' }} /><div><b>{C[id].title}</b><small>With {names(C[id].guests, P)}</small></div></Link>)}</div>}
          <NewsletterBox />
        </aside>
      </div>
    </div>
  );
}
