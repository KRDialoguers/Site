import Link from 'next/link';
import { getContent } from '@/lib/content';
import { indexes, latestAndFeatured, fmtDate, names, thumbVars } from '@/lib/util';
import { Av } from '@/lib/ui';
import * as I from '@/lib/icons';
import MapExplorer from '@/components/map/MapExplorer';

export default async function Home() {
  const c = await getContent();
  const { P, T } = indexes(c);
  const { latest, featured } = latestAndFeatured(c);
  return (
    <>
      <div className="wrap">
        <div className="phead lp">
          <h1>{c.settings.tagline}</h1>
          <p className="lead">{c.settings.intro} Turn the topic clouds, bring one forward, or pick a guest to see who shares their themes.</p>
        </div>
        <MapExplorer themes={c.themes} people={c.people} conversations={c.conversations} regions={c.regions} />
      </div>
      {latest && featured && (
        <section>
          <div className="wrap">
            <div className="below">
              <Link className="latest card" href={`/conversations/${latest.id}`}>
                <div className="thumb" style={thumbVars(latest, T)}>
                  <div className="rings" />
                  <span className="dur">{latest.format === 'video' ? <I.Video /> : <I.Audio />} {latest.minutes} min</span>
                  <div className="stack">{latest.guests.map((g) => P[g] && <Av key={g} p={P[g]} size={52} T={T} />)}</div>
                  <span className="play"><I.Play color="#16233A" /></span>
                </div>
                <div className="cbody">
                  <span className="eyebrow">Latest conversation</span>
                  <h3>{latest.title}</h3>
                  <p className="meta">{fmtDate(latest.date)} · With {names(latest.guests, P)}</p>
                  <span className="go">{latest.format === 'video' ? 'Watch' : 'Listen'} now <I.Arrow /></span>
                </div>
              </Link>
              <Link className="feat" href={`/conversations/${featured.id}`}>
                <div className="thumb" style={thumbVars(featured, T)}>
                  <div className="rings" />
                  <span className="dur">{featured.format === 'video' ? <I.Video /> : <I.Audio />} {featured.minutes} min</span>
                  <div className="stack">{featured.guests.map((g) => P[g] && <Av key={g} p={P[g]} size={72} T={T} />)}</div>
                  <span className="play" style={{ width: 56, height: 56 }}><I.Play size={22} color="#16233A" /></span>
                </div>
                <div className="fbody">
                  <span className="eyebrow" style={{ color: '#E8A08B' }}>Featured conversation</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.dek} With {names(featured.guests, P)}.</p>
                  <div className="chips">{featured.tags.map((x) => <span key={x} className="chip">{x}</span>)}</div>
                  <span className="go" style={{ marginTop: 8 }}>{featured.format === 'video' ? 'Watch' : 'Listen'} now <I.Arrow /></span>
                </div>
              </Link>
            </div>
            <p style={{ marginTop: 22, textAlign: 'right' }}>
              <Link className="more serif" href="/conversations" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>All conversations <I.Arrow /></Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
