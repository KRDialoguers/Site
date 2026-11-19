import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { indexes } from '@/lib/util';
import { Av } from '@/lib/ui';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const content = await getContent();
  const { T } = indexes(content);
  const { host, contactEmail } = content.settings;
  return (
    <>
      <div className="wrap">
        <div className="phead"><h1>About Dialoguers</h1><p className="lead">A conversation project, a growing archive, and a book in progress.</p></div>
        <div className="about">
          <div className="prose">
            <p>Dialoguers started from a simple observation: the most useful conversations rarely stay inside one field. A diplomat and an athlete end up talking about identity. An urban planner and an engineer end up talking about patience.</p>
            <p>Each conversation is long-form and unhurried, published as video or audio with a transcript. Over time they form a map — of people, of shared questions, and of the places those questions come from.</p>
            <p>The project is hosted by <b style={{ color: 'var(--ink)' }}>{host.name}</b>, who is writing a book about what these conversations reveal about how dialogue works, and why it so often doesn’t.</p>
            <div className="guest" style={{ marginTop: 28 }}><Av p={{ name: host.name }} size={72} T={T} host /><div><b>{host.name}</b><small>{host.role} · {host.location}</small></div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="book">
              <div className="bookcover"><small>{host.name}</small><b>Dialoguers</b><small>Working title</small></div>
              <div><span className="eyebrow" style={{ color: '#E8A08B' }}>The book</span><h2 style={{ margin: '10px 0 12px', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Dialoguers</h2>
                <p style={{ color: '#C9CFDB' }}>A book about conversation as a practice — drawn from the people and questions on this site. Join the list to hear first about chapters, excerpts and publication.</p></div>
            </div>
            <div className="box"><h4>Get in touch</h4><p className="ink2" style={{ fontSize: 15 }}>Suggest a guest, propose a pairing, or ask about speaking and partnerships.</p>
              <p style={{ marginTop: 10, fontFamily: 'var(--serif)', fontSize: 18 }}><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></div>
          </div>
        </div>
      </div>
      <section style={{ paddingTop: 20 }}><div className="wrap"><Newsletter title="Follow the book as it’s written." id="subscribe" /></div></section>
    </>
  );
}
