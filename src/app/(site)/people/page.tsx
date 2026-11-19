import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import PeopleBrowser from '@/components/PeopleBrowser';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = { title: 'People' };

export default async function PeoplePage() {
  const content = await getContent();
  return (
    <>
      <div className="wrap">
        <div className="phead"><h1>People</h1><p className="lead">A global community of leaders, creators, athletes, thinkers and change-makers in dialogue.</p></div>
        <PeopleBrowser content={content} />
      </div>
      <section><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
