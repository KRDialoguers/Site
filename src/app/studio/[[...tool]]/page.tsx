import { NextStudio } from 'next-sanity/studio';
import { sanityEnabled } from '@/sanity/env';
import config from '../../../../sanity.config';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <main style={{ maxWidth: 560, margin: '120px auto', fontFamily: 'system-ui', lineHeight: 1.5, padding: 24 }}>
        <h1>Studio not connected yet</h1>
        <p>Set NEXT_PUBLIC_SANITY_PROJECT_ID (see README → “Connect Sanity”) and redeploy. Until then the site shows the sample content.</p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
