import type { Metadata } from 'next';
import Link from 'next/link';
import { Figtree, Libre_Caslon_Display, Libre_Caslon_Text } from 'next/font/google';
import { getContent } from '@/lib/content';
import Header, { type SearchItem } from '@/components/Header';
import '../globals.css';

const caslon = Libre_Caslon_Text({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-caslon' });
const caslonDisplay = Libre_Caslon_Display({ subsets: ['latin'], weight: '400', variable: '--font-caslon-display' });
const figtree = Figtree({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-figtree' });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  return {
    title: { default: `Dialoguers — ${settings.tagline.replace(/\.$/, '')}`, template: '%s — Dialoguers' },
    description: settings.intro,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: { siteName: 'Dialoguers', type: 'website' },
  };
}

const NAV = [['/', 'Map'], ['/conversations', 'Conversations'], ['/themes', 'Themes'], ['/people', 'People'], ['/notes', 'Field Notes'], ['/about', 'About']] as const;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  const T = Object.fromEntries(c.themes.map((t) => [t.id, t]));
  const P = Object.fromEntries(c.people.map((p) => [p.id, p]));
  const search: SearchItem[] = [
    ...c.conversations.map((x) => ({ k: 'Conversation', href: `/conversations/${x.id}`, label: x.title, color: T[x.themes[0]]?.color ?? '#888',
      text: [x.title, x.dek, ...x.tags, ...x.guests.map((g) => P[g]?.name), ...x.themes.map((t) => T[t]?.name)].join(' ') })),
    ...c.people.map((p) => ({ k: 'Person', href: `/people/${p.id}`, label: p.name, color: T[p.themes[0]]?.color ?? '#888', text: [p.name, p.role, p.city, p.region, p.field].join(' ') })),
    ...c.themes.map((t) => ({ k: 'Theme', href: `/themes/${t.id}`, label: t.name, color: t.color, text: [t.name, t.tagline, ...t.subtopics].join(' ') })),
    ...c.notes.map((n) => ({ k: 'Field Note', href: `/notes/${n.id}`, label: `${n.title} ${n.subtitle ?? ''}`.trim(), color: T[n.theme]?.color ?? '#888', text: [n.title, n.subtitle, n.dek].join(' ') })),
  ];
  return (
    <html lang="en" className={`${caslon.variable} ${caslonDisplay.variable} ${figtree.variable}`}>
      <body>
        <Header nav={NAV as unknown as [string, string][]} search={search} />
        <main id="main">{children}</main>
        <footer>
          <div className="wrap">
            <div><Link className="logo" href="/">Dialoguers</Link><p style={{ marginTop: 8 }}>{c.settings.tagline}</p></div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {NAV.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
            </div>
            <p>© Dialoguers</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
