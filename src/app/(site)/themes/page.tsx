import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { indexes, plural, tvars } from '@/lib/util';
import { Av } from '@/lib/ui';
import * as I from '@/lib/icons';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = { title: 'Themes' };

export default async function ThemesPage() {
  const content = await getContent();
  const { P, T } = indexes(content);
  return (
    <>
      <div className="wrap">
        <div className="phead"><h1>Themes</h1><p className="lead">Curated conversations across the forces shaping our world — from global affairs to the deeper questions of belonging, technology, sport and culture.</p></div>
        <div className="tcards" style={{ marginTop: 28 }}>
          {content.themes.map((t) => {
            const ppl = content.people.filter((p) => p.themes.includes(t.id));
            const n = content.conversations.filter((c) => c.themes.includes(t.id)).length;
            return (
              <Link key={t.id} className="tcard" href={`/themes/${t.id}`}>
                <div className="top art" style={tvars(t)}><h3>{t.short || t.name}</h3><small>{t.tagline}</small><div className="bar2" /></div>
                <div className="bot">
                  <div className="stack">{ppl.slice(0, 3).map((p) => <Av key={p.id} p={p} size={52} T={T} />)}{ppl.length > 3 && <span className="more-n">+{ppl.length - 3}</span>}</div>
                  {t.quote && <blockquote>{t.quote.text}{P[t.quote.by] && <cite>— {P[t.quote.by].name}</cite>}</blockquote>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className="muted" style={{ fontSize: 14 }}>{plural(n, 'conversation')}</span><span className="go">Explore <I.Arrow /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <section><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
